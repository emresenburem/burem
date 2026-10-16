import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { applyPageMetadata, resolvePageMetadata } from "./seo-routes";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, { index: false }));

  app.use("/{*path}", async (req, res, next) => {
    const pathname = new URL(req.originalUrl, "https://www.buremelektronik.com").pathname;
    if (pathname.startsWith("/api/") || pathname === "/api") return res.status(404).json({ message: "Not Found" });
    try {
      const meta = await resolvePageMetadata(pathname);
      if (!meta) return res.status(404).type("text/plain").send("Not Found");
      if (meta.canonical && pathname.startsWith("/magaza/urun/") && new URL(meta.canonical).pathname !== pathname) {
        return res.redirect(301, meta.canonical);
      }
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf8");
      const html = applyPageMetadata(template, meta);
      if (meta.noindex) res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      res.status(meta.status ?? 200).type("html").send(html);
    } catch (error) {
      next(error);
    }
  });
}
