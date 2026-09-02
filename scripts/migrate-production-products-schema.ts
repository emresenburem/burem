/**
 * Inspect and, only with --apply, add missing products schema columns.
 *
 * Dry-run (default; never executes DDL):
 *   TARGET_DATABASE_URL=<prod> npm run migrate:products-schema
 *
 * Apply:
 *   TARGET_DATABASE_URL=<prod> npm run migrate:products-schema -- --apply
 *
 * The apply path is additive only. It never drops, renames, changes types,
 * deletes rows, or updates existing product data.
 */
import pg from "pg";

const APPLY = process.argv.includes("--apply");
const targetUrl = process.env.TARGET_DATABASE_URL;

type ProductColumnDefinition = {
  name: string;
  description: string;
  alterStatement?: string;
};

const productColumnDefinitions: ProductColumnDefinition[] = [
  { name: "id", description: "varchar PRIMARY KEY DEFAULT gen_random_uuid()" },
  { name: "name", description: "text NOT NULL" },
  { name: "brand", description: "text NOT NULL" },
  { name: "category", description: "text NOT NULL" },
  {
    name: "description",
    description: "text",
    alterStatement: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" text;',
  },
  {
    name: "image_url",
    description: "text",
    alterStatement: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image_url" text;',
  },
  {
    name: "part_number",
    description: "text",
    alterStatement: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "part_number" text;',
  },
  {
    name: "price",
    description: "numeric(12,2)",
    alterStatement: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price" numeric(12, 2);',
  },
  {
    name: "currency",
    description: "text DEFAULT 'TRY'",
    alterStatement: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT \'TRY\';',
  },
  {
    name: "condition",
    description: "text DEFAULT 'new'",
    alterStatement: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "condition" text DEFAULT \'new\';',
  },
  {
    name: "in_stock",
    description: "boolean DEFAULT true",
    alterStatement: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "in_stock" boolean DEFAULT true;',
  },
];

const createTableStatement = `
  CREATE TABLE IF NOT EXISTS "products" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "brand" text NOT NULL,
    "category" text NOT NULL,
    "description" text,
    "image_url" text,
    "part_number" text,
    "price" numeric(12, 2),
    "currency" text DEFAULT 'TRY',
    "condition" text DEFAULT 'new',
    "in_stock" boolean DEFAULT true
  )
`;

const createIndexStatement = `
  CREATE INDEX IF NOT EXISTS "products_brand_idx"
  ON "products" ("brand")
`;

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

  const sslMode = parsedUrl.searchParams.get("sslmode")?.toLowerCase();
  if (sslMode === "disable" || sslMode === "no-verify") {
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
    const tableResult = await pool.query<{ products_exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'products'
      ) AS products_exists
    `);
    const productsExists = tableResult.rows[0]?.products_exists === true;

    const columnResult = productsExists
      ? await pool.query<{ column_name: string }>(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'products'
          ORDER BY ordinal_position
        `)
      : { rows: [] };

    const existingColumns = new Set(columnResult.rows.map((row) => row.column_name));
    const missingColumns = productColumnDefinitions.filter(
      (column) => productsExists && !existingColumns.has(column.name),
    );
    const safeMissingColumns = missingColumns.filter((column) => column.alterStatement);
    const unsafeMissingColumns = missingColumns.filter((column) => !column.alterStatement);

    console.log(
      `[products-schema] ${APPLY ? "Apply" : "Dry-run"}: products tablosu ${productsExists ? "mevcut" : "yok"}.`,
    );

    if (productsExists) {
      if (missingColumns.length === 0) {
        console.log("[products-schema] Eksik sütun yok.");
      } else {
        for (const column of missingColumns) {
          console.log(`[products-schema] Eksik sütun: ${column.name} ${column.description}`);
        }
      }
    } else {
      console.log("[products-schema] products tablosu yok; güncel CREATE TABLE tanımı kullanılacak.");
    }

    if (unsafeMissingColumns.length > 0) {
      console.log(
        `[products-schema] Güvenle eklenemeyen sütunlar atlandı: ${unsafeMissingColumns.map((column) => column.name).join(", ")}.`,
      );
    }

    if (safeMissingColumns.length > 0) {
      console.log("[products-schema] Uygulanacak additive ALTER TABLE işlemleri:");
      for (const column of safeMissingColumns) {
        console.log(column.alterStatement);
      }
    } else {
      console.log("[products-schema] Uygulanacak ALTER TABLE işlemi yok.");
    }

    if (!APPLY) {
      console.log(
        "[products-schema] Dry-run: DDL çalıştırılmadı. --apply olmadan production şeması değişmez.",
      );
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (!productsExists) {
        await client.query(createTableStatement);
      }
      await client.query(createIndexStatement);
      for (const column of safeMissingColumns) {
        await client.query(column.alterStatement!);
      }
      await client.query("COMMIT");
      console.log(
        "[products-schema] Additive products şema işlemleri tamamlandı. Mevcut kayıtlar korunmuştur.",
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