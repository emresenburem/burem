import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { Resend } from "resend";
import { z } from "zod";
import multer from "multer";
import { storage } from "./storage";
import { insertProductSchema, inventoryProductUpsertSchema } from "@shared/schema";
import {
  createServiceRecord,
  getServiceRecords,
  queryServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
  getServiceSettings,
  updateServiceSettings,
} from "./service-storage";
import { sendNotification, buildWelcomeMessage, buildStatusMessage } from "./notification";
import {
  isProductImageStorageConfigured,
  deleteProductImageAsset,
  uploadProductImageBuffer,
  uploadProductImageDataUrl,
} from "./product-images";
import {
  csrfProtection,
  getCsrfToken,
  hasActiveAdminSession,
  isStateChangingMethod,
  touchAdminSession,
  verifyTotp,
  SESSION_COOKIE_NAME,
} from "./admin-security";
import { isValidInventorySyncAuthorization } from "./inventory-sync-auth";
import {
  INVENTORY_IMAGE_MIME_TYPES,
  inventoryImageManifestSchema,
  inventoryImagePublicId,
  MAX_INVENTORY_IMAGE_BYTES,
  MAX_INVENTORY_IMAGES,
} from "./inventory-image-sync";

const STATUS_LABELS: Record<number, string> = {
  1: "Teslim Alındı",
  2: "Arıza Tespiti / İncelemede",
  3: "Müşteri Onayı Bekleniyor",
  4: "Parça Bekleniyor",
  5: "Onarım & Yük Testinde",
  6: "Teslimata Hazır",
};

function securityLog(event: string) {
  console.info(`[security] ${event}`);
}

