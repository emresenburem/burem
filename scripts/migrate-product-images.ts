/**
 * Upload existing development product images to Cloudinary and update image_url.
 *
 * Dry-run (default):
 *   SOURCE_DATABASE_URL=<dev> TARGET_DATABASE_URL=<prod> npm run migrate:product-images
 *
 * Apply after reviewing the list:
 *   SOURCE_DATABASE_URL=<dev> TARGET_DATABASE_URL=<prod> npm run migrate:product-images -- --apply
 *
 * Development-only apply (useful before the Render target is available):
 *   npm run migrate:product-images -- --apply --source-only
 *
 * Missing source product rows are inserted with ON CONFLICT DO NOTHING. This
 * script never deletes products, overwrites product metadata, or replaces an
 * existing non-local target image_url.
 */
import { readFile } from "fs/promises";
import path from "path";
import pg from "pg";
import { uploadProductImageBuffer } from "../server/product-images";

type SourceProduct = {
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

type LocalAsset = SourceProduct & {
  sourceImageUrl: string;
  filePath?: string;
  mimeType?: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  bytes?: Buffer;
  existingPublicUrl?: string;
};

const APPLY = process.argv.includes("--apply");
const SOURCE_ONLY = process.argv.includes("--source-only");
const sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
const targetUrl =
  process.env.TARGET_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;
const sourcePublicRoot = path.resolve(
  process.env.SOURCE_PUBLIC_ROOT || path.resolve(process.cwd(), "client/public"),
);

function endpointKey(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return `${url.protocol}//${url.hostname}:${url.port || "5432"}${url.pathname}`;
  } catch {
    return connectionString;
  }
}

function localAssetPath(imageUrl: string) {
  if (!imageUrl.startsWith("/")) return null;
  const relativePath = imageUrl.replace(/^\/+/, "");
  const filePath = path.resolve(sourcePublicRoot, relativePath);
  const rootWithSeparator = `${sourcePublicRoot}${path.sep}`;
  if (!filePath.startsWith(rootWithSeparator)) {
    throw new Error(`Güvenli olmayan görsel yolu: ${imageUrl}`);
  }
  return filePath;
}

function mimeTypeForPath(filePath: string): LocalAsset["mimeType"] {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  throw new Error(`Desteklenmeyen görsel uzantısı: ${extension || "(yok)"}`);
}

async function readLocalAssets(rows: SourceProduct[]) {
  const assets: LocalAsset[] = [];

  for (const row of rows) {
    if (!row.image_url) continue;
    if (/^https:\/\/res\.cloudinary\.com\//i.test(row.image_url)) {
      assets.push({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category,
        description: row.description,
        sourceImageUrl: row.image_url,
        existingPublicUrl: row.image_url,
        part_number: row.part_number,
        condition: row.condition,
        in_stock: row.in_stock,
      });
      continue;
    }
    if (/^https?:\/\//i.test(row.image_url)) continue;

    const filePath = localAssetPath(row.image_url);
    if (!filePath) {
      throw new Error(`Görsel URL'si yerel veya public değil: ${row.image_url}`);
    }

    assets.push({
      id: row.id,
      name: row.name,
      brand: row.brand,
      category: row.category,
      description: row.description,
      sourceImageUrl: row.image_url,
      filePath,
      mimeType: mimeTypeForPath(filePath),
      bytes: await readFile(filePath),
      part_number: row.part_number,
      condition: row.condition,
      in_stock: row.in_stock,
    });
  }

  return assets;
}

async function migrateProductImages() {
  if (!sourceUrl) {
    throw new Error(
      "Kaynak veritabanı bulunamadı. SOURCE_DATABASE_URL veya DATABASE_URL tanımlayın.",
    );
  }
  if (!targetUrl && !SOURCE_ONLY) {
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
  const targetPool = targetUrl && !SOURCE_ONLY
    ? new pg.Pool({ connectionString: targetUrl })
    : null;

  try {
    const sourceResult = await sourcePool.query<SourceProduct>(
      `
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
      `,
    );
    const assets = await readLocalAssets(sourceResult.rows);
    if (targetPool) {
      await targetPool.query("SELECT 1 FROM products LIMIT 0");
    }

    console.log(
      `[product-images] Yerel görsel bulundu: ${assets.length}.${APPLY ? "" : " (dry-run)"}`,
    );
    for (const asset of assets) {
      console.log(`[product-images] ${asset.id} <- ${asset.sourceImageUrl}`);
    }

    if (!APPLY) {
      console.log(
        "[product-images] Değişiklik yapılmadı. Aktarmak için aynı komuta --apply ekleyin.",
      );
      return;
    }

    const uploaded = [];
    for (const asset of assets) {
      const result = asset.existingPublicUrl
        ? { url: asset.existingPublicUrl }
        : await uploadProductImageBuffer(
            asset.bytes!,
            asset.mimeType!,
            `product-${asset.id}`,
          );
      uploaded.push({
        ...asset,
        url: result.url,
      });
    }

    const sourceClient = await sourcePool.connect();
    const targetClient = targetPool ? await targetPool.connect() : null;
    let sourceUpdated = 0;
    let targetInserted = 0;
    let targetUpdated = 0;
    let targetPreserved = 0;

    try {
      await sourceClient.query("BEGIN");
      if (targetClient) await targetClient.query("BEGIN");

      for (const asset of uploaded) {
        const sourceUpdate = await sourceClient.query(
          `
            UPDATE products
            SET image_url = $1
            WHERE id = $2 AND image_url = $3
          `,
          [asset.url, asset.id, asset.sourceImageUrl],
        );
        sourceUpdated += sourceUpdate.rowCount ?? 0;

        if (!targetClient) continue;

        const targetInsert = await targetClient.query(
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
            asset.id,
            asset.name,
            asset.brand,
            asset.category,
            asset.description,
            asset.url,
            asset.part_number,
            asset.condition,
            asset.in_stock,
          ],
        );
        if (targetInsert.rowCount) {
          targetInserted += targetInsert.rowCount;
          continue;
        }

        const targetUpdate = await targetClient.query(
          `
            UPDATE products
            SET image_url = $1
            WHERE id = $2
              AND (
                image_url IS NULL
                OR image_url LIKE '/products/%'
                OR image_url LIKE '/uploads/%'
              )
          `,
          [asset.url, asset.id],
        );
        if (targetUpdate.rowCount) {
          targetUpdated += targetUpdate.rowCount;
        } else {
          targetPreserved += 1;
        }
      }

      await sourceClient.query("COMMIT");
      if (targetClient) await targetClient.query("COMMIT");
      console.log(
        `[product-images] Tamamlandı. Development güncellenen: ${sourceUpdated}, production’a eklenen: ${targetInserted}, production’da görseli güncellenen: ${targetUpdated}, mevcut production görseli korunan: ${targetPreserved}.`,
      );
    } catch (error) {
      await Promise.all([
        sourceClient.query("ROLLBACK").catch(() => {}),
        targetClient?.query("ROLLBACK").catch(() => {}),
      ]);
      throw error;
    } finally {
      sourceClient.release();
      targetClient?.release();
    }
  } finally {
    await Promise.all([
      sourcePool.end(),
      targetPool?.end() ?? Promise.resolve(),
    ]);
  }
}

migrateProductImages().catch((error) => {
  console.error(
    "[product-images] Aktarım başarısız:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});