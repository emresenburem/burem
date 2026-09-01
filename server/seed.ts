import { db } from "./db";
import { products } from "@shared/schema";
import { sql } from "drizzle-orm";

const SEED_PRODUCTS = [
  {
    id: "seed-lenze-e82ev303",
    name: "Lenze E82EV303_4B201 30kW Frekans İnvertörü",
    brand: "Lenze",
    category: "Frekans İnvertörü",
    description:
      "8200 Vector serisi, 30kW/40hp, 3/PE AC 400/500V, 55/55A, 50/60Hz giriş. Çıkış: 0-400/500V, 59/56A, 0-650Hz. 2. El ürün, teknik kontrol yapılmıştır.",
    partNumber: "E82EV303_4B201",
    condition: "used",
    inStock: true,
  },
  {
    id: "seed-lenze-evs9325",
    name: "Lenze EVS9325-ES Servo Sürücü 10kVA",
    brand: "Lenze",
    category: "Servo Sürücü",
    description:
      "9300 serisi servo sürücü. Giriş: 3/PE AC 400/480V 12.0A 10kVA. Çıkış: 3/PE AC 0/480V 13.0A 10.8kVA. Overload: 1.5x IN / 60s. Made in Germany.",
    partNumber: "EVS9325-ES",
    condition: "used",
    inStock: true,
  },
];

export async function seedProducts() {
  try {
    for (const product of SEED_PRODUCTS) {
      await db
        .insert(products)
        .values(product)
        .onConflictDoNothing();
    }
    console.log("[seed] Products seeded.");
  } catch (err) {
    console.error("[seed] Failed to seed products:", err);
  }
}
