import { DEFAULT_OG_IMAGE, SITE_ORIGIN } from "./site-seo";

export type ProductSeoInput = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description?: string | null;
  partNumber?: string | null;
  imageUrl?: string | null;
  price?: string | number | null;
  currency?: string | null;
  condition?: string | null;
  inStock?: boolean | null;
  isPublished?: boolean | null;
};

export function slugifyProductPart(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " ve ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function productSeoSlug(product: Pick<ProductSeoInput, "name" | "brand" | "partNumber">): string {
  const name = slugifyProductPart(product.name);
  const brand = slugifyProductPart(product.brand);
  const modelNormalized = product.partNumber ? slugifyProductPart(product.partNumber) : "";
  const model = product.partNumber?.trim() ?? "";
  return [brand && !name.startsWith(`${brand}-`) ? brand : "",
    model && !name.includes(modelNormalized) ? encodeURIComponent(model) : "", name]
    .filter(Boolean).join("-").slice(0, 120).replace(/-+$/g, "") || "urun";
}

export function productSeoPath(product: Pick<ProductSeoInput, "id" | "name" | "brand" | "partNumber">): string {
  return `/magaza/urun/${encodeURIComponent(product.id)}/${productSeoSlug(product)}`;
}

export function productSeoTitle(product: Pick<ProductSeoInput, "name" | "brand" | "category" | "partNumber">): string {
  const name = product.name.trim();
  const nameSlug = slugifyProductPart(name);
  const fields = slugifyProductPart(product.brand) && !nameSlug.startsWith(slugifyProductPart(product.brand))
    ? [product.brand.trim()] : [];
  if (product.partNumber && !nameSlug.includes(slugifyProductPart(product.partNumber))) fields.push(product.partNumber.trim());
  fields.push(name);
  if (product.category.trim() && !nameSlug.includes(slugifyProductPart(product.category))) fields.push(product.category.trim());
  return `${Array.from(new Set(fields.filter(Boolean))).join(" ")} | Burem Elektronik`;
}

export function productSeoDescription(product: Pick<ProductSeoInput, "name" | "brand" | "category" | "description" | "partNumber">): string {
  const description = product.description?.trim();
  return (description || [
    product.brand.trim(), product.partNumber?.trim(), product.name.trim(), product.category.trim(),
    "yedek parçası. Stok ve fiyat bilgisi için Burem Elektronik ile iletişime geçin.",
  ].filter(Boolean).join(" ")).slice(0, 300);
}

const conditions: Record<string, string> = {
  new: "NewCondition", used: "UsedCondition", refurbished: "RefurbishedCondition",
};

export function productStructuredData(product: ProductSeoInput, canonical: string) {
  const origin = new URL(SITE_ORIGIN).origin;
  const image = product.imageUrl
    ? (/^https?:\/\//i.test(product.imageUrl) ? product.imageUrl : new URL(product.imageUrl, origin).toString())
    : DEFAULT_OG_IMAGE;
  const rawPrice = product.price;
  const price = rawPrice === null || rawPrice === undefined || String(rawPrice).trim() === ""
    ? Number.NaN
    : Number(rawPrice);
  const currency = product.currency === "TRY" || product.currency === "USD"
    ? product.currency
    : undefined;
  const item: Record<string, unknown> = {
    "@type": "Product",
    name: productSeoTitle(product).replace(/ \| Burem Elektronik$/, ""),
    description: productSeoDescription(product),
    url: canonical,
    image: [image],
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.category ? { category: product.category } : {}),
    ...(product.partNumber ? { mpn: product.partNumber, model: product.partNumber } : {}),
    ...(product.condition && conditions[product.condition]
      ? { itemCondition: `https://schema.org/${conditions[product.condition]}` } : {}),
  };
  const hasVerifiedOffer = Number.isFinite(price) && price > 0 && currency !== undefined;
  if (hasVerifiedOffer) {
    item.offers = {
      "@type": "Offer", url: canonical, price: price.toFixed(2),
      priceCurrency: currency,
      availability: product.inStock === true ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    };
  }
  const graph: Array<Record<string, unknown>> = [];
  if (hasVerifiedOffer) graph.push(item);
  graph.push({ "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${origin}/` },
    { "@type": "ListItem", position: 2, name: "Yedek Parça Kataloğu", item: `${origin}/magaza` },
    { "@type": "ListItem", position: 3, name: product.category, item: `${origin}/magaza/kategori/${encodeURIComponent(slugifyProductPart(product.category))}` },
    { "@type": "ListItem", position: 4, name: product.brand, item: `${origin}/magaza/marka/${encodeURIComponent(slugifyProductPart(product.brand))}` },
    { "@type": "ListItem", position: 5, name: product.partNumber || product.name, item: canonical },
  ] });
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
