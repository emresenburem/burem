import { createHash } from "node:crypto";
import { z } from "zod";

export const MAX_INVENTORY_IMAGES = 8;
export const MAX_INVENTORY_IMAGE_BYTES = 6 * 1024 * 1024;
export const INVENTORY_IMAGE_CLOUDINARY_FOLDER = "burem/products";
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

export type InventoryImageSyncInput = {
  attachmentId: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  isPrimary: boolean;
  sortOrder: number;
};

type ExistingInventoryImage = {
  id: string;
  imageUrl: string;
  cloudinaryPublicId: string | null;
  isPrimary: boolean | null;
};

export function planInventoryImageSync<T extends ExistingInventoryImage>(
  sourceInventoryDeviceId: string,
  currentImages: T[],
  images: InventoryImageSyncInput[],
) {
  const synchronizedImages = currentImages.filter((image) =>
    isInventorySyncedImage(image.cloudinaryPublicId, sourceInventoryDeviceId),
  );
  const manualImages = currentImages.filter(
    (image) => !isInventorySyncedImage(image.cloudinaryPublicId, sourceInventoryDeviceId),
  );
  const orderedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const primarySyncedImage = orderedImages.find((image) => image.isPrimary) ?? orderedImages[0];
  const primaryManualImage = primarySyncedImage
    ? undefined
    : manualImages.find((image) => image.isPrimary === true) ?? manualImages[0];
  const existingByPublicId = new Map(
    synchronizedImages
      .filter((image) => image.cloudinaryPublicId)
      .map((image) => [image.cloudinaryPublicId as string, image]),
  );
  const uploadCount = orderedImages.filter(
    (image) => !existingByPublicId.has(image.cloudinaryPublicId),
  ).length;
  const syncPublicIds = new Set(images.map((image) => image.cloudinaryPublicId));
  const removedImages = synchronizedImages.filter(
    (image) => !syncPublicIds.has(image.cloudinaryPublicId ?? ""),
  );

  return {
    synchronizedImages,
    manualImages,
    orderedImages,
    primarySyncedImage,
    primaryManualImage,
    primaryImageUrl: primarySyncedImage?.imageUrl ?? primaryManualImage?.imageUrl ?? null,
    removedImages,
    existingByPublicId,
    uploadCount,
    updateCount: orderedImages.length - uploadCount,
  };
}

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
  if (!publicId) return false;
  const prefix = inventoryImagePublicIdPrefix(sourceInventoryDeviceId);
  const cloudinaryFolderPrefix = `${INVENTORY_IMAGE_CLOUDINARY_FOLDER}/`;
  const normalizedPublicId = publicId.startsWith(cloudinaryFolderPrefix)
    ? publicId.slice(cloudinaryFolderPrefix.length)
    : publicId;
  return normalizedPublicId.startsWith(prefix);
}
