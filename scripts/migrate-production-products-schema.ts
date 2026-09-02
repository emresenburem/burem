/**
 * Create the production products schema without changing existing data.
 *
 * Dry-run (default; connects only to inspect whether the table exists):
 *   TARGET_DATABASE_URL=<prod> npm run migrate:products-schema
 *
 * Apply:
 *   TARGET_DATABASE_URL=<prod> npm run migrate:products-schema -- --apply
 *
 * The apply path uses only guarded CREATE TABLE/INDEX statements. It never
 * changes an existing table or row.
 */
import pg from "pg";

const APPLY = process.argv.includes("--apply");
const targetUrl = process.env.TARGET_DATABASE_URL;

const schemaStatements = [
  `
    CREATE TABLE IF NOT EXISTS products (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      brand text NOT NULL,
      category text NOT NULL,
      description text,
      image_url text,
      part_number text,
      price numeric(12, 2),
      condition text DEFAULT 'new',
      in_stock boolean DEFAULT true
    )
  `,
  `
    CREATE INDEX IF NOT EXISTS products_brand_idx
    ON products (brand)
  `,
];

function getSslConfig(): pg.ClientConfig["ssl"] {
  if (!targetUrl) {
    throw new Error("TARGET_DATABASE_URL tanımlı değil.");
  }

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
  return {
    rejectUnauthorized: true,
    ...(ca ? { ca } : {}),
  };
}

function createPool(): pg.Pool {
  if (!targetUrl) {
    throw new Error("TARGET_DATABASE_URL tanımlı değil.");
  }

  return new pg.Pool({
    connectionString: targetUrl,
    ssl: getSslConfig(),
    connectionTimeoutMillis: 15_000,
    max: 1,
  });
}

async function runMigration() {
  if (!targetUrl) {
    throw new Error(
      "Hedef veritabanı bulunamadı. TARGET_DATABASE_URL tanımlayın.",
    );
  }

  const pool = createPool();

  try {
    if (!APPLY) {
      const result = await pool.query<{ products_exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'products'
        ) AS products_exists
      `);

      const exists = result.rows[0]?.products_exists === true;
      console.log(
        `[products-schema] Dry-run: hedef bağlantısı başarılı; products tablosu ${exists ? "mevcut" : "yok"}.`,
      );
      console.log(
        "[products-schema] DDL çalıştırılmadı. --apply olmadan production şeması değişmez.",
      );
      console.log(
        `[products-schema] Uygulanacak güvenli ifadeler: ${schemaStatements.length} guarded CREATE.`,
      );
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
        "[products-schema] Production products şeması hazır. Mevcut tablo ve kayıtlar korunmuştur.",
      );
    } catch {
      await client.query("ROLLBACK").catch(() => undefined);
      throw new Error("Production products şeması oluşturulamadı.");
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error(
    "[products-schema] Migration başarısız.",
    error instanceof Error ? error.message : "Bilinmeyen hata",
  );
  process.exitCode = 1;
});