function authorizeInventorySyncRequest(req: Request, res: Response): boolean {
  const configuredSecret = process.env.INVENTORY_SYNC_SECRET;
  if (!configuredSecret) {
    res.status(503).json({ error: "inventory_sync_not_configured" });
    return false;
  }
  if (!isValidInventorySyncAuthorization(req.get("authorization"), configuredSecret)) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

const inventoryImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_INVENTORY_IMAGES,
    fileSize: MAX_INVENTORY_IMAGE_BYTES,
    fields: 1,
    fieldSize: 16 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!INVENTORY_IMAGE_MIME_TYPES.includes(file.mimetype as (typeof INVENTORY_IMAGE_MIME_TYPES)[number])) {
      callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
      return;
    }
    callback(null, true);
  },
});

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!hasActiveAdminSession(req)) {
    if ((req.session as any)?.adminLoggedIn) {
      req.session.destroy(() => undefined);
    }
    return res.status(401).json({ error: "Yetkisiz" });
  }

  touchAdminSession(req);
  if (isStateChangingMethod(req.method)) {
    return csrfProtection(req, res, next);
  }
  next();
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Eski siteye ait URL'leri ana sayfaya yönlendir
  app.get("/default.asp", (_req, res) => res.redirect(301, "/"));
  app.get("/Default.asp", (_req, res) => res.redirect(301, "/"));

  /* ══ Admin Auth ══════════════════════════════════════════════ */
  const loginAttempts = new Map<string, { startedAt: number; failures: number }>();
  const LOGIN_WINDOW_MS = 15 * 60 * 1000;
  const LOGIN_FAILURE_LIMIT = 5;
  const attemptKey = (type: "ip" | "user", value: string) => `${type}:${value}`;
  const normalizedLoginUser = (value: unknown) =>
    typeof value === "string" ? value.trim().toLocaleLowerCase("tr-TR").slice(0, 120) : "";

  function pruneLoginAttempts() {
    if (loginAttempts.size < 10_000) return;
    const now = Date.now();
    loginAttempts.forEach((attempt, key) => {
      if (now - attempt.startedAt >= LOGIN_WINDOW_MS) loginAttempts.delete(key);
    });
  }

  function isLoginRateLimited(keys: string[]) {
    const now = Date.now();
    return keys.some((key) => {
      const attempt = loginAttempts.get(key);
      if (!attempt || now - attempt.startedAt >= LOGIN_WINDOW_MS) {
        if (attempt) loginAttempts.delete(key);
        return false;
      }
      return attempt.failures >= LOGIN_FAILURE_LIMIT;
    });
  }

  function recordFailedLogin(keys: string[]) {
    pruneLoginAttempts();
    const now = Date.now();
    for (const key of keys) {
      const previous = loginAttempts.get(key);
      if (!previous || now - previous.startedAt >= LOGIN_WINDOW_MS) {
        loginAttempts.set(key, { startedAt: now, failures: 1 });
      } else {
        previous.failures += 1;
      }
    }
  }

  function clearLoginRateLimit(keys: string[]) {
    keys.forEach((key) => loginAttempts.delete(key));
  }

  // Every state-changing /api/admin request gets CSRF protection. All future
  // admin endpoints are private by default, except login, csrf and logout.
  app.use("/api/admin", (req, res, next) => {
    if (req.path === "/login" || req.path === "/csrf" || req.path === "/logout") {
      return csrfProtection(req, res, next);
    }
    requireAdmin(req, res, next);
  });

  app.get("/api/admin/csrf", (req, res) => {
    res.json({ csrfToken: getCsrfToken(req) });
  });

  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body ?? {};
    const keys = [
      attemptKey("ip", req.ip ?? "unknown"),
      attemptKey("user", normalizedLoginUser(username)),
    ];
    if (isLoginRateLimited(keys)) {
      securityLog("admin_login_rate_limited");
      return res.status(429).json({ error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." });
    }

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!adminUser || !adminPass) {
      securityLog("admin_login_unavailable");
      return res.status(503).json({ error: "Admin girişi şu anda kullanılamıyor" });
    }

    const totpRequired = Boolean(process.env.ADMIN_TOTP_SECRET);
    const totpValid = !totpRequired || verifyTotp(process.env.ADMIN_TOTP_SECRET, req.body?.totp);
    if (username === adminUser && password === adminPass && totpValid) {
      return req.session.regenerate((error) => {
        if (error) {
          securityLog("admin_login_session_error");
          return res.status(500).json({ error: "Giriş yapılamadı" });
        }
        const nextSession = req.session as any;
        nextSession.adminLoggedIn = true;
        nextSession.adminLastActivity = Date.now();
        nextSession.csrfToken = getCsrfToken(req);
        clearLoginRateLimit(keys);
        securityLog("admin_login_success");
        req.session.save((saveError) => {
          if (saveError) return res.status(500).json({ error: "Giriş yapılamadı" });
          res.json({ ok: true });
        });
      });
    }

    recordFailedLogin(keys);
    securityLog("admin_login_failed");
    res.status(401).json({ error: "Giriş bilgileri hatalı" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      res.json({ ok: true });
    });
  });

  app.get("/api/admin/me", requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });

  /* ══ Servis Takip ════════════════════════════════════════════ */

  // Müşteri sorgulama (public) — Burem İş Takip üzerinden
  app.get("/api/service/query", async (req, res) => {
    const q = String(req.query.q ?? "").trim();

    if (!q) {
      return res.status(400).json({ error: "q parametresi zorunlu" });
    }

    try {
      const url =
        "https://ce812aba-a843-4bc0-9c3c-8a98a65d447b-00-1zcn3g85lam95.sisko.replit.dev" +
        "/api/public/service-query?q=" +
        encodeURIComponent(q);

      const upstream = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      const text = await upstream.text();

      if (!upstream.ok) {
        if (upstream.status === 404) {
          return res.status(404).json({ error: "Kayıt bulunamadı" });
        }

        console.error("İş Takip servis sorgu hatası:", upstream.status, text);

        return res.status(502).json({
          error: "Servis takip sistemine ulaşılamadı",
        });
      }

      const record = JSON.parse(text);

      // Teknik detaylar müşteriye kesinlikle aktarılmaz.
      return res.json({
        id: String(record.id ?? ""),
        trackingNo: record.trackingNo,
        customerName: record.customerName,
        deviceModel: record.deviceModel,
        status: record.status,
        technicianNote: null,
        updatedAt: record.updatedAt,
        createdAt: record.createdAt,
      });
    } catch (error) {
      console.error("İş Takip bağlantı hatası:", error);

      return res.status(502).json({
        error: "Servis takip sistemine ulaşılamadı",
      });
    }
  });

  // Admin: tüm kayıtlar
  app.get("/api/service", requireAdmin, async (_req, res) => {
    const records = await getServiceRecords();
    res.json(records);
  });

  // Admin: yeni kayıt
  app.post("/api/service", requireAdmin, async (req, res) => {
    const { customerName, customerPhone, deviceModel, faultDescription, technicianNote, sendNotif } = req.body ?? {};
    if (!customerName || !customerPhone || !deviceModel || !faultDescription) {
      return res.status(400).json({ error: "Zorunlu alanlar eksik" });
    }
    const record = await createServiceRecord({ customerName, customerPhone, deviceModel, faultDescription, technicianNote: technicianNote || null, status: 1 });
    // Bildirim
    if (sendNotif) {
      const settings = await getServiceSettings();
      const siteUrl = settings.siteUrl || "https://www.buremelektronik.com";
      const msg = buildWelcomeMessage(record.trackingNo, siteUrl);
      sendNotification(settings as any, record.customerPhone, msg); // fire & forget
    }
    res.status(201).json(record);
  });

  // Admin: durum güncelle
  app.put("/api/service/:id", requireAdmin, async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, technicianNote, sendNotif } = req.body ?? {};
    const record = await updateServiceRecord(id, {
      ...(status !== undefined ? { status: Number(status) } : {}),
      ...(technicianNote !== undefined ? { technicianNote } : {}),
    });
    if (!record) return res.status(404).json({ error: "Kayıt bulunamadı" });
    if (sendNotif && status) {
      const settings = await getServiceSettings();
      const siteUrl = settings?.siteUrl || "https://www.buremelektronik.com";
      const statusLabel = STATUS_LABELS[Number(status)] ?? String(status);
      const msg = buildStatusMessage(record.trackingNo, statusLabel, siteUrl);
      sendNotification(settings as any, record.customerPhone, msg); // fire & forget
    }
    res.json(record);
  });

  // Admin: kayıt sil
  app.delete("/api/service/:id", requireAdmin, async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await deleteServiceRecord(id);
    if (!deleted) return res.status(404).json({ error: "Kayıt bulunamadı" });
    res.status(204).send();
  });

  // Admin: ayarlar oku — hassas alanları maskeleyerek döndür
  app.get("/api/service/settings", requireAdmin, async (_req, res) => {
    const s = await getServiceSettings();
    const MASK = "••••••••";
    res.json({
      notifType: s.notifType,
      netgsmUser: s.netgsmUser || "",
      netgsmPass: s.netgsmPass ? MASK : "",
      netgsmHeader: s.netgsmHeader || "",
      greenApiInstance: s.greenApiInstance || "",
      greenApiToken: s.greenApiToken ? MASK : "",
      siteUrl: s.siteUrl || "https://www.buremelektronik.com",
    });
  });

  // Admin: ayarlar güncelle — maskelenmiş değerleri atla (değişmemiş alan)
  app.put("/api/service/settings", requireAdmin, async (req, res) => {
    const { notifType, netgsmUser, netgsmPass, netgsmHeader, greenApiInstance, greenApiToken, siteUrl } = req.body ?? {};
    const MASK = "••••••••";
    const patch: Record<string, unknown> = { notifType, netgsmUser, netgsmHeader, greenApiInstance, siteUrl };
    if (netgsmPass && netgsmPass !== MASK) patch.netgsmPass = netgsmPass;
    if (greenApiToken && greenApiToken !== MASK) patch.greenApiToken = greenApiToken;
    await updateServiceSettings(patch as Parameters<typeof updateServiceSettings>[0]);
    res.json({ ok: true });
  });

  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products.map(({ sourceInventoryDeviceId: _sourceId, ...product }) => product));
  });

  app.get("/api/admin/products", requireAdmin, async (_req, res) => {
    res.json(await storage.getAllProducts());
  });

  app.get("/api/products/brand/:brand", async (req, res) => {
    const products = await storage.getProductsByBrand(req.params.brand);
    res.json(products.map(({ sourceInventoryDeviceId: _sourceId, ...product }) => product));
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product || product.isPublished === false) {
      return res.status(404).json({ error: "Product not found" });
    }
    const { sourceInventoryDeviceId: _sourceId, ...publicProduct } = product;
    res.json(publicProduct);
  });

  app.get(
    "/api/internal/inventory-products/:sourceInventoryDeviceId",
    async (req, res) => {
      if (!authorizeInventorySyncRequest(req, res)) return;

      try {
        const product = await storage.getInventoryProductBySourceDeviceId(
          req.params.sourceInventoryDeviceId,
        );
        if (!product) {
          return res.status(404).json({ error: "inventory_product_not_found" });
        }
        return res.json(product);
      } catch {
        console.error("[inventory-sync] Product lookup failed.");
        return res.status(500).json({ error: "inventory_product_lookup_failed" });
      }
    },
  );

  app.delete(
    "/api/internal/inventory-products/:sourceInventoryDeviceId",
    async (req, res) => {
      if (!authorizeInventorySyncRequest(req, res)) return;

      try {
        const deleted = await storage.deleteInventoryProductBySourceDeviceId(
          req.params.sourceInventoryDeviceId,
        );
        if (!deleted) {
          return res.status(404).json({ error: "inventory_product_not_found" });
        }
        return res.json({ success: true, deleted: true });
      } catch {
        console.error("[inventory-sync] Product cleanup failed.");
        return res.status(500).json({ error: "inventory_product_cleanup_failed" });
      }
    },
  );

  app.post("/api/internal/inventory-products/upsert", async (req, res) => {
    if (!authorizeInventorySyncRequest(req, res)) return;

    const parsed = inventoryProductUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "invalid_payload",
        details: parsed.error.flatten(),
      });
    }

    try {
      const result = await storage.upsertInventoryProduct(parsed.data);
      return res
        .status(result.action === "created" ? 201 : 200)
        .json({
          success: true,
          productId: result.product.id,
          sourceInventoryDeviceId: result.product.sourceInventoryDeviceId,
          action: result.action,
        });
    } catch {
      console.error("[inventory-sync] Product upsert failed.");
      return res.status(500).json({ error: "inventory_product_upsert_failed" });
    }
  });

  app.post(
    "/api/internal/inventory-products/:sourceInventoryDeviceId/images",
    async (req, res) => {
      if (!authorizeInventorySyncRequest(req, res)) return;
      if (!req.is("multipart/form-data")) {
        return res.status(415).json({ error: "multipart_form_data_required" });
      }

      const sourceInventoryDeviceId = String(req.params.sourceInventoryDeviceId ?? "").trim();
      if (!sourceInventoryDeviceId) {
        return res.status(400).json({ error: "source_inventory_device_id_required" });
      }

      try {
        await new Promise<void>((resolve, reject) => {
          inventoryImageUpload.array("files", MAX_INVENTORY_IMAGES)(req, res, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      } catch (error) {
        const tooLarge = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
        return res.status(tooLarge ? 413 : 400).json({
          error: tooLarge ? "image_too_large" : "invalid_multipart_upload",
        });
      }

      const files = (req as Request & { files?: Express.Multer.File[] }).files ?? [];
      let manifestValue: unknown;
      try {
        manifestValue = JSON.parse(String(req.body?.manifest ?? ""));
      } catch {
        return res.status(400).json({ error: "invalid_image_manifest" });
      }
      const parsedManifest = inventoryImageManifestSchema.safeParse(manifestValue);
      if (
        !parsedManifest.success ||
        files.length === 0 ||
        files.length !== parsedManifest.data?.length ||
        parsedManifest.data.some((item) => item.fileIndex >= files.length) ||
        new Set(parsedManifest.data.map((item) => item.fileIndex)).size !== files.length
      ) {
        return res.status(400).json({ error: "invalid_image_manifest" });
      }
      if (!isProductImageStorageConfigured()) {
        return res.status(503).json({ error: "image_storage_not_configured" });
      }

      const productId = await storage.getInventoryProductBySourceDeviceId(sourceInventoryDeviceId);
      if (!productId) {
        return res.status(404).json({ error: "inventory_product_not_found" });
      }

      try {
        const uploadedImages = [];
        for (const item of parsedManifest.data) {
          const uploaded = await uploadProductImageBuffer(
            files[item.fileIndex].buffer,
            files[item.fileIndex].mimetype as (typeof INVENTORY_IMAGE_MIME_TYPES)[number],
            inventoryImagePublicId(sourceInventoryDeviceId, item.attachmentId),
          );
          uploadedImages.push({ ...item, imageUrl: uploaded.url, cloudinaryPublicId: uploaded.publicId });
        }

        const result = await storage.syncInventoryProductImages(sourceInventoryDeviceId, uploadedImages);
        const cleanupResults = await Promise.allSettled(
          result.removedPublicIds.map((publicId) => deleteProductImageAsset(publicId)),
        );
        const cloudinaryCleanupPending = cleanupResults.some((cleanup) => cleanup.status === "rejected");
        if (cloudinaryCleanupPending) {
          console.error("[inventory-sync] Stale image asset cleanup is pending.");
        }

        return res.status(200).json({
          success: true,
          productId: result.productId,
          sourceInventoryDeviceId,
          uploaded: result.uploaded,
          updated: result.updated,
          removed: result.removed,
          primaryImageUrl: result.primaryImageUrl,
          cloudinaryCleanupPending,
        });
      } catch (error) {
        const limitExceeded =
          error instanceof Error && error.message === "Inventory product image limit exceeded";
        console.error(
          "[inventory-sync] Product image sync failed.",
          limitExceeded ? "image_limit_exceeded" : "upload_or_storage_error",
        );
        if (limitExceeded) {
          return res.status(400).json({ error: "inventory_product_image_limit_exceeded" });
        }
        return res.status(502).json({ error: "inventory_product_image_sync_failed" });
      }
    },
  );

  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body ?? {};

      if (!name || !email || !message) {
        return res.status(400).json({ error: "name, email, message zorunlu" });
      }

      if (!resend) {
        return res.status(503).json({ error: "E-posta servisi yapılandırılmamış" });
      }

      const to = process.env.CONTACT_TO_EMAIL || "info@buremelektronik.com";
      const from = process.env.CONTACT_FROM_EMAIL || "noreply@buremelektronik.com";

      const { data, error } = await resend.emails.send({
        from,
        to,
        subject: subject ? `Teklif: ${subject}` : "Web Sitesi Teklif Formu",
        replyTo: email,
        text:
          `Yeni teklif/iletişim formu:\n\n` +
          `İsim: ${name}\n` +
          `E-posta: ${email}\n` +
          `Telefon: ${phone || "-"}\n` +
          `Konu: ${subject || "-"}\n\n` +
          `Mesaj:\n${message}\n`,
      });

      if (error) {
        console.error("Resend API error:", JSON.stringify(error));
        return res.status(500).json({ error: error.message || "Mail gönderilemedi" });
      }

      console.log("Email sent successfully:", JSON.stringify(data));
      return res.json({ ok: true });
    } catch (err) {
      console.error("contact mail error:", err);
      return res.status(500).json({ error: "Mail gönderilemedi" });
    }
  });


  app.post("/api/fault-report", async (req, res) => {
    try {
      const { deviceLabel, brand, model, errorCode, faultDesc, name, phone, userEmail } = req.body ?? {};

      if (!deviceLabel || !brand || !model || !faultDesc || !name) {
        return res.status(400).json({ error: "Zorunlu alanlar eksik" });
      }

      // Burem İş Takip'e otomatik kayıt oluştur
      try {
        const r = await fetch("https://ce812aba-a843-4bc0-9c3c-8a98a65d447b-00-1zcn3g85lam95.sisko.replit.dev/api/public/fault-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: name,
            phone,
            deviceBrand: brand,
            deviceModel: model,
            serialNumber: "",
            faultDescription: faultDesc,
          }),
        });

        console.log("İş Takip HTTP:", r.status);
        console.log(await r.text());

      } catch (err) {
        console.error("İş takip kayıt hatası:", err);
      }

      if (!resend) {
        return res.json({ ok: true, warning: "E-posta servisi yapılandırılmamış" });
      }

      const to   = process.env.CONTACT_TO_EMAIL   || "info@buremelektronik.com";
      // onboarding@resend.dev domain doğrulaması gerektirmez (tüm Resend hesaplarında çalışır)
      const from = process.env.CONTACT_FROM_EMAIL || "Burem Elektronik <onboarding@resend.dev>";

      const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr><td style="background:#111111;padding:24px 32px">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px">🔧 Burem Elektronik</p>
          <p style="margin:4px 0 0;color:#888888;font-size:13px">Yeni Arıza Bildirimi</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="padding-bottom:16px;border-bottom:1px solid #f0f0f0;margin-bottom:16px">
              <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px">Cihaz Bilgileri</p>
            </td></tr>
            <tr>
              <td style="padding:8px 0;width:140px;font-size:13px;color:#888">Cihaz Türü</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111">${deviceLabel}</td>
            </tr>
            <tr style="background:#f9f9f9">
              <td style="padding:8px 12px;font-size:13px;color:#888">Marka</td>
              <td style="padding:8px 12px;font-size:14px;font-weight:600;color:#111">${brand}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#888">Model</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111">${model}</td>
            </tr>
            ${errorCode ? `
            <tr style="background:#f9f9f9">
              <td style="padding:8px 12px;font-size:13px;color:#888">Hata Kodu</td>
              <td style="padding:8px 12px;font-size:14px;font-weight:600;color:#e55">⚠️ ${errorCode}</td>
            </tr>` : ""}
            <tr><td colspan="2" style="padding:20px 0 8px">
              <p style="margin:0 0 8px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px">Arıza Açıklaması</p>
              <div style="background:#f4f4f5;border-radius:8px;padding:14px;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap">${faultDesc.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
            </td></tr>
            <tr><td colspan="2" style="padding:16px 0 0;border-top:1px solid #f0f0f0">
              <p style="margin:0 0 10px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px">İletişim</p>
            </td></tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#888">Ad Soyad</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111">${name}</td>
            </tr>
            ${phone ? `
            <tr style="background:#f9f9f9">
              <td style="padding:6px 12px;font-size:13px;color:#888">Telefon</td>
              <td style="padding:6px 12px;font-size:14px;font-weight:600;color:#111">
                <a href="tel:${phone}" style="color:#111;text-decoration:none">${phone}</a>
              </td>
            </tr>` : ""}
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eeeeee">
          <p style="margin:0;font-size:12px;color:#aaa;text-align:center">Bu e-posta buremelektronik.com arıza bildirim formundan iletilmiştir.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const { data, error } = await resend.emails.send({
        from,
        to,
        subject: `Arıza Bildirimi: ${brand} ${model} — ${name}`,
        html,
        ...(userEmail ? { replyTo: userEmail } : {}),
      });

      if (error) {
        console.error("fault-report mail error:", JSON.stringify(error));
        return res.status(500).json({ error: error.message || "Mail gönderilemedi" });
      }

      console.log("Fault report email sent:", JSON.stringify(data));
      return res.json({ ok: true });
    } catch (err) {
      console.error("fault-report error:", err);
      return res.status(500).json({ error: "Mail gönderilemedi" });
    }
  });

  app.post("/api/admin/products/image", requireAdmin, async (req, res) => {
    const dataUrl = req.body?.dataUrl;
    if (typeof dataUrl !== "string") {
      return res.status(400).json({ error: "Görsel verisi zorunlu" });
    }

    if (!isProductImageStorageConfigured()) {
      return res.status(503).json({ error: "Kalıcı görsel depolama yapılandırılmamış" });
    }

    try {
      const uploaded = await uploadProductImageDataUrl(dataUrl);
      return res.status(201).json({ url: uploaded.url });
    } catch (error) {
      console.error(
        "[products] Cloudinary upload failed:",
        error instanceof Error ? error.message : "unknown error",
      );
      return res.status(502).json({ error: "Görsel kalıcı depolamaya yüklenemedi" });
    }
  });

  app.post("/api/admin/products/:id/images", requireAdmin, async (req, res) => {
    const parsed = z.object({
      dataUrl: z.string().min(1),
      isPrimary: z.boolean().optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Görsel verisi zorunlu" });
    }

    if (!isProductImageStorageConfigured()) {
      return res.status(503).json({ error: "Kalıcı görsel depolama yapılandırılmamış" });
    }

    let uploaded: { url: string; publicId: string } | undefined;
    try {
      uploaded = await uploadProductImageDataUrl(parsed.data.dataUrl);
      const image = await storage.createProductImage(String(req.params.id), {
        imageUrl: uploaded.url,
        cloudinaryPublicId: uploaded.publicId,
        isPrimary: parsed.data.isPrimary,
      });
      return res.status(201).json(image);
    } catch (error) {
      if (uploaded?.publicId) {
        await deleteProductImageAsset(uploaded.publicId).catch((cleanupError) => {
          console.error(
            "[products] Orphan Cloudinary asset cleanup failed:",
            cleanupError instanceof Error ? cleanupError.message : "unknown error",
          );
        });
      }
      if (error instanceof Error && error.message === "Product not found") {
        return res.status(404).json({ error: "Product not found" });
      }
      if (error instanceof Error && error.message.includes("en fazla 8 görsel")) {
        return res.status(400).json({ error: error.message });
      }
      console.error(
        "[products] Product image upload failed:",
        error instanceof Error ? error.message : "unknown error",
      );
      return res.status(502).json({ error: "Görsel ürüne eklenemedi" });
    }
  });

  app.put("/api/admin/products/:id/images/reorder", requireAdmin, async (req, res) => {
    const parsed = z.object({
      imageIds: z.array(z.string().min(1)).max(8),
    }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Geçerli bir görsel sıralaması gönderin" });
    }

    try {
      const images = await storage.reorderProductImages(
        String(req.params.id),
        parsed.data.imageIds,
      );
      return res.json(images);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Görseller sıralanamadı",
      });
    }
  });

  app.put("/api/admin/products/:id/images/:imageId/primary", requireAdmin, async (req, res) => {
    const image = await storage.setPrimaryProductImage(
      String(req.params.id),
      String(req.params.imageId),
    );
    if (!image) {
      return res.status(404).json({ error: "Görsel bulunamadı" });
    }
    res.json(image);
  });

  app.delete("/api/admin/products/:id/images/:imageId", requireAdmin, async (req, res) => {
    const image = await storage.deleteProductImage(
      String(req.params.id),
      String(req.params.imageId),
    );
    if (!image) {
      return res.status(404).json({ error: "Görsel bulunamadı" });
    }

    try {
      await deleteProductImageAsset(image.cloudinaryPublicId);
    } catch (error) {
      console.error(
        "[products] Cloudinary asset deletion failed:",
        error instanceof Error ? error.message : "unknown error",
      );
      return res.status(502).json({
        error: "Görsel kaydı silindi ancak Cloudinary görseli kaldırılamadı",
      });
    }

    res.status(204).send();
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const product = await storage.updateProduct(String(req.params.id), parsed.data);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteProduct(String(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send();
  });

  app.get("/api/img-proxy", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("Missing url");
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const ct = r.headers.get("content-type") ?? "image/png";
      const buf = await r.arrayBuffer();
      res.setHeader("Content-Type", ct);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(buf));
    } catch {
      res.status(502).send("Failed to fetch image");
    }
  });

  return httpServer;
}
