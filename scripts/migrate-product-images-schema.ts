/**
 * Prepare the production product gallery schema without deleting or replacing
 * any product rows.
 *
 * Dry-run (default):
 *   TARGET_DATABASE_URL=<prod> npm run migrate:product-images-schema
 *
 * Apply:
 *   TARGET_DATABASE_URL=<prod> npm run migrate:product-images-schema -- --apply
 *
 * This script is intentionally manual and is not part of build/startup.
 */
import pg from "pg";

const APPLY = process.argv.includes("--apply");
const targetUrl = process.env.TARGET_DATABASE_URL;

function getSslConfig(): pg.ClientConfig["ssl"] {
  if (!targetUrl) throw new Error("TARGET_DATABASE_URL tanımlı değil.");

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    throw new Error("TARGET_DATABASE_URL geçerli değil.");
  }

  if (parsedUrl.searchParams.get("sslmode")?.toLowerCase() === "disable") {
    throw new Error("Production bağlantısında SSL zorunludur.");
  }

  const ca = process.env.TARGET_DATABASE_SSL_CA;
  return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}

function createPool() {
  if (!targetUrl) throw new Error("TARGET_DATABASE_URL tanımlı değil.");
  return new pg.Pool({
    connectionString: targetUrl,
    ssl: getSslConfig(),
    connectionTimeoutMillis: 15_000,
    max: 1,
  });
}

const schemaStatements = [
  `
    CREATE TABLE IF NOT EXISTS product_images (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id varchar NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url text NOT NULL,
      cloudinary_public_id text,
      sort_order integer DEFAULT 0,
      is_primary boolean DEFAULT false,
      created_at timestamp DEFAULT now()
    )
  `,
  `
    CREATE INDEX IF NOT EXISTS product_images_product_sort_idx
    ON product_images (product_id, sort_order, created_at)
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_idx
    ON product_images (product_id)
    WHERE is_primary = true
  `,
];

async function runMigration() {
  if (!targetUrl) {
    throw new Error("Hedef veritabanı bulunamadı. TARGET_DATABASE_URL tanımlayın.");
  }

  const pool = createPool();
  try {
    if (!APPLY) {
      const tables = await pool.query<{
        products_exists: boolean;
        product_images_exists: boolean;
      }>(`
        SELECT
          EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'products'
          ) AS products_exists,
          EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'product_images'
           ) AS product_images_exists
      `);
      const row = tables.rows[0];
      console.log(
         `[product-images-schema] Dry-run: hedef bağlantısı başarılı; products=${row?.products_exists ? "mevcut" : "yok"}, product_images=${row?.product_images_exists ? "mevcut" : "yok"}.`,
      );
       console.log("[product-images-schema] DDL çalıştırılmadı. --apply olmadan production değişmez.");
       console.log("[product-images-schema] Apply yalnızca eksik gallery tablosu ve indexlerini oluşturur; mevcut ürün/image satırlarına dokunmaz.");
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const statement of schemaStatements) {
        await client.query(statement);
      }
      await client.query("COMMIT");
      console.log(
        "[product-images-schema] Gallery şeması hazır; yalnızca eksik tablo ve indexler oluşturuldu.",
      );
    } catch {
      await client.query("ROLLBACK").catch(() => undefined);
      throw new Error("Product gallery production şeması oluşturulamadı.");
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error(
    "[product-images-schema] Migration başarısız.",
    error instanceof Error ? error.message : "Bilinmeyen hata",
  );
  process.exitCode = 1;
});