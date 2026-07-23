import type { Express } from "express";
import { createServer, type Server } from "http";
import { Resend } from "resend";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/brand/:brand", async (req, res) => {
    const products = await storage.getProductsByBrand(req.params.brand);
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

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

  app.post("/api/products", async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.put("/api/products/:id", async (req, res) => {
    const parsed = insertProductSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const product = await storage.updateProduct(req.params.id, parsed.data);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    const deleted = await storage.deleteProduct(req.params.id);
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
