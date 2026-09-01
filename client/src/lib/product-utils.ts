import type { Product } from "@shared/schema";
import { SITE_URL, whatsappLink } from "@/lib/site-contact";

export const CONDITION_LABELS: Record<string, string> = {
  new: "Sıfır",
  used: "2. El",
  refurbished: "Yenilenmiş",
};

export function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function productSlug(name: string) {
  return normalizeSearchText(name)
    .replace(/&/g, " ve ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "urun";
}

type ProductLinkData = Pick<Product, "name"> & { id: string | number };
type ProductContactData = ProductLinkData & {
  brand: string;
  partNumber?: string | null;
};

export function productPath(product: ProductLinkData) {
  return `/magaza/urun/${encodeURIComponent(product.id)}/${productSlug(product.name)}`;
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}${path}`;
  }
  return `${SITE_URL}${path}`;
}

export function productAbsoluteUrl(product: ProductLinkData) {
  return absoluteUrl(productPath(product));
}

export function productWhatsAppMessage(
  product: ProductContactData,
) {
  const lines = [
    "Merhaba, Burem Elektronik mağazanızdaki şu ürün hakkında bilgi ve fiyat almak istiyorum:",
    "",
    product.name ? `Ürün: ${product.name}` : undefined,
    product.brand ? `Marka: ${product.brand}` : undefined,
    product.partNumber ? `Parça No: ${product.partNumber}` : undefined,
    `Ürün bağlantısı: ${productAbsoluteUrl(product)}`,
  ];

  return lines.filter((line): line is string => line !== undefined).join("\n");
}

export function productWhatsAppLink(
  product: ProductContactData,
) {
  return whatsappLink(productWhatsAppMessage(product));
}

export function conditionLabel(condition?: string | null) {
  return condition ? CONDITION_LABELS[condition] ?? condition : null;
}