import { readdir, readFile } from "fs/promises";
import path from "path";
import pg from "pg";

export async function runMigrations() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();

    // Migration takip tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name text PRIMARY KEY,
        run_at timestamptz DEFAULT now()
      )
    `);

    const migrationsDir = path.join(process.cwd(), "migrations");
    let files: string[] = [];
    try {
      files = (await readdir(migrationsDir))
        .filter((f) => f.endsWith(".sql"))
        .sort();
    } catch {
      console.log("[migrate] migrations/ klasörü bulunamadı, atlanıyor.");
      return;
    }

    for (const file of files) {
      const { rows } = await client.query(
        "SELECT 1 FROM _migrations WHERE name = $1",
        [file]
      );
      if (rows.length > 0) continue;

      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
      console.log(`[migrate] ✓ ${file}`);
    }

    console.log("[migrate] Tamamlandı.");
  } catch (err) {
    console.error("[migrate] Hata:", err);
    throw err;
  } finally {
    await client.end();
  }
}
