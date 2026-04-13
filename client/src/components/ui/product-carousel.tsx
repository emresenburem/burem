import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselProduct {
  id: string | number;
  name: string;
  brand: string;
  category: string;
  price?: number | null;
  imageUrl?: string | null;
  inStock: boolean;
  description?: string | null;
}

interface ProductCardProps {
  product: CarouselProduct;
  onClick?: (product: CarouselProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const formattedPrice = product.price
    ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
        product.price / 100
      )
    : null;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="group relative w-48 flex-shrink-0"
      data-testid={`carousel-card-${product.id}`}
    >
      <div
        className="flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all duration-300 hover:shadow-md cursor-pointer"
        onClick={() => onClick?.(product)}
      >
        {/* Görsel */}
        <div className="relative h-40 overflow-hidden bg-muted flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <ShoppingCart className="h-10 w-10" />
            </div>
          )}
          <div
            className={cn(
              "absolute left-2 top-2 rounded-md px-2 py-0.5 text-xs font-semibold",
              product.inStock
                ? "bg-green-100 text-green-800"
                : "bg-orange-100 text-orange-800"
            )}
          >
            {product.inStock ? "Stokta" : "Sipariş"}
          </div>
        </div>

        {/* Detaylar */}
        <div className="flex flex-col space-y-3 p-4">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{product.inStock ? "Hızlı kargo" : "3–7 iş günü"}</span>
          </div>

          <h3 className="line-clamp-2 text-sm font-medium text-foreground leading-snug h-10">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {product.brand} · {product.category}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              {formattedPrice ? (
                <span className="text-base font-semibold text-foreground">{formattedPrice}</span>
              ) : (
                <span className="text-sm text-muted-foreground italic">Fiyat sor</span>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="rounded-lg border border-primary bg-background px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              data-testid={`button-add-${product.id}`}
            >
              Teklif al
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
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
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [isScrollable, setIsScrollable] = React.useState(false);
    const [isAtStart, setIsAtStart] = React.useState(true);
    const [isAtEnd, setIsAtEnd] = React.useState(false);

    const handleScroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
        scrollContainerRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };

    const checkScrollState = React.useCallback(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      setIsScrollable(el.scrollWidth > el.clientWidth);
      setIsAtStart(el.scrollLeft === 0);
      setIsAtEnd(Math.abs(el.scrollWidth - el.scrollLeft - el.clientWidth) < 1);
    }, []);

    React.useEffect(() => {
      checkScrollState();
      const el = scrollContainerRef.current;
      el?.addEventListener("scroll", checkScrollState);
      window.addEventListener("resize", checkScrollState);
      return () => {
        el?.removeEventListener("scroll", checkScrollState);
        window.removeEventListener("resize", checkScrollState);
      };
    }, [checkScrollState, products]);

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };

    return (
      <section className={cn("relative w-full space-y-4 py-8", className)} ref={ref}>
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
        ) : (
          <div className="relative">
            <motion.div
              ref={scrollContainerRef}
              className="scrollbar-hide flex space-x-4 overflow-x-auto px-4 sm:px-6 pb-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onClick={onProductClick} />
              ))}
            </motion.div>

            {isScrollable && (
              <>
                <button
                  onClick={() => handleScroll("left")}
                  disabled={isAtStart}
                  aria-label="Sola kaydır"
                  className={cn(
                    "absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-2 shadow-md transition-opacity duration-300 disabled:opacity-0",
                    "hover:bg-accent focus:outline-none"
                  )}
                  data-testid="button-carousel-left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  disabled={isAtEnd}
                  aria-label="Sağa kaydır"
                  className={cn(
                    "absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-2 shadow-md transition-opacity duration-300 disabled:opacity-0",
                    "hover:bg-accent focus:outline-none"
                  )}
                  data-testid="button-carousel-right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        )}
      </section>
    );
  }
);

ProductCarousel.displayName = "ProductCarousel";
