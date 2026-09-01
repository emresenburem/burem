import * as React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { optimizedProductImageUrl, productWhatsAppLink } from "@/lib/product-utils";

export interface CarouselProduct {
  id: string | number;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string | null;
  inStock: boolean;
  description?: string | null;
  partNumber?: string | null;
}

interface ProductCardProps {
  product: CarouselProduct;
  onClick?: (product: CarouselProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div
      className="group w-[min(20rem,calc(100vw-3rem))] flex-shrink-0 cursor-pointer sm:w-72 lg:w-80"
      onClick={() => onClick?.(product)}
      data-testid={`carousel-card-${product.id}`}
    >
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        {/* Görsel */}
        <div className="relative h-52 overflow-hidden bg-muted sm:h-56">
          {product.imageUrl ? (
            <img
              src={optimizedProductImageUrl(product.imageUrl, 640)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <ShoppingCart className="h-10 w-10" />
            </div>
          )}
          <div className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600">
            Stok bilgisi sorunuz
          </div>
        </div>

        {/* Detaylar */}
        <div className="flex flex-col space-y-4 p-5">
          <h3 className="line-clamp-2 h-12 text-base font-semibold leading-snug text-foreground">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {product.brand} · {product.category}
          </p>

          <motion.a
            href={productWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            whileTap={{ scale: 0.95 }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#20ba5a]"
            data-testid={`button-add-${product.id}`}
          >
            <MessageCircle className="h-3 w-3" />
            WhatsApp’tan Fiyat Sor
          </motion.a>
        </div>
      </div>
    </div>
  );
};

interface ProductCarouselProps {
  title: string;
  products: CarouselProduct[];
  viewAllHref?: string;
  onProductClick?: (product: CarouselProduct) => void;
  className?: string;
  emptyMessage?: string;
}

export const ProductCarousel = React.forwardRef<HTMLDivElement, ProductCarouselProps>(
  ({ title, products, viewAllHref = "#", onProductClick, className, emptyMessage }, ref) => {
    return (
      <section className={cn("relative w-full space-y-5 py-10", className)} ref={ref}>
        <div className="flex items-center justify-between px-4 sm:px-6">
          <h2
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
          >
            {title}
          </h2>
          {viewAllHref !== "#" && (
            <a
              href={viewAllHref}
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Tümünü gör
            </a>
          )}
        </div>

        {products.length === 0 ? (
          <div className="px-4 sm:px-6 py-12 text-center text-muted-foreground text-sm">
            {emptyMessage ?? "Henüz ürün eklenmemiş."}
          </div>
        ) : products.length < 4 ? (
          <div className="flex gap-6 overflow-x-auto px-4 pb-2 sm:gap-8 sm:px-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onClick={onProductClick} />
            ))}
          </div>
        ) : (
          <div className="relative h-[370px]">
            <InfiniteSlider
              gap={24}
              duration={45}
              durationOnHover={120}
              className="h-full px-4 sm:px-6"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onClick={onProductClick} />
              ))}
            </InfiniteSlider>

            {/* Sol kenar silikleştirme */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
            {/* Sağ kenar silikleştirme */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
          </div>
        )}
      </section>
    );
  }
);

ProductCarousel.displayName = "ProductCarousel";
