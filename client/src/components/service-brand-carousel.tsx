import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface ServiceBrand {
  name: string;
  logo: string;
  color?: string;
  scale?: number;
  w?: number;
}

interface ServiceBrandCarouselProps {
  brands: ServiceBrand[];
  onBrandClick?: (brand: ServiceBrand) => void;
}

function BrandLogoCard({
  brand,
  onClick,
}: {
  brand: ServiceBrand;
  onClick?: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const content = imageError ? (
    <span
      className="px-2 text-center text-xs font-bold leading-tight"
      style={{ color: brand.color ?? "hsl(var(--foreground))" }}
    >
      {brand.name}
    </span>
  ) : (
    <img
      src={brand.logo}
      alt={`${brand.name} logosu`}
      width={150}
      height={44}
      loading="lazy"
      draggable={false}
      onError={() => setImageError(true)}
      className="h-11 w-full select-none object-contain grayscale opacity-65 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
      style={{
        transform: brand.scale ? `scale(${Math.min(brand.scale, 1.35)})` : undefined,
      }}
    />
  );

  if (!onClick) {
    return (
      <div
        className="group flex h-[68px] w-full items-center justify-center rounded-2xl border border-border/70 bg-card/80 px-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-md"
        aria-label={`${brand.name} logosu`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${brand.name} servis sayfasına git`}
      className="group flex h-[68px] w-full cursor-pointer items-center justify-center rounded-2xl border border-border/70 bg-card/80 px-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {content}
    </button>
  );
}

export default function ServiceBrandCarousel({
  brands,
  onBrandClick,
}: ServiceBrandCarouselProps) {
  const reducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      Array.from({ length: 3 }, (_, columnIndex) =>
        brands.filter((_, brandIndex) => brandIndex % 3 === columnIndex),
      ),
    [brands],
  );

  if (reducedMotion) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        aria-label="Servis verilen markalar"
      >
        {brands.map((brand) => (
          <BrandLogoCard
            key={brand.name}
            brand={brand}
            onClick={onBrandClick ? () => onBrandClick(brand) : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
      role="region"
      aria-roledescription="carousel"
      aria-label="Servis verilen markalar"
    >
      {columns.map((column, columnIndex) => {
        const distance = column.length * 80;
        const direction = columnIndex === 1 ? -1 : 1;

        return (
          <div
            key={`brand-column-${columnIndex}`}
            className="relative h-[244px] overflow-hidden rounded-[26px]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background to-transparent" />
            <motion.div
              animate={{
                y: direction === 1 ? [0, -distance] : [-distance, 0],
              }}
              transition={{
                duration: 26 + columnIndex * 4,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="flex flex-col gap-3 px-1 py-1"
            >
              {[...column, ...column].map((brand, index) => (
                <BrandLogoCard
                  key={`${brand.name}-${columnIndex}-${index}`}
                  brand={brand}
                  onClick={onBrandClick ? () => onBrandClick(brand) : undefined}
                />
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}