import assert from "node:assert/strict";
import { test } from "node:test";
import { insertProductSchema, inventoryProductUpsertSchema } from "@shared/schema";
import { isValidInventorySyncAuthorization } from "./inventory-sync-auth";
import {
  inventoryImageManifestSchema,
  INVENTORY_IMAGE_CLOUDINARY_FOLDER,
  inventoryImagePublicId,
  isInventorySyncedImage,
  MAX_INVENTORY_IMAGES,
  planInventoryImageDedupe,
  planInventoryImageSync,
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
  assert.equal(inventoryImageManifestSchema.safeParse([
    { attachmentId: 4, fileIndex: 0, isPrimary: true, sortOrder: 0 },
  ]).success, false);
  assert.deepEqual(inventoryImageManifestSchema.parse([]), []);
});

test("empty inventory image sync removes only synced images and falls back to a manual primary idempotently", () => {
  const sourceId = "device-empty-sync";
  const syncedPublicId = inventoryImagePublicId(sourceId, "synced-attachment");
  const manualPublicId = "manual-cloudinary-asset";
  const currentImages = [
    {
      id: "synced-image",
      imageUrl: "https://cdn.example/synced.jpg",
      cloudinaryPublicId: syncedPublicId,
      isPrimary: true,
    },
    {
      id: "manual-image-first",
      imageUrl: "https://cdn.example/manual-first.jpg",
      cloudinaryPublicId: manualPublicId,
      isPrimary: false,
    },
    {
      id: "manual-image-current-primary",
      imageUrl: "https://cdn.example/manual-primary.jpg",
      cloudinaryPublicId: "manual-cloudinary-primary",
      isPrimary: true,
    },
  ];

  const first = planInventoryImageSync(sourceId, currentImages, []);
  assert.deepEqual(first.removedImages.map((image) => image.id), ["synced-image"]);
  assert.equal(first.primaryImageUrl, "https://cdn.example/manual-primary.jpg");
  assert.equal(first.primaryManualImage?.id, "manual-image-current-primary");
  assert.equal(first.removedImages.some((image) => image.cloudinaryPublicId === manualPublicId), false);

  const remainingImages = first.manualImages.map((image) => ({
    ...image,
    isPrimary: image.id === first.primaryManualImage?.id,
  }));
  const repeated = planInventoryImageSync(sourceId, remainingImages, []);
  assert.deepEqual(repeated.removedImages, []);
  assert.equal(repeated.primaryImageUrl, first.primaryImageUrl);
  assert.equal(repeated.primaryManualImage?.id, "manual-image-current-primary");
});

test("empty inventory image sync chooses the first manual image if no manual primary exists", () => {
  const sourceId = "device-manual-fallback";
  const plan = planInventoryImageSync(sourceId, [
    {
      id: "manual-first",
      imageUrl: "https://cdn.example/manual-first.jpg",
      cloudinaryPublicId: "manual-first-asset",
      isPrimary: false,
    },
    {
      id: "manual-second",
      imageUrl: "https://cdn.example/manual-second.jpg",
      cloudinaryPublicId: "manual-second-asset",
      isPrimary: false,
    },
  ], []);

  assert.deepEqual(plan.removedImages, []);
  assert.equal(plan.primaryManualImage?.id, "manual-first");
  assert.equal(plan.primaryImageUrl, "https://cdn.example/manual-first.jpg");
});

test("empty inventory image sync without manual images clears the primary URL", () => {
  const sourceId = "device-no-manual-images";
  const plan = planInventoryImageSync(sourceId, [
    {
      id: "synced-only",
      imageUrl: "https://cdn.example/synced.jpg",
      cloudinaryPublicId: inventoryImagePublicId(sourceId, "attachment"),
      isPrimary: true,
    },
  ], []);

  assert.deepEqual(plan.removedImages.map((image) => image.id), ["synced-only"]);
  assert.equal(plan.primaryManualImage, undefined);
  assert.equal(plan.primaryImageUrl, null);
});

test("inventory image attachment public IDs are stable and source-scoped", () => {
  const id = inventoryImagePublicId("device-a", "attachment-1");
  assert.equal(id, inventoryImagePublicId("device-a", "attachment-1"));
  assert.notEqual(id, inventoryImagePublicId("device-a", "attachment-2"));
  assert.notEqual(id, inventoryImagePublicId("device-b", "attachment-1"));
  assert.equal(isInventorySyncedImage(id, "device-a"), true);
  assert.equal(isInventorySyncedImage("manual-image", "device-a"), false);
});

test("folder-qualified Cloudinary IDs keep inventory attachments idempotent", () => {
  const sourceId = "3";
  const attachmentId = "4";
  const publicId = `${INVENTORY_IMAGE_CLOUDINARY_FOLDER}/${inventoryImagePublicId(sourceId, attachmentId)}`;
  const input = [{
    attachmentId,
    imageUrl: "https://res.cloudinary.example/burem/products/image.jpg",
    cloudinaryPublicId: publicId,
    isPrimary: true,
    sortOrder: 0,
  }];

  const first = planInventoryImageSync(sourceId, [], input);
  assert.equal(first.uploadCount, 1);
  assert.equal(first.updateCount, 0);

  const persistedImage = {
    id: "same-db-image-row",
    productId: "product-3",
    imageUrl: input[0].imageUrl,
    cloudinaryPublicId: publicId,
    sortOrder: 0,
    isPrimary: true,
    createdAt: new Date("2026-10-15T00:00:00.000Z"),
  };
  const repeated = planInventoryImageSync(sourceId, [persistedImage], input);
  assert.equal(repeated.uploadCount, 0);
  assert.equal(repeated.updateCount, 1);
  assert.equal(repeated.existingByPublicId.get(publicId)?.id, "same-db-image-row");
  assert.deepEqual(repeated.removedImages, []);
});

test("same attachment updates sort order and primary state while another attachment stays separate", () => {
  const sourceId = "3";
  const firstPublicId = `${INVENTORY_IMAGE_CLOUDINARY_FOLDER}/${inventoryImagePublicId(sourceId, "4")}`;
  const secondPublicId = `${INVENTORY_IMAGE_CLOUDINARY_FOLDER}/${inventoryImagePublicId(sourceId, "5")}`;
  const existing = {
    id: "image-4",
    productId: "product-3",
    imageUrl: "https://res.cloudinary.example/old.jpg",
    cloudinaryPublicId: firstPublicId,
    sortOrder: 0,
    isPrimary: true,
    createdAt: new Date("2026-10-15T00:00:00.000Z"),
  };
  const plan = planInventoryImageSync(sourceId, [existing], [
    {
      attachmentId: "4",
      imageUrl: "https://res.cloudinary.example/updated.jpg",
      cloudinaryPublicId: firstPublicId,
      isPrimary: false,
      sortOrder: 1,
    },
    {
      attachmentId: "5",
      imageUrl: "https://res.cloudinary.example/second.jpg",
      cloudinaryPublicId: secondPublicId,
      isPrimary: true,
      sortOrder: 0,
    },
  ]);

  assert.equal(plan.uploadCount, 1);
  assert.equal(plan.updateCount, 1);
  assert.equal(plan.existingByPublicId.get(firstPublicId)?.id, "image-4");
  const updatedImage = plan.orderedImages.find((image) => image.attachmentId === "4");
  assert.equal(updatedImage?.sortOrder, 1);
  assert.equal(updatedImage?.imageUrl, "https://res.cloudinary.example/updated.jpg");
  assert.equal(plan.primarySyncedImage?.attachmentId, "5");
  assert.equal(isInventorySyncedImage(firstPublicId, "3"), true);
});

test("folder-qualified synced cleanup preserves manual Cloudinary image rows", () => {
  const sourceId = "3";
  const syncedPublicId = `${INVENTORY_IMAGE_CLOUDINARY_FOLDER}/${inventoryImagePublicId(sourceId, "4")}`;
  const manualPublicId = `${INVENTORY_IMAGE_CLOUDINARY_FOLDER}/manual-website-photo`;
  const plan = planInventoryImageSync(sourceId, [
    {
      id: "synced-row",
      imageUrl: "https://res.cloudinary.example/synced.jpg",
      cloudinaryPublicId: syncedPublicId,
      isPrimary: true,
    },
    {
      id: "manual-row",
      imageUrl: "https://res.cloudinary.example/manual.jpg",
      cloudinaryPublicId: manualPublicId,
      isPrimary: false,
    },
  ], []);

  assert.deepEqual(plan.removedImages.map((image) => image.id), ["synced-row"]);
  assert.equal(plan.removedImages.some((image) => image.cloudinaryPublicId === manualPublicId), false);
  assert.deepEqual(plan.manualImages.map((image) => image.id), ["manual-row"]);
  assert.equal(plan.primaryImageUrl, "https://res.cloudinary.example/manual.jpg");
});

test("inventory image dedupe keeps the primary synced row and plans only its duplicate", () => {
  const publicId = `${INVENTORY_IMAGE_CLOUDINARY_FOLDER}/${inventoryImagePublicId("3", "4")}`;
  const images = [
    {
      id: "canonical-image",
      imageUrl: "https://images.example/shared.jpg",
      cloudinaryPublicId: publicId,
      isPrimary: true,
      sortOrder: 0,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    },
    {
      id: "duplicate-image",
      imageUrl: "https://images.example/shared.jpg",
      cloudinaryPublicId: publicId,
      isPrimary: false,
      sortOrder: 1,
      createdAt: new Date("2026-01-02T00:00:00Z"),
    },
  ];
  const plan = planInventoryImageDedupe("3", "4", images);
  assert.equal(plan.canonicalImage?.id, "canonical-image");
  assert.deepEqual(plan.duplicateImages.map((image) => image.id), ["duplicate-image"]);
  assert.equal(plan.canApply, true);
  assert.equal(plan.remainingSyncedImages, 1);

  const retry = planInventoryImageDedupe("3", "4", [images[0]]);
  assert.equal(retry.duplicateImages.length, 0);
  assert.equal(retry.remainingSyncedImages, 1);
});

test("inventory image dedupe never plans a manual website image for deletion", () => {
  const publicId = `${INVENTORY_IMAGE_CLOUDINARY_FOLDER}/${inventoryImagePublicId("3", "4")}`;
  const plan = planInventoryImageDedupe("3", "4", [
    {
      id: "canonical-image",
      imageUrl: "https://images.example/shared.jpg",
      cloudinaryPublicId: publicId,
      isPrimary: true,
      sortOrder: 0,
    },
    {
      id: "duplicate-image",
      imageUrl: "https://images.example/shared.jpg",
      cloudinaryPublicId: publicId,
      isPrimary: false,
      sortOrder: 1,
    },
    {
      id: "manual-image",
      imageUrl: "https://images.example/manual.jpg",
      cloudinaryPublicId: "manual-cloudinary-id",
      isPrimary: false,
      sortOrder: 2,
    },
  ]);
  assert.deepEqual(plan.duplicateImages.map((image) => image.id), ["duplicate-image"]);
  assert.deepEqual(plan.manualImages.map((image) => image.id), ["manual-image"]);
  assert.equal(plan.canApply, false);
});
