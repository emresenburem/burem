import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

export interface ShowcaseItem {
  title: string;
  description: string;
  tag?: string;
  image: string;
}

interface ShowcaseListProps {
  items: ShowcaseItem[];
  className?: string;
}

export function ShowcaseList({ items, className = "" }: ShowcaseListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.12),
        y: lerp(prev.y, mousePosition.y, 0.12),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePosition]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsVisible(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full ${className}`}
    >
      {/* Floating image that follows cursor */}
      <div
        className="pointer-events-none fixed z-[100] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          width: 280,
          height: 180,
          left: 0,
          top: 0,
          transform: `translate3d(${smoothPosition.x + 24}px, ${smoothPosition.y - 110}px, 0)`,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.85,
          transition: "opacity 0.25s cubic-bezier(0.4,0,0.2,1), scale 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {items.map((item, index) => (
          <img
            key={item.title}
            src={item.image}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
            style={{
              opacity: hoveredIndex === index ? 1 : 0,
              transform: hoveredIndex === index ? "scale(1)" : "scale(1.08)",
              filter: hoveredIndex === index ? "none" : "blur(8px)",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* List */}
      <div className="space-y-0">
        {items.map((item, index) => (
          <div
            key={item.title}
            className="group block cursor-default"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative py-5 border-t border-border transition-all duration-300 ease-out">
              <div
                className={`absolute inset-0 -mx-4 px-4 bg-secondary/40 rounded-lg transition-all duration-300 ease-out ${
                  hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2">
                    <h3 className="text-foreground font-medium text-lg tracking-tight">
                      <span className="relative">
                        {item.title}
                        <span
                          className={`absolute left-0 -bottom-0.5 h-px bg-foreground transition-all duration-300 ease-out ${
                            hoveredIndex === index ? "w-full" : "w-0"
                          }`}
                        />
                      </span>
                    </h3>
                    <ArrowUpRight
                      className={`w-4 h-4 text-muted-foreground transition-all duration-300 ease-out ${
                        hoveredIndex === index
                          ? "opacity-100 translate-x-0 translate-y-0"
                          : "opacity-0 -translate-x-2 translate-y-2"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-sm mt-1 leading-relaxed transition-all duration-300 ease-out ${
                      hoveredIndex === index ? "text-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
                {item.tag && (
                  <span
                    className={`text-xs font-mono tabular-nums transition-all duration-300 ease-out shrink-0 ${
                      hoveredIndex === index ? "text-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="border-t border-border" />
      </div>
    </div>
  );
}
