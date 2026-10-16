import { Link } from "wouter";
import { MessageCircle, Package, Phone } from "lucide-react";
import type { ProductWithImages } from "@shared/schema";
import { PHONE_NUMBER } from "@/lib/site-contact";
import { conditionLabel, formatProductPrice, optimizedProductImageUrl, productPath, productWhatsAppLink } from "@/lib/product-utils";

interface StoreProductCardProps {
  product: ProductWithImages;
}

export default function StoreProductCard({ product }: StoreProductCardProps) {
  const condition = conditionLabel(product.condition);
  const coverUrl = product.images[0]?.imageUrl ?? product.imageUrl;
  const formattedPrice = formatProductPrice(product.price, product.currency);

  return (
    <article
      className="group flex min-h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,.09)]"
      data-testid={`card-product-${product.id}`}
    >
      <Link
        href={productPath(product)}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        data-testid={`link-product-${product.id}`}
        data-analytics-product-name={product.name}
      >
        <div className="relative aspect-[1.42] overflow-hidden bg-[#f0f1ef] p-3">
          {coverUrl ? (
            <img
              src={optimizedProductImageUrl(coverUrl, 720)}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-12 w-12 text-slate-300" />
            </div>
          )}
          <span
            className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm ${
              product.inStock
                ? "border-slate-200 bg-white/95 text-slate-700"
                : "border-red-200 bg-white/95 text-red-700"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-500"}`} />
            {product.inStock ? "Stokta" : "Stok dışı"}
          </span>
          {condition && condition !== "Sıfır" && (
            <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-foreground">
              {condition}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 px-4 pb-3 pt-3">
          <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-sky-700">
            <span>{product.brand}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-slate-500">{product.category}</span>
          </div>
          <h2
            className="line-clamp-2 min-h-[2.6rem] text-[15px] font-extrabold leading-snug text-slate-950"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h2>
          {formattedPrice && (
            <p className="text-[17px] font-extrabold tracking-tight text-slate-950" data-testid={`text-product-price-${product.id}`}>
              {formattedPrice}
            </p>
          )}
          {product.partNumber && (
            <p className="truncate font-mono text-[10px] font-medium tracking-[0.08em] text-slate-500">
              P/N: {product.partNumber}
            </p>
          )}
          {product.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-2 px-3 pb-3">
        <a
          href={productWhatsAppLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-2 text-[11px] font-bold text-white transition-colors hover:bg-slate-800"
          data-testid={`button-wa-${product.id}`}
        >
          <MessageCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">WhatsApp’tan Fiyat Sor</span>
        </a>
        <a
          href={`tel:${PHONE_NUMBER}`}
          aria-label="Telefonla ara"
          className="flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 transition-colors hover:bg-slate-50"
          data-testid={`button-phone-${product.id}`}
        >
          <Phone className="h-4 w-4" />
          <span className="sr-only">Ara</span>
        </a>
      </div>
    </article>
  );
}