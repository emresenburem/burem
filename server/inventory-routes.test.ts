import assert from "node:assert/strict";
import express from "express";
import { createServer } from "node:http";
import { test } from "node:test";
import { storage } from "./storage";
import { registerRoutes } from "./routes";

const testSecret = "inventory-route-test-secret";
const sampleProduct = {
  id: "synthetic-product-id",
  name: "Synthetic test",
  brand: "Test",
  category: "Test",
  sourceInventoryDeviceId: "synthetic-device-id",
};

test("production inventory routes remain registered and image route rejects safely", async () => {
  const originalSecret = process.env.INVENTORY_SYNC_SECRET;
  const originalUpsert = storage.upsertInventoryProduct;
  const originalLookup = storage.getInventoryProductBySourceDeviceId;
  const originalDelete = storage.deleteInventoryProductBySourceDeviceId;
  const originalImageSync = storage.syncInventoryProductImages;
  const originalImageDedupe = storage.dedupeInventoryProductImages;
  const originalCloudinaryEnv = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
  let imageProductExists = true;
  let dedupeOptions: Record<string, unknown> | undefined;

  process.env.INVENTORY_SYNC_SECRET = testSecret;
  process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
  process.env.CLOUDINARY_API_KEY = "test-key";
  process.env.CLOUDINARY_API_SECRET = "test-secret";
  storage.upsertInventoryProduct = async () => ({ product: sampleProduct as any, action: "created" });
  storage.getInventoryProductBySourceDeviceId = async () =>
    imageProductExists ? (sampleProduct as any) : undefined;
  storage.deleteInventoryProductBySourceDeviceId = async () => true;
  let upsertAction: "created" | "updated" = "created";
  storage.upsertInventoryProduct = async () => ({
    product: sampleProduct as any,
    action: upsertAction,
  });

  const app = express();
  app.use(express.json());
  const server = createServer(app);
  await registerRoutes(server, app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;

  try {
    const unauthorized = await fetch(`${base}/api/internal/inventory-products/upsert`, { method: "POST" });
    assert.equal(unauthorized.status, 401);
    assert.match(unauthorized.headers.get("content-type") ?? "", /application\/json/);

    const authHeaders = {
      Authorization: `Bearer ${testSecret}`,
      "Content-Type": "application/json",
    };
    const created = await fetch(`${base}/api/internal/inventory-products/upsert`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        sourceInventoryDeviceId: "synthetic-device-id",
        name: "Synthetic test",
        brand: "Test",
        category: "Test",
        description: null,
        partNumber: null,
        price: null,
        currency: "TRY",
        condition: "used",
        inStock: true,
        isPublished: true,
      }),
    });
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), {
      success: true,
      productId: sampleProduct.id,
      sourceInventoryDeviceId: sampleProduct.sourceInventoryDeviceId,
      action: "created",
    });
    upsertAction = "updated";
    const updated = await fetch(`${base}/api/internal/inventory-products/upsert`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        sourceInventoryDeviceId: "synthetic-device-id",
        name: "Synthetic test",
        brand: "Test",
        category: "Test",
        description: null,
        partNumber: null,
        price: null,
        currency: "TRY",
        condition: "used",
        inStock: true,
        isPublished: true,
      }),
    });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).action, "updated");

    const lookup = await fetch(
      `${base}/api/internal/inventory-products/${sampleProduct.sourceInventoryDeviceId}`,
      { headers: { Authorization: `Bearer ${testSecret}` } },
    );
    assert.equal(lookup.status, 200);
    assert.match(lookup.headers.get("content-type") ?? "", /application\/json/);

    const deleted = await fetch(
      `${base}/api/internal/inventory-products/${sampleProduct.sourceInventoryDeviceId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${testSecret}` } },
    );
    assert.equal(deleted.status, 200);
    assert.deepEqual(await deleted.json(), { success: true, deleted: true });

    const imageUnauthorized = await fetch(
      `${base}/api/internal/inventory-products/synthetic-device-id/images`,
      { method: "POST" },
    );
    assert.equal(imageUnauthorized.status, 401);
    assert.match(imageUnauthorized.headers.get("content-type") ?? "", /application\/json/);
    const imageWrongAuth = await fetch(
      `${base}/api/internal/inventory-products/synthetic-device-id/images`,
      { method: "POST", headers: { Authorization: "Bearer wrong" } },
    );
    assert.equal(imageWrongAuth.status, 401);
    assert.match(imageWrongAuth.headers.get("content-type") ?? "", /application\/json/);

    let syncedImages: unknown[] | undefined;
    storage.syncInventoryProductImages = async (_sourceId, images) => {
      syncedImages = images;
      return {
        productId: sampleProduct.id,
        primaryImageUrl: null,
        uploaded: 0,
        updated: 0,
        removed: 1,
        removedPublicIds: [],
      };
    };
  storage.dedupeInventoryProductImages = async (_sourceId, _attachmentId, options = {}) => {
    dedupeOptions = options;
    return {
      productId: sampleProduct.id,
      sourceInventoryDeviceId: sampleProduct.sourceInventoryDeviceId,
      productImageUrl: "https://images.example/canonical.jpg",
      galleryCount: 2,
      manualImages: [],
      matchingImages: [
        {
          id: "canonical-image",
          imageUrl: "https://images.example/canonical.jpg",
          cloudinaryPublicId: "burem/products/synced-id",
          isPrimary: true,
          sortOrder: 0,
        },
        {
          id: "duplicate-image",
          imageUrl: "https://images.example/canonical.jpg",
          cloudinaryPublicId: "burem/products/synced-id",
          isPrimary: false,
          sortOrder: 1,
        },
      ],
      canonicalImageId: "canonical-image",
      duplicateImageIds: ["duplicate-image"],
      duplicatesRemoved: options.apply ? 1 : 0,
      remainingSyncedImages: 1,
      primaryImageUrl: "https://images.example/canonical.jpg",
      canApply: true,
    };
  };
    const emptyImageForm = new FormData();
    emptyImageForm.append("manifest", JSON.stringify([]));
    const emptyImageSync = await fetch(
      `${base}/api/internal/inventory-products/synthetic-device-id/images`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${testSecret}` },
        body: emptyImageForm,
      },
    );
    assert.equal(emptyImageSync.status, 200);
    assert.deepEqual(await emptyImageSync.json(), {
      success: true,
      productId: sampleProduct.id,
      sourceInventoryDeviceId: sampleProduct.sourceInventoryDeviceId,
      uploaded: 0,
      updated: 0,
      removed: 1,
      primaryImageUrl: null,
      cloudinaryCleanupPending: false,
    });
    assert.deepEqual(syncedImages, []);

    const dedupePath =
      `${base}/api/internal/inventory-products/synthetic-device-id/images/dedupe`;
    const dedupeUnauthorized = await fetch(`${dedupePath}?attachmentId=4`);
    assert.equal(dedupeUnauthorized.status, 401);
    assert.match(dedupeUnauthorized.headers.get("content-type") ?? "", /application\/json/);
    const dedupeWrongAuth = await fetch(dedupePath, {
      method: "POST",
      headers: { Authorization: "Bearer wrong", "Content-Type": "application/json" },
      body: JSON.stringify({
        attachmentId: "4",
        canonicalImageId: "canonical-image",
        duplicateImageIds: ["duplicate-image"],
        expectedProductImageUrl: "https://images.example/canonical.jpg",
      }),
    });
    assert.equal(dedupeWrongAuth.status, 401);
    assert.match(dedupeWrongAuth.headers.get("content-type") ?? "", /application\/json/);

    const dedupeInspection = await fetch(`${dedupePath}?attachmentId=4`, {
      headers: { Authorization: `Bearer ${testSecret}` },
    });
    assert.equal(dedupeInspection.status, 200);
    assert.equal((await dedupeInspection.json()).dryRun, true);
    const dedupeApply = await fetch(dedupePath, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        attachmentId: "4",
        canonicalImageId: "canonical-image",
        duplicateImageIds: ["duplicate-image"],
        expectedProductImageUrl: "https://images.example/canonical.jpg",
      }),
    });
    assert.equal(dedupeApply.status, 200);
    assert.equal((await dedupeApply.json()).duplicatesRemoved, 1);
    assert.equal(dedupeOptions?.apply, true);

    imageProductExists = false;
    const form = new FormData();
    form.append("files", new Blob([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], {
      type: "image/png",
    }), "synthetic.png");
    form.append("manifest", JSON.stringify([
      { attachmentId: "synthetic-attachment", fileIndex: 0, isPrimary: true, sortOrder: 0 },
    ]));
    const missingImageProduct = await fetch(
      `${base}/api/internal/inventory-products/nonexistent-source/images`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${testSecret}` },
        body: form,
      },
    );
    assert.equal(missingImageProduct.status, 404);
    assert.match(missingImageProduct.headers.get("content-type") ?? "", /application\/json/);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    storage.upsertInventoryProduct = originalUpsert;
    storage.getInventoryProductBySourceDeviceId = originalLookup;
    storage.deleteInventoryProductBySourceDeviceId = originalDelete;
    storage.syncInventoryProductImages = originalImageSync;
    storage.dedupeInventoryProductImages = originalImageDedupe;
    if (originalSecret === undefined) delete process.env.INVENTORY_SYNC_SECRET;
    else process.env.INVENTORY_SYNC_SECRET = originalSecret;
    if (originalCloudinaryEnv.cloudName === undefined) delete process.env.CLOUDINARY_CLOUD_NAME;
    else process.env.CLOUDINARY_CLOUD_NAME = originalCloudinaryEnv.cloudName;
    if (originalCloudinaryEnv.apiKey === undefined) delete process.env.CLOUDINARY_API_KEY;
    else process.env.CLOUDINARY_API_KEY = originalCloudinaryEnv.apiKey;
    if (originalCloudinaryEnv.apiSecret === undefined) delete process.env.CLOUDINARY_API_SECRET;
    else process.env.CLOUDINARY_API_SECRET = originalCloudinaryEnv.apiSecret;
  }
});
