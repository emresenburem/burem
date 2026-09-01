"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";

export type LogoCarouselItem = {
  name: string;
  logo: string;
  scale?: number;
  w?: number;
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);
    updateMatches();
    mediaQuery.addEventListener("change", updateMatches);
    return () => mediaQuery.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}

const LogoCylinder = memo(function LogoCylinder({
  logos,
  rotation,
  activeIndex,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
  dragEnabled,
}: {
  logos: LogoCarouselItem[];
  rotation: ReturnType<typeof useMotionValue<number>>;
  activeIndex: number;
  onSelect: (index: number) => void;
  onDragStart: () => void;
  onDrag: (_event: unknown, info: { offset: { x: number } }) => void;
  onDragEnd: (_event: unknown, info: { velocity: { x: number } }) => void;
  dragEnabled: boolean;
}) {
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const faceWidth = isSmallScreen ? 118 : 150;
  const faceHeight = isSmallScreen ? 58 : 68;
  const cylinderWidth = faceWidth * logos.length;
  const radius = cylinderWidth / (2 * Math.PI);
  const faceAngle = 360 / logos.length;

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <motion.div
        drag={dragEnabled ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{
          width: cylinderWidth,
          rotateY: rotation,
          transformStyle: "preserve-3d",
        }}
      >
        {logos.map((brand, index) => {
          const isFeatured = index === activeIndex;

          return (
            <motion.div
              key={brand.name}
              onClick={() => onSelect(index)}
              className="absolute left-1/2 top-1/2 flex origin-center -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl p-2"
              style={{
                width: faceWidth,
                height: faceHeight,
                transform: `rotateY(${index * faceAngle}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
                cursor: "pointer",
              }}
              animate={{
                scale: isFeatured ? 1.08 : 0.9,
                opacity: isFeatured ? 1 : 0.76,
                filter: isFeatured
                  ? "drop-shadow(0 8px 12px rgba(15, 23, 42, 0.2))"
                  : "none",
              }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              role="button"
              tabIndex={0}
              aria-label={`${brand.name} logosunu öne çıkar`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(index);
                }
              }}
            >
              <div
                className={`flex h-full w-full items-center justify-center rounded-xl px-2 ${
                  isFeatured
                    ? "border border-border/60 bg-background/90 shadow-sm"
                    : "border border-transparent bg-background/35"
                }`}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-full w-full object-contain"
                  style={brand.scale ? { transform: `scale(${brand.scale})` } : undefined}
                  draggable={false}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
});

export function BrandLogoCarousel({ logos }: { logos: LogoCarouselItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const rotation = useMotionValue(0);
  const dragStartRotation = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const step = 360 / logos.length;

  const orderedLogos = useMemo(() => logos, [logos]);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || orderedLogos.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % orderedLogos.length;
        animate(rotation, rotation.get() - step, {
          duration: 1.1,
          ease: [0.32, 0.72, 0, 1],
        });
        return next;
      });
    }, 3000);

    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion, orderedLogos.length, rotation, step]);

  const rotateTo = (index: number) => {
    const delta = index - activeIndex;
    const shortestDelta =
      delta > orderedLogos.length / 2
        ? delta - orderedLogos.length
        : delta < -orderedLogos.length / 2
          ? delta + orderedLogos.length
          : delta;

    setActiveIndex(index);
    animate(rotation, rotation.get() - shortestDelta * step, {
      duration: 0.75,
      ease: [0.32, 0.72, 0, 1],
    });
  };

  const handleDragStart = () => {
    dragStartRotation.current = rotation.get();
  };

  const handleDrag = (_event: unknown, info: { offset: { x: number } }) => {
    rotation.set(dragStartRotation.current + info.offset.x * 0.35);
  };

  const handleDragEnd = (_event: unknown, info: { velocity: { x: number } }) => {
    const velocityRotation = info.velocity.x * 0.04;
    const targetRotation =
      Math.round((rotation.get() + velocityRotation) / step) * step;
    const targetFace = Math.round(-targetRotation / step);
    const nextIndex =
      ((targetFace % orderedLogos.length) + orderedLogos.length) %
      orderedLogos.length;

    setActiveIndex(nextIndex);
    animate(rotation, targetRotation, {
      type: "spring",
      stiffness: 100,
      damping: 30,
      mass: 0.35,
    });
  };

  return (
    <div
      className="relative w-full overflow-hidden border-y border-border/30 py-5 md:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="brand-carousel"
    >
      <div className="relative mx-auto h-20 w-full max-w-6xl md:h-24">
        <LogoCylinder
          logos={orderedLogos}
          rotation={rotation}
          activeIndex={activeIndex}
          onSelect={rotateTo}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          dragEnabled={!prefersReducedMotion}
        />
      </div>
    </div>
  );
}