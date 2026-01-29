import { useCallback, useEffect, useRef } from "react";

export function useClickSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playClick = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, ctx.currentTime);

    oscillator.connect(filter);
    oscillator2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    oscillator2.type = "sine";
    oscillator2.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.06);

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
    oscillator2.stop(ctx.currentTime + 0.1);
  }, []);

  return playClick;
}

export function useGlobalClickSound() {
  const playClick = useClickSound();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest("[data-clickable]")
      ) {
        playClick();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [playClick]);
}
