export function formatProductPrice(
  price?: string | number | null,
  currency?: string | null,
): string | null {
  if (price === null || price === undefined || String(price).trim() === "") return null;

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return null;
  if (currency !== "TRY" && currency !== "USD") return null;

  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export function productWhatsAppButtonLabel(
  price?: string | number | null,
  currency?: string | null,
): string {
  return formatProductPrice(price, currency)
    ? "WhatsApp’tan Sipariş ve Bilgi Al"
    : "WhatsApp’tan Fiyat Sor";
}
