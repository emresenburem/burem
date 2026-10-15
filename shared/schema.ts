import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, uniqueIndex, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const products = pgTable(
  "products",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    partNumber: text("part_number"),
    price: numeric("price", { precision: 12, scale: 2 }),
    currency: text("currency").default("TRY"),
    condition: text("condition").default("new"),
    inStock: boolean("in_stock").default(true),
    isPublished: boolean("is_published"),
    sourceInventoryDeviceId: text("source_inventory_device_id"),
  },
  (table) => ({
    sourceInventoryDeviceIdUnique: uniqueIndex(
      "products_source_inventory_device_id_unique",
    ).on(table.sourceInventoryDeviceId),
  }),
);

export const productImages = pgTable(
  "product_images",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    productId: varchar("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    cloudinaryPublicId: text("cloudinary_public_id"),
    sortOrder: integer("sort_order").default(0),
    isPrimary: boolean("is_primary").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    onePrimaryPerProduct: uniqueIndex("product_images_one_primary_idx")
      .on(table.productId)
      .where(sql`${table.isPrimary} = true`),
  }),
);

export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true, sourceInventoryDeviceId: true })
  .extend({
    price: z
      .string()
      .regex(/^\d{1,10}(\.\d{1,2})?$/, "Fiyat 0-9999999999,99 aralığında olmalıdır.")
      .nullable()
      .optional(),
    currency: z.enum(["TRY", "USD"]).nullable().optional(),
  });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductWithImages = Product & { images: ProductImage[] };

const inventoryDeviceIdSchema = z
  .union([
    z.string().trim().min(1),
    z.number().int().refine(Number.isSafeInteger, "ID must be a safe integer"),
  ])
  .transform(String);

export const inventoryProductUpsertSchema = z
  .object({
    sourceInventoryDeviceId: inventoryDeviceIdSchema,
    name: z.string().trim().min(1),
    brand: z.string().trim().min(1),
    category: z.string().trim().min(1),
    description: z.string().nullable(),
    partNumber: z.string().nullable(),
    price: z
      .string()
      .regex(/^\d{1,10}(\.\d{1,2})?$/, "Fiyat en fazla iki ondalık basamak içermelidir.")
      .nullable(),
    currency: z.enum(["TRY", "USD"]),
    condition: z.enum(["new", "refurbished", "used"]),
    inStock: z.boolean(),
    isPublished: z.boolean(),
  })
  .strict();

export type InventoryProductUpsert = z.infer<typeof inventoryProductUpsertSchema>;

/* ── Servis Takip ───────────────────────────────────────────── */

export const serviceRecords = pgTable("service_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNo: text("tracking_no").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deviceModel: text("device_model").notNull(),
  faultDescription: text("fault_description").notNull(),
  status: integer("status").default(1).notNull(),
  technicianNote: text("technician_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceRecordSchema = createInsertSchema(serviceRecords).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type ServiceRecord = typeof serviceRecords.$inferSelect;
export type InsertServiceRecord = z.infer<typeof insertServiceRecordSchema>;

export const serviceSettings = pgTable("service_settings", {
  id: varchar("id").primaryKey().default("default"),
  notifType: text("notif_type").default("none"),
  netgsmUser: text("netgsm_user"),
  netgsmPass: text("netgsm_pass"),
  netgsmHeader: text("netgsm_header"),
  greenApiInstance: text("green_api_instance"),
  greenApiToken: text("green_api_token"),
  siteUrl: text("site_url").default("https://www.buremelektronik.com"),
});

export type ServiceSettingsRow = typeof serviceSettings.$inferSelect;
