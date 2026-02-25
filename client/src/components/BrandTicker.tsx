import React from "react";

type Brand = { name: string; logo: string; scale?: number };

export function BrandTicker({ brands }: { brands: Brand[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] border-b bg-background/80 backdrop-blur">
      <div className="relative overflow-hidden">
        <div className="flex items-center gap-10 py-2 animate-marquee">
          {brands.concat(brands).map((b, i) => (
            <div key={`${b.name}-${i}`} className="h-8 flex items-center justify-center">
              <img
                src={b.logo}
                alt={b.name}
                className="max-h-7 w-auto object-contain"
                style={{ transform: `scale(${b.scale ?? 1})` }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}