"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LogoCarouselItem {
  name: string;
  logo: string;
  scale?: number;
}

interface LogoColumnProps {
  logos: LogoCarouselItem[];
  index: number;
  currentTime: number;
  cycleInterval: number;
  reducedMotion: boolean;
}

const distributeLogos = (logos: LogoCarouselItem[], columnCount: number) => {
  const columns = Array.from({ length: columnCount }, () => [] as LogoCarouselItem[]);

  logos.forEach((logo, index) => {
    columns[index % columnCount].push(logo);
  });

  const longestColumn = Math.max(...columns.map((column) => column.length), 1);
  columns.forEach((column, columnIndex) => {
    let sourceIndex = columnIndex % logos.length;
    while (column.length < longestColumn && logos.length > 0) {
      column.push(logos[sourceIndex % logos.length]);
      sourceIndex += 1;
    }
  });

  return columns;
};

function LogoColumn({
  logos,
  index,
  currentTime,
  cycleInterval,
  reducedMotion,
}: LogoColumnProps) {
  const columnDelay = index * 320;
  const currentIndex = reducedMotion
    ? 0
    : Math.floor(((currentTime + columnDelay) % (cycleInterval * logos.length)) / cycleInterval);
  const currentLogo = logos[currentIndex] ?? logos[0];

  if (!currentLogo) return null;

  return (
    <div
      className="relative h-16 min-w-0 flex-1 overflow-hidden sm:h-20 md:h-24"
      aria-live="polite"
      aria-label={`${currentLogo.name} logosu`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${currentLogo.name}-${currentIndex}`}
          className="absolute inset-0 flex items-center justify-center px-3"
          initial={reducedMotion ? false : { y: "12%", opacity: 0, filter: "blur(7px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={reducedMotion ? undefined : { y: "-14%", opacity: 0, filter: "blur(6px)" }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  y: { type: "spring", stiffness: 290, damping: 22, mass: 0.8 },
                  opacity: { duration: 0.32 },
                  filter: { duration: 0.42 },
                }
          }
        >
          <img
            src={currentLogo.logo}
            alt={currentLogo.name}
            draggable={false}
            className="max-h-full w-full select-none object-contain"
            style={currentLogo.scale ? { transform: `scale(${currentLogo.scale})` } : undefined}
            onError={(event) => {
              const image = event.currentTarget;
              image.style.display = "none";
              const fallback = image.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <span className="hidden items-center justify-center text-center text-xs font-bold text-foreground/70">
            {currentLogo.name}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export interface LogoCarouselProps {
  logos: LogoCarouselItem[];
  columnCount?: number;
  mobileColumnCount?: number;
  cycleInterval?: number;
  className?: string;
}

export function LogoCarousel({
  logos,
  columnCount = 5,
  mobileColumnCount = 3,
  cycleInterval = 2200,
  className,
}: LogoCarouselProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );
  const [currentTime, setCurrentTime] = React.useState(0);
  const activeColumnCount = isMobile ? mobileColumnCount : columnCount;
  const columns = React.useMemo(
    () => distributeLogos(logos, Math.max(1, Math.min(activeColumnCount, logos.length || 1))),
    [logos, activeColumnCount],
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  React.useEffect(() => {
    if (reducedMotion || logos.length < 2) return;

    const startedAt = performance.now();
    let frameId = 0;
    const tick = (now: number) => {
      setCurrentTime(now - startedAt);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [logos.length, reducedMotion]);

  if (!logos.length) return null;

  return (
    <div
      className={cn("flex w-full items-center justify-between gap-2 sm:gap-8 md:gap-14 lg:gap-20", className)}
      aria-label="Burem Elektronik’in hizmet verdiği marka logoları"
      role="region"
    >
      {columns.map((column, index) => (
        <LogoColumn
          key={`logo-column-${index}`}
          logos={column}
          index={index}
          currentTime={currentTime}
          cycleInterval={cycleInterval}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}