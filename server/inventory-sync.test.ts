import assert from "node:assert/strict";
import { test } from "node:test";
import { insertProductSchema, inventoryProductUpsertSchema } from "@shared/schema";
import { isValidInventorySyncAuthorization } from "./inventory-sync-auth";

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
