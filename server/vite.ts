import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { applyPageMetadata, resolvePageMetadata } from "./seo-routes";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;
    const pathname = new URL(req.originalUrl, "https://www.buremelektronik.com").pathname;
    if (pathname.startsWith("/@") || pathname.startsWith("/src/") || pathname.startsWith("/node_modules/") || path.extname(pathname)) {
      return next();
    }

    try {
      if (pathname.startsWith("/api/") || pathname === "/api") return res.status(404).json({ message: "Not Found" });
      const meta = await resolvePageMetadata(pathname);
      if (!meta) return res.status(404).type("text/plain").send("Not Found");
      if (meta.canonical && pathname.startsWith("/magaza/urun/") && new URL(meta.canonical).pathname !== pathname) {
        return res.redirect(301, meta.canonical);
      }
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = applyPageMetadata(await vite.transformIndexHtml(url, template), meta);
      res.status(meta.status ?? 200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
  app.use(vite.middlewares);
}
