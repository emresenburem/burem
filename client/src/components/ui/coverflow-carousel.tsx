"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  scale?: number;
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  cardWidth?: string;
  cardHeight?: string;
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  gap?: number;
  autoPlay?: boolean;
  autoPlaySpeed?: number;
  showNavigation?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  cardWidth = "clamp(150px, 18vw, 220px)",
  cardHeight = "74px",
  rotate = 38,
  depth = 0.3,
  perspective = 4,
  falloff = 0.62,
  fade = 0.13,
  gap = 0.08,
  autoPlay = true,
  autoPlaySpeed = 0.32,
  showNavigation = false,
  label = "Marka logoları",
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const count = slides.length;
  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const widthRef = React.useRef(0);
  const positionRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const selectedRef = React.useRef(0);
  const dragRef = React.useRef<{
    id: number;
    startX: number;
    startPosition: number;
    velocity: number;
    time: number;
  } | null>(null);
  const settleFrameRef = React.useRef<number | null>(null);
  const autoFrameRef = React.useRef<number | null>(null);
  const autoTimeRef = React.useRef<number | null>(null);
  const settlingRef = React.useRef(false);
  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback(
    (position: number) =>
      count ? ((Math.round(position) % count) + count) % count : 0,
    [count],
  );

  const updateSelected = React.useCallback(
    (position: number) => {
      const next = indexAt(position);
      if (next !== selectedRef.current) {
        selectedRef.current = next;
        setSelected(next);
      }
    },
    [indexAt],
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width || !count) return;

    const pitch = width * (1 + gap);
    let position = positionRef.current;

    // Keep the internal value small after long-running autoplay.
    if (Math.abs(position) > count * 100) {
      position %= count;
      positionRef.current = position;
      targetRef.current = position;
    }

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - position;
      offset = ((offset % count) + count) % count;
      if (offset > count / 2) offset -= count;

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
      const edge = Math.min(1, Math.max(0, count / 2 - distance));
      const scale = Math.max(0.86, 1.06 - Math.min(distance, 3) * 0.055);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg) ` +
        `scale(${scale})`;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });

    updateSelected(position);
  }, [count, depth, fade, falloff, gap, rotate, updateSelected]);

  const clamp = React.useCallback(
    (position: number) =>
      Math.max(0, Math.min(count - 1, position)),
    [count],
  );

  const settle = React.useCallback(
    (target: number) => {
      if (!count) return;
      if (settleFrameRef.current !== null) {
        cancelAnimationFrame(settleFrameRef.current);
      }

      targetRef.current = target;
      settlingRef.current = true;
      updateSelected(target);

      const step = () => {
        const remaining = target - positionRef.current;
        if (Math.abs(remaining) < 0.0004) {
          positionRef.current = target;
          settlingRef.current = false;
          paint();
          settleFrameRef.current = null;
          return;
        }

        positionRef.current += remaining * 0.16;
        paint();
        settleFrameRef.current = requestAnimationFrame(step);
      };

      settleFrameRef.current = requestAnimationFrame(step);
    },
    [count, paint, updateSelected],
  );

  const nudge = React.useCallback(
    (direction: number) =>
      settle(Math.round(targetRef.current) + direction),
    [settle],
  );

  const goTo = React.useCallback(
    (index: number) => {
      if (!count) return;
      const target =
        index + Math.round((targetRef.current - index) / count) * count;
      settle(target);
    },
    [count, settle],
  );

  React.useEffect(() => {
    if (!autoPlay || count < 2) return;

    const tick = (now: number) => {
      const previous = autoTimeRef.current ?? now;
      autoTimeRef.current = now;

      if (!dragRef.current && !settlingRef.current) {
        positionRef.current += ((now - previous) / 1000) * autoPlaySpeed;
        targetRef.current = positionRef.current;
        paint();
      }

      autoFrameRef.current = requestAnimationFrame(tick);
    };

    autoFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (autoFrameRef.current !== null) cancelAnimationFrame(autoFrameRef.current);
      autoFrameRef.current = null;
      autoTimeRef.current = null;
    };
  }, [autoPlay, autoPlaySpeed, count, paint]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!count) return;
    if (settleFrameRef.current !== null) {
      cancelAnimationFrame(settleFrameRef.current);
      settleFrameRef.current = null;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startPosition: positionRef.current,
      velocity: 0,
      time: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = positionRef.current;
    positionRef.current =
      drag.startPosition - (event.clientX - drag.startX) / pitch;
    drag.velocity =
      ((positionRef.current - previous) / Math.max(now - drag.time, 1)) * 1000;
    drag.time = now;
    targetRef.current = positionRef.current;
    paint();
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.velocity * 0.18));
    settle(Math.round(positionRef.current + carried));
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

  React.useEffect(
    () => () => {
      if (settleFrameRef.current !== null) cancelAnimationFrame(settleFrameRef.current);
      if (autoFrameRef.current !== null) cancelAnimationFrame(autoFrameRef.current);
    },
    [],
  );

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
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
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
            className="relative mx-auto h-[var(--cf-card-height)] w-full select-none"
            style={{ transformStyle: "preserve-3d" }}
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
                  "absolute left-1/2 top-0 flex h-[var(--cf-card-height)] items-center justify-center rounded-2xl bg-background/85 px-3 shadow-lg will-change-transform",
                  cardClassName,
                )}
                style={{ width: "var(--cf-card)" }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                  style={slide.scale ? { transform: `scale(${slide.scale})` } : undefined}
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
              className="absolute left-2 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-sm backdrop-blur"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Sonraki logo"
              onClick={() => nudge(1)}
              className="absolute right-2 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-sm backdrop-blur"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}