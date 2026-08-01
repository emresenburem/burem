import pg from "pg";

/**
 * Runs on every server start.
 * Creates tables if they don't exist, adds missing columns, and seeds products.
 * Safe to run multiple times (all statements are idempotent).
 */
export async function runMigrations() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    // ── Tables ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id      VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name        TEXT    NOT NULL,
        brand       TEXT    NOT NULL,
        category    TEXT    NOT NULL,
        description TEXT,
        image_url   TEXT,
        part_number TEXT,
        condition   TEXT    DEFAULT 'new',
        in_stock    BOOLEAN DEFAULT true
      );
    `);

    // ── Add columns that may be missing on older schemas ────────────────────
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS part_number TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS condition   TEXT DEFAULT 'new';
    `);

    // ── Seed products (fixed IDs → safe to run many times) ──────────────────
    await client.query(`
      INSERT INTO products (id, name, brand, category, description, image_url, part_number, condition, in_stock)
      VALUES
        (
          'seed-lenze-e82ev303',
          'Lenze E82EV303_4B201 30kW Frekans İnvertörü',
          'Lenze', 'Frekans İnvertörü',
          '8200 Vector serisi, 30kW/40hp, 3/PE AC 400/500V, 55/55A, 50/60Hz giriş. Çıkış: 0-400/500V, 59/56A, 0-650Hz. 2. El ürün, teknik kontrol yapılmıştır.',
          '/products/lenze-e82ev303-4b201-a.png',
          'E82EV303_4B201', 'used', true
        ),
        (
          'seed-lenze-evs9325',
          'Lenze EVS9325-ES Servo Sürücü 10kVA',
          'Lenze', 'Servo Sürücü',
          '9300 serisi servo sürücü. Giriş: 3/PE AC 400/480V 12.0A 10kVA. Çıkış: 3/PE AC 0/480V 13.0A 10.8kVA. Overload: 1.5x IN / 60s. Made in Germany.',
          '/products/lenze-evs9325-es-a.png',
          'EVS9325-ES', 'used', true
        )
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("[migrate] Schema and seed applied.");
  } catch (err) {
    console.error("[migrate] Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}
