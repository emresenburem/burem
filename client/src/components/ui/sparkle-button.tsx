import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  distance: number;
}

const COLORS = [
  "#1e293b", "#475569", "#94a3b8", "#64748b", "#334155",
];

let pid = 0;

function generateParticles(rect: DOMRect, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    id: pid++,
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    size: Math.random() * 3 + 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    angle: Math.random() * 360,
    distance: Math.random() * 28 + 12,
  }));
}

interface SparkleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
  className?: string;
}

export function SparkleButton({ children, className, variant, size, ...props }: SparkleButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startParticles = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setParticles((prev) => [
        ...prev.slice(-24),
        ...generateParticles(rect, 4),
      ]);
    }, 80);
  }, []);

  const stopParticles = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeout(() => setParticles([]), 600);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={startParticles}
      onMouseLeave={stopParticles}
    >
      {/* Particle layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[6px]" aria-hidden="true">
        <AnimatePresence>
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const dx = Math.cos(rad) * p.distance;
            const dy = Math.sin(rad) * p.distance - p.distance * 0.8;
            return (
              <motion.span
                key={p.id}
                initial={{ opacity: 0.9, x: p.x, y: p.y, scale: 1 }}
                animate={{ opacity: 0, x: p.x + dx, y: p.y + dy, scale: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <Button
        variant={variant}
        size={size}
        className={cn("relative z-10", className)}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}
