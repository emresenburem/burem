import assert from "node:assert/strict";
import { test } from "node:test";
import { insertProductSchema, inventoryProductUpsertSchema } from "@shared/schema";
import { isValidInventorySyncAuthorization } from "./inventory-sync-auth";
import {
  inventoryImageManifestSchema,
  inventoryImagePublicId,
  isInventorySyncedImage,
  MAX_INVENTORY_IMAGES,
} from "./inventory-image-sync";

const payload = {
  sourceInventoryDeviceId: "123",
  name: "ABB ACS550 7.5 kW",
  brand: "ABB",
  category: "Sürücü",
  description: "Test edilmiş ikinci el sürücü",
  partNumber: "ACS550-X",
  price: "18500.00",
  currency: "TRY",
  condition: "used",
  inStock: true,
  isPublished: true,
};

test("inventory payload normalizes numeric source IDs and accepts only whitelisted fields", () => {
  const parsed = inventoryProductUpsertSchema.parse({
    ...payload,
    sourceInventoryDeviceId: 123,
  });
  assert.equal(parsed.sourceInventoryDeviceId, "123");
  assert.throws(() =>
    inventoryProductUpsertSchema.parse({ ...payload, id: "arbitrary-db-id" }),
  );
});

test("inventory payload rejects invalid identity, price, and status types", () => {
  assert.throws(() =>
    inventoryProductUpsertSchema.parse({ ...payload, sourceInventoryDeviceId: 1.2 }),
  );
  assert.throws(() =>
    inventoryProductUpsertSchema.parse({ ...payload, price: "18,500" }),
  );
  assert.throws(() =>
    inventoryProductUpsertSchema.parse({ ...payload, isPublished: "false" }),
  );
});

test("inventory upsert preserves explicit unpublish and out-of-stock values", () => {
  const parsed = inventoryProductUpsertSchema.parse({
    ...payload,
    inStock: false,
    isPublished: false,
  });
  assert.equal(parsed.inStock, false);
  assert.equal(parsed.isPublished, false);
});

test("manual product schema cannot set the inventory source ID", () => {
  const parsed = insertProductSchema.parse({
    name: payload.name,
    brand: payload.brand,
    category: payload.category,
    sourceInventoryDeviceId: "not-allowed-from-admin",
  });
  assert.equal("sourceInventoryDeviceId" in parsed, false);
});

test("inventory bearer auth fails closed and validates exact secrets", () => {
  assert.equal(isValidInventorySyncAuthorization("Bearer test-secret", undefined), false);
  assert.equal(isValidInventorySyncAuthorization(undefined, "test-secret"), false);
  assert.equal(isValidInventorySyncAuthorization("Bearer wrong", "test-secret"), false);
  assert.equal(isValidInventorySyncAuthorization("Bearer test-secret", "test-secret"), true);
});

test("inventory image manifest validates ordered files and primary selection", () => {
  const manifest = [
    { attachmentId: "att-a", fileIndex: 0, isPrimary: true, sortOrder: 0 },
    { attachmentId: "att-b", fileIndex: 1, isPrimary: false, sortOrder: 1 },
  ];
  assert.deepEqual(inventoryImageManifestSchema.parse(manifest), manifest);
  assert.equal(MAX_INVENTORY_IMAGES, 8);
  assert.equal(inventoryImageManifestSchema.safeParse([
    ...manifest,
    { attachmentId: "att-a", fileIndex: 2, isPrimary: false, sortOrder: 2 },
  ]).success, false);
});

test("inventory image attachment public IDs are stable and source-scoped", () => {
  const id = inventoryImagePublicId("device-a", "attachment-1");
  assert.equal(id, inventoryImagePublicId("device-a", "attachment-1"));
  assert.notEqual(id, inventoryImagePublicId("device-a", "attachment-2"));
  assert.notEqual(id, inventoryImagePublicId("device-b", "attachment-1"));
  assert.equal(isInventorySyncedImage(id, "device-a"), true);
  assert.equal(isInventorySyncedImage("manual-image", "device-a"), false);
});
