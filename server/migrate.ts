/**
 * Startup migration — her ortamda (dev, prod, temiz deploy) tabloların
 * var olmasını garanti eder. Tüm ifadeler idempotent (IF NOT EXISTS).
 */
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function runMigrations(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS price integer,
      ADD COLUMN IF NOT EXISTS stock_quantity integer
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS service_records (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      tracking_no text NOT NULL UNIQUE,
      customer_name text NOT NULL,
      customer_phone text NOT NULL,
      device_model text NOT NULL,
      fault_description text NOT NULL,
      status integer NOT NULL DEFAULT 1,
      technician_note text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS service_settings (
      id varchar PRIMARY KEY DEFAULT 'default',
      notif_type text DEFAULT 'none',
      netgsm_user text,
      netgsm_pass text,
      netgsm_header text,
      green_api_instance text,
      green_api_token text,
      site_url text DEFAULT 'https://www.buremelektronik.com'
    )
  `);

  // Varsayılan ayar satırı — yoksa oluştur
  await db.execute(sql`
    INSERT INTO service_settings (id) VALUES ('default') ON CONFLICT DO NOTHING
  `);

  console.log("[migrate] Servis tabloları hazır.");
}
