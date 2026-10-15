import { createHash } from "node:crypto";
import { z } from "zod";

export const MAX_INVENTORY_IMAGES = 8;
export const MAX_INVENTORY_IMAGE_BYTES = 6 * 1024 * 1024;
export const INVENTORY_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const inventoryImageManifestSchema = z
  .array(
    z
      .object({
        attachmentId: z.string().trim().min(1).max(200),
        fileIndex: z.number().int().min(0).max(MAX_INVENTORY_IMAGES - 1),
        isPrimary: z.boolean(),
        sortOrder: z.number().int().min(0).max(10000),
      })
      .strict(),
  )
  .min(1)
  .max(MAX_INVENTORY_IMAGES)
  .superRefine((items, ctx) => {
    const attachmentIds = new Set<string>();
    const fileIndexes = new Set<number>();
    const sortOrders = new Set<number>();
    let primaryCount = 0;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (attachmentIds.has(item.attachmentId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, "attachmentId"], message: "Duplicate attachmentId" });
      }
      if (fileIndexes.has(item.fileIndex)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, "fileIndex"], message: "Duplicate fileIndex" });
      }
      if (sortOrders.has(item.sortOrder)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, "sortOrder"], message: "Duplicate sortOrder" });
      }
      attachmentIds.add(item.attachmentId);
      fileIndexes.add(item.fileIndex);
      sortOrders.add(item.sortOrder);
      if (item.isPrimary) primaryCount += 1;
    }
    if (primaryCount > 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Only one image may be primary" });
    }
  });

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function inventoryImagePublicIdPrefix(sourceInventoryDeviceId: string) {
  return `inventory-sync-${digest(sourceInventoryDeviceId)}-`;
}

export function inventoryImagePublicId(sourceInventoryDeviceId: string, attachmentId: string) {
  return `${inventoryImagePublicIdPrefix(sourceInventoryDeviceId)}${digest(attachmentId)}`;
}

export function isInventorySyncedImage(publicId: string | null | undefined, sourceInventoryDeviceId: string) {
  return Boolean(publicId?.startsWith(inventoryImagePublicIdPrefix(sourceInventoryDeviceId)));
}
