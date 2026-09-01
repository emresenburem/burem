"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  cardHeight?: string;
  gap?: number;
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 38,
  depth = 0.3,
  perspective = 4,
  falloff = 0.62,
  fade = 0.13,
  cardWidth = "clamp(150px, 18vw, 220px)",
  cardHeight = "74px",
  gap = 0.08,
  loop = true,
  autoPlay = true,
  autoPlayInterval = 3000,
  showNavigation = false,
  label = "Marka logoları",
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const count = slides.length;
  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    velocity: number;
    time: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const indexAt = React.useCallback(
    (pos: number) => (count ? ((Math.round(pos) % count) + count) % count : 0),
    [count],
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width || !count) return;

    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const settle = React.useCallback(
    (target: number) => {
      if (!count) return;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }

        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [count, indexAt, paint],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const goTo = React.useCallback(
    (index: number) => {
      if (!count) return;
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!count) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      velocity: 0,
      time: performance.now(),
    };
    setIsPaused(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.velocity =
      ((posRef.current - previous) / Math.max(now - drag.time, 1)) * 1000;
    drag.time = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.velocity * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
    setIsPaused(false);
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame || !count) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [count, paint]);

  React.useEffect(() => {
    if (!autoPlay || isPaused || count < 2) return;
    const timer = window.setInterval(() => nudge(1), autoPlayInterval);
    return () => window.clearInterval(timer);
  }, [autoPlay, autoPlayInterval, count, isPaused, nudge]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides[selected];

  return (
    <div
      className={cn("w-full", className)}
      style={
        {
          "--cf-card": cardWidth,
          "--cf-card-height": cardHeight,
        } as React.CSSProperties
      }
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!dragRef.current) setIsPaused(false);
      }}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-7 outline-none ring-ring focus-visible:ring-2 active:cursor-grabbing md:py-8"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative mx-auto select-none"
            style={{
              width: "100%",
              height: "var(--cf-card-height)",
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={`${slide.src}-${index}`}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${count}: ${slide.alt}`}
                onClick={() => goTo(index)}
                className={cn(
                  "absolute left-1/2 top-0 flex items-center justify-center rounded-2xl bg-background/85 px-3 shadow-lg will-change-transform",
                  cardClassName,
                )}
                style={{
                  width: "var(--cf-card)",
                  height: "var(--cf-card-height)",
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Önceki logo"
              onClick={() => nudge(-1)}
              className="absolute left-2 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Sonraki logo"
              onClick={() => nudge(1)}
              className="absolute right-2 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {active?.title && (
        <div className="mt-1 text-center text-sm font-semibold text-foreground">
          {active.title}
          {active.subtitle && (
            <span className="ml-2 font-normal text-muted-foreground">
              {active.subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}