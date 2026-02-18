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
      const from = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

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

  return httpServer;
}
