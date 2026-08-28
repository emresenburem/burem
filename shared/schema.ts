import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  partNumber: text("part_number"),
  condition: text("condition").default("new"),
  inStock: boolean("in_stock").default(true),
  price: integer("price"),
  stockQuantity: integer("stock_quantity"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

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
