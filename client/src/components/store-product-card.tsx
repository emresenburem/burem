import { Link } from "wouter";
import { CheckCircle2, MessageCircle, Package, Phone, XCircle } from "lucide-react";
import type { ProductWithImages } from "@shared/schema";
import { PHONE_NUMBER } from "@/lib/site-contact";
import { conditionLabel, optimizedProductImageUrl, productPath, productWhatsAppLink } from "@/lib/product-utils";

interface StoreProductCardProps {
  product: ProductWithImages;
}

export default function StoreProductCard({ product }: StoreProductCardProps) {
  const condition = conditionLabel(product.condition);
  const coverUrl = product.images[0]?.imageUrl ?? product.imageUrl;

  return (
    <article
      className="group flex min-h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
      data-testid={`card-product-${product.id}`}
    >
      <Link
        href={productPath(product)}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        data-testid={`link-product-${product.id}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {coverUrl ? (
            <img
              src={optimizedProductImageUrl(coverUrl, 720)}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
          <span
            className={`absolute right-3 top-3 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
              product.inStock
                ? "border-emerald-200/60 bg-emerald-50/95 text-emerald-700"
                : "border-red-200/60 bg-red-50/95 text-red-600"
            }`}
          >
            {product.inStock ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Stokta
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Stok Dışı
              </>
            )}
          </span>
          {condition && condition !== "Sıfır" && (
            <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-foreground">
              {condition}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            <span>{product.brand}</span>
            <span className="h-1 w-1 rounded-full bg-primary/40" />
            <span className="text-muted-foreground">{product.category}</span>
          </div>
          <h2
            className="line-clamp-2 text-base font-bold leading-snug text-foreground"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h2>
          {product.partNumber && (
            <p className="font-mono text-[11px] font-medium text-muted-foreground">
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

      <div className="flex flex-col gap-2 px-5 pb-5">
        <a
          href={productWhatsAppLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#20ba5a]"
          data-testid={`button-wa-${product.id}`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp’tan Fiyat Sor
        </a>
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          data-testid={`button-phone-${product.id}`}
        >
          <Phone className="h-3.5 w-3.5" />
          Ara
        </a>
      </div>
    </article>
  );
}