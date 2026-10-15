import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductWithImages } from "@shared/schema";
import StoreProductCard from "@/components/store-product-card";

interface StoreProductCarouselProps {
  title: string;
  subtitle: string;
  products: ProductWithImages[];
}

export default function StoreProductCarousel({
  title,
  subtitle,
  products,
}: StoreProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setCanGoPrev(track.scrollLeft > 1);
    setCanGoNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollTo({ left: 0 });
    updateControls();

    const observer = new ResizeObserver(updateControls);
    observer.observe(track);
    return () => observer.disconnect();
  }, [products, updateControls]);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <section aria-label={title} className="mt-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
            Burem Elektronik <span className="px-1 text-muted-foreground/50">/</span> Yedek Parça
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <span className="mr-1 text-xs font-semibold tabular-nums text-muted-foreground">
            {products.length} ürün
          </span>
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canGoPrev}
            aria-label="Önceki ürünler"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border disabled:hover:bg-card disabled:hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canGoNext}
            aria-label="Sonraki ürünler"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border disabled:hover:bg-card disabled:hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateControls}
        role="region"
        aria-label="Ürünler arasında yatay gezinme"
        tabIndex={0}
        data-testid="grid-products"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[88%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]"
          >
<StoreProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between sm:hidden">
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {products.length} ürün
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canGoPrev}
            aria-label="Önceki ürünler"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canGoNext}
            aria-label="Sonraki ürünler"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
