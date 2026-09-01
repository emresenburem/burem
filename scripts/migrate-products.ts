/**
 * Development products -> production products, one time and non-destructive.
 *
 * Dry-run (default):
 *   SOURCE_DATABASE_URL=<dev> TARGET_DATABASE_URL=<prod> npm run migrate:products
 *
 * Apply after reviewing the count:
 *   SOURCE_DATABASE_URL=<dev> TARGET_DATABASE_URL=<prod> npm run migrate:products -- --apply
 *
 * The script never deletes, truncates, or overwrites production rows. Existing
 * rows with the same id are skipped, so production edits remain untouched.
 */
import pg from "pg";

type ProductRow = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  image_url: string | null;
  part_number: string | null;
  condition: string | null;
  in_stock: boolean | null;
};

const APPLY = process.argv.includes("--apply");
const sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
const targetUrl =
  process.env.TARGET_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;

function endpointKey(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return `${url.protocol}//${url.hostname}:${url.port || "5432"}${url.pathname}`;
  } catch {
    return connectionString;
  }
}

async function migrateProducts() {
  if (!sourceUrl) {
    throw new Error(
      "Kaynak veritabanı bulunamadı. SOURCE_DATABASE_URL veya DATABASE_URL tanımlayın.",
    );
  }
  if (!targetUrl) {
    throw new Error(
      "Hedef veritabanı bulunamadı. TARGET_DATABASE_URL veya PRODUCTION_DATABASE_URL tanımlayın.",
    );
  }
  if (endpointKey(sourceUrl) === endpointKey(targetUrl)) {
    throw new Error(
      "Kaynak ve hedef aynı veritabanı görünüyor; güvenlik için işlem durduruldu.",
    );
  }

  const sourcePool = new pg.Pool({ connectionString: sourceUrl });
  const targetPool = new pg.Pool({ connectionString: targetUrl });

  try {
    const sourceResult = await sourcePool.query<ProductRow>(`
      SELECT
        id,
        name,
        brand,
        category,
        description,
        image_url,
        part_number,
        condition,
        in_stock
      FROM products
      ORDER BY id
    `);

    // Hedef tablo yoksa hiçbir DDL çalıştırmadan açıkça başarısız olur.
    await targetPool.query("SELECT 1 FROM products LIMIT 0");

    console.log(
      `[products] Kaynakta ${sourceResult.rows.length} ürün bulundu.${APPLY ? "" : " (dry-run)"}`,
    );

    if (!APPLY) {
      console.log(
        "[products] Değişiklik yapılmadı. Aktarmak için aynı komuta --apply ekleyin.",
      );
      return;
    }

    const client = await targetPool.connect();
    let inserted = 0;
    let skipped = 0;

    try {
      await client.query("BEGIN");

      for (const product of sourceResult.rows) {
        const result = await client.query(
          `
            INSERT INTO products (
              id,
              name,
              brand,
              category,
              description,
              image_url,
              part_number,
              condition,
              in_stock
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            product.id,
            product.name,
            product.brand,
            product.category,
            product.description,
            product.image_url?.startsWith("http") ? product.image_url : null,
            product.part_number,
            product.condition,
            product.in_stock,
          ],
        );

        if (result.rowCount === 1) inserted += 1;
        else skipped += 1;
      }

      await client.query("COMMIT");
      console.log(
        `[products] Aktarım tamamlandı. Eklenen: ${inserted}, mevcut production kayıtları korunarak atlanan: ${skipped}.`,
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await Promise.all([sourcePool.end(), targetPool.end()]);
  }
}

migrateProducts().catch((error) => {
  console.error("[products] Aktarım başarısız:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});