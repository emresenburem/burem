import { db } from "./db";
import { serviceRecords, serviceSettings, type ServiceRecord, type InsertServiceRecord, type ServiceSettingsRow } from "@shared/schema";
import { eq, or, sql } from "drizzle-orm";

/* ── Tracking No üretimi ── */
// Format: BRM-YYYY-XXXXXX  (örn. BRM-2026-000001)
export async function generateTrackingNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BRM-${year}-`;
  // Bu yılın en büyük sıra numarasını bul
  const result = await db
    .select({ maxNo: sql<string>`max(tracking_no)` })
    .from(serviceRecords)
    .where(sql`tracking_no LIKE ${prefix + "%"}`);
  const maxNo = result[0]?.maxNo ?? null;
  // maxNo örn. "BRM-2026-000042" → "000042" → 42
  const lastNum = maxNo ? parseInt(maxNo.replace(new RegExp(`^BRM-${year}-`), ""), 10) : 0;
  const next = isNaN(lastNum) ? 1 : lastNum + 1;
  return `${prefix}${String(next).padStart(6, "0")}`;
}

/* ── CRUD ── */
export async function createServiceRecord(data: Omit<InsertServiceRecord, "trackingNo">): Promise<ServiceRecord> {
  const trackingNo = await generateTrackingNo();
  const [record] = await db
    .insert(serviceRecords)
    .values({ ...data, trackingNo, status: 1 })
    .returning();
  return record;
}

export async function getServiceRecords(): Promise<ServiceRecord[]> {
  return db.select().from(serviceRecords).orderBy(sql`created_at DESC`);
}

export async function queryServiceRecord(q: string): Promise<ServiceRecord | null> {
  const normalized = q.trim().toUpperCase();
  const [byTracking] = await db
    .select()
    .from(serviceRecords)
    .where(sql`upper(tracking_no) = ${normalized}`);
  if (byTracking) return byTracking;

  const [byPhone] = await db
    .select()
    .from(serviceRecords)
    .where(sql`replace(replace(replace(customer_phone,' ',''),'-',''),'(','') LIKE ${"%" + q.replace(/\D/g, "").slice(-7) + "%"}`);
  return byPhone ?? null;
}

export async function updateServiceRecord(
  id: string,
  patch: Partial<Pick<ServiceRecord, "status" | "technicianNote">>
): Promise<ServiceRecord | null> {
  const [updated] = await db
    .update(serviceRecords)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(serviceRecords.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteServiceRecord(id: string): Promise<boolean> {
  const r = await db.delete(serviceRecords).where(eq(serviceRecords.id, id)).returning();
  return r.length > 0;
}

/* ── Settings ── */
export async function getServiceSettings(): Promise<ServiceSettingsRow> {
  const [existing] = await db.select().from(serviceSettings).where(eq(serviceSettings.id, "default"));
  if (existing) return existing;
  // Satır yoksa oluştur (yeni ortam / migration sonrası)
  const [inserted] = await db
    .insert(serviceSettings)
    .values({ id: "default" })
    .onConflictDoNothing()
    .returning();
  if (inserted) return inserted;
  // Yarış durumu: tekrar oku
  const [fallback] = await db.select().from(serviceSettings).where(eq(serviceSettings.id, "default"));
  return fallback;
}

export async function updateServiceSettings(
  patch: Partial<Omit<ServiceSettingsRow, "id">>
): Promise<ServiceSettingsRow> {
  const [s] = await db
    .update(serviceSettings)
    .set(patch)
    .where(eq(serviceSettings.id, "default"))
    .returning();
  return s;
}
