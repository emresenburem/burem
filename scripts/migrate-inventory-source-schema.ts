/**
 * Add the website-to-inventory source key to the existing products table.
 *
 * Dry-run (default):
 *   TARGET_DATABASE_URL=<website database> npm run migrate:inventory-source-schema
 *
 * Apply only after reviewing the printed SQL:
 *   TARGET_DATABASE_URL=<website database> npm run migrate:inventory-source-schema -- --apply
 *
 * This migration is additive only; it does not rewrite or delete product rows.
 */
import pg from "pg";

const APPLY = process.argv.includes("--apply");
const targetUrl = process.env.TARGET_DATABASE_URL;

const addColumnSql =
  'ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "source_inventory_device_id" text;';
const addPublishColumnSql =
  'ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "is_published" boolean;';
const createIndexSql =
  'CREATE UNIQUE INDEX IF NOT EXISTS "products_source_inventory_device_id_unique" ON "public"."products" ("source_inventory_device_id");';

function sslConfig(): pg.ClientConfig["ssl"] {
  if (!targetUrl) throw new Error("TARGET_DATABASE_URL tanımlı değil.");
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    throw new Error("TARGET_DATABASE_URL geçerli değil.");
  }
  const sslMode = parsedUrl.searchParams.get("sslmode")?.toLowerCase();
  if (sslMode === "disable" || sslMode === "no-verify") {
    throw new Error("Hedef veritabanı bağlantısında SSL zorunludur.");
  }
  return {
    rejectUnauthorized: true,
    ...(process.env.TARGET_DATABASE_SSL_CA
      ? { ca: process.env.TARGET_DATABASE_SSL_CA }
      : {}),
  };
}

async function run() {
  if (!targetUrl) throw new Error("TARGET_DATABASE_URL tanımlı değil.");

  const pool = new pg.Pool({
    connectionString: targetUrl,
    ssl: sslConfig(),
    connectionTimeoutMillis: 15_000,
    max: 1,
  });

  try {
    const table = await pool.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'products'
      ) AS exists
    `);
    if (!table.rows[0]?.exists) {
      throw new Error('public.products bulunamadı; tablo oluşturulmadı.');
    }

    const column = await pool.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'source_inventory_device_id'
      ) AS exists
    `);
    const publishColumn = await pool.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'is_published'
      ) AS exists
    `);
    const index = await pool.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'products_source_inventory_device_id_unique'
      ) AS exists
    `);

    const columnExists = column.rows[0]?.exists === true;
    const publishColumnExists = publishColumn.rows[0]?.exists === true;
    const indexExists = index.rows[0]?.exists === true;
    if (columnExists) {
      const duplicates = await pool.query(`
        SELECT source_inventory_device_id
        FROM public.products
        WHERE source_inventory_device_id IS NOT NULL
        GROUP BY source_inventory_device_id
        HAVING COUNT(*) > 1
        LIMIT 1
      `);
      if (duplicates.rowCount) {
        throw new Error("Kaynak cihaz ID tekrarları var; unique index oluşturulmadı.");
      }
    }

    console.log(`[inventory-source-schema] ${APPLY ? "Apply" : "Dry-run"}.`);
    console.log(`source_inventory_device_id sütunu: ${columnExists ? "mevcut" : "eksik"}`);
    console.log(`is_published sütunu: ${publishColumnExists ? "mevcut" : "eksik"}`);
    console.log(`unique index: ${indexExists ? "mevcut" : "eksik"}`);
    if (!publishColumnExists) console.log(addPublishColumnSql);
    if (!columnExists) console.log(addColumnSql);
    if (!indexExists) console.log(createIndexSql);

    if (!APPLY) {
      console.log("[inventory-source-schema] Dry-run: DDL çalıştırılmadı.");
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (!publishColumnExists) await client.query(addPublishColumnSql);
      if (!columnExists) await client.query(addColumnSql);
      if (!indexExists) await client.query(createIndexSql);
      await client.query("COMMIT");
      console.log("[inventory-source-schema] Additive migration tamamlandı.");
    } catch {
      await client.query("ROLLBACK").catch(() => undefined);
      throw new Error("Inventory source migration başarısız.");
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error(
    "[inventory-source-schema] Migration başarısız.",
    error instanceof Error ? error.message : "Bilinmeyen hata",
  );
  process.exitCode = 1;
});
