"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AnimationPhase = "scatter" | "line" | "circle";

interface Brand {
  name: string;
  logo: string;
  color: string;
  scale?: number;
}

interface BrandCardProps {
  brand: Brand;
  index: number;
  total: number;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
  onClick: () => void;
}

const CARD_W = 110;
const CARD_H = 72;

function BrandCard({ brand, target, onClick }: BrandCardProps) {
  return (
    <motion.div
      animate={{ x: target.x, y: target.y, rotate: target.rotation, scale: target.scale, opacity: target.opacity }}
      transition={{ type: "spring", stiffness: 38, damping: 14 }}
      style={{ position: "absolute", width: CARD_W, height: CARD_H, transformStyle: "preserve-3d", perspective: "1000px" }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Ön yüz — logo */}
        <div
          className="absolute inset-0 h-full w-full flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-full w-full object-contain p-3"
            style={brand.scale ? { transform: `scale(${brand.scale})` } : undefined}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              const fb = img.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = "flex";
            }}
          />
          <span
            className="hidden items-center justify-center text-[10px] font-bold"
            style={{ color: brand.color }}
          >
            {brand.name}
          </span>
        </div>

        {/* Arka yüz — marka adı */}
        <div
          className="absolute inset-0 h-full w-full flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-md"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Markaya git</span>
          <span className="text-xs font-semibold text-white text-center leading-tight">{brand.name}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface BrandsMorphProps {
  brands: Brand[];
  onBrandClick: (brand: Brand) => void;
  onClose: () => void;
}

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export function BrandsMorph({ brands, onBrandClick, onClose }: BrandsMorphProps) {
  const [phase, setPhase] = useState<AnimationPhase>("scatter");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    setSize({ w: el.offsetWidth, h: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("line"), 400);
    const t2 = setTimeout(() => setPhase("circle"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const scatter = useMemo(() =>
    brands.map(() => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 800,
      rotation: (Math.random() - 0.5) * 160,
      scale: 0.5,
      opacity: 0,
    })), [brands]);

  const getTarget = useCallback((i: number) => {
    const total = brands.length;

    if (phase === "scatter") return scatter[i];

    if (phase === "line") {
      const spacing = CARD_W + 12;
      const totalW = total * spacing;
      return { x: i * spacing - totalW / 2, y: 0, rotation: 0, scale: 1, opacity: 1 };
    }

    // circle
    const radius = Math.min(size.w, size.h) * 0.36;
    const angle = (i / total) * 360;
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
      rotation: angle + 90,
      scale: 1,
      opacity: 1,
    };
  }, [phase, brands.length, scatter, size]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      {/* Merkez metin */}
      <AnimatePresence>
        {phase === "circle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="pointer-events-none absolute z-10 flex flex-col items-center text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Tamir ettiğimiz</p>
            <p className="text-2xl font-black tracking-tight text-foreground">Markalar</p>
            <p className="text-[10px] text-muted-foreground mt-1">Karta tıkla → markaya git</p>
          </motion.div>
        )}
      </AnimatePresence>

      {brands.map((brand, i) => (
        <BrandCard
          key={brand.name}
          brand={brand}
          index={i}
          total={brands.length}
          target={getTarget(i)}
          onClick={() => onBrandClick(brand)}
        />
      ))}
    </div>
  );
}
