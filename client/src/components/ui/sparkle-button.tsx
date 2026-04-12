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
  dx: number;
  dy: number;
}

const COLORS = ["#1e293b", "#475569", "#94a3b8", "#64748b"];

let pid = 0;

function generateParticles(rect: DOMRect, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 22 + 8;
    return {
      id: pid++,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height * 0.6,
      size: Math.random() * 2.5 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - dist,
    };
  });
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
    // Daha az sıklık (120ms) ve daha az partikül (3) — önceki 80ms/4'ten daha hafif
    intervalRef.current = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setParticles((prev) => [...prev.slice(-15), ...generateParticles(rect, 3)]);
    }, 120);
  }, []);

  const stopParticles = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeout(() => setParticles([]), 500);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={startParticles}
      onMouseLeave={stopParticles}
    >
      {/* Partikül katmanı — overflow:hidden sayesinde buton dışına taşmaz */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[6px]" aria-hidden="true">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0.85, x: p.x, y: p.y, scale: 1 }}
              animate={{ opacity: 0, x: p.x + p.dx, y: p.y + p.dy, scale: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                backgroundColor: p.color,
                top: 0,
                left: 0,
                willChange: "transform, opacity",
              }}
            />
          ))}
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
