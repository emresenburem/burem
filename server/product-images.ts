import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
type ProductImageMimeType = (typeof MIME_TYPES)[number];

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary ortam değişkenleri yapılandırılmamış");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export function isProductImageStorageConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function hasValidSignature(buffer: Buffer, mimeType: ProductImageMimeType) {
  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  }
  if (mimeType === "image/jpeg") {
    return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  }
  if (mimeType === "image/gif") {
    return buffer.subarray(0, 4).toString("ascii") === "GIF8";
  }
  return (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

function safePublicId(publicId?: string) {
  return (publicId || `upload-${randomUUID()}`).replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function uploadProductImageBuffer(
  buffer: Buffer,
  mimeType: ProductImageMimeType,
  publicId?: string,
) {
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Görsel 6 MB'dan küçük olmalıdır");
  }
  if (!hasValidSignature(buffer, mimeType)) {
    throw new Error("Geçersiz görsel dosyası");
  }

  const encoded = buffer.toString("base64");
  const result = await getCloudinary().uploader.upload(
    `data:${mimeType};base64,${encoded}`,
    {
      folder: "burem/products",
      public_id: safePublicId(publicId),
      resource_type: "image",
      overwrite: true,
      invalidate: true,
    },
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function uploadProductImageDataUrl(
  dataUrl: string,
  publicId?: string,
) {
  const match = dataUrl.match(
    /^data:(image\/(?:png|jpeg|webp|gif));base64,([\s\S]+)$/,
  );
  if (!match) {
    throw new Error("Sadece PNG, JPEG, WebP veya GIF yüklenebilir");
  }

  const mimeType = match[1] as ProductImageMimeType;
  return uploadProductImageBuffer(
    Buffer.from(match[2], "base64"),
    mimeType,
    publicId,
  );
}