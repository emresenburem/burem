import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Tüm sayfa scroll'u — sadece bu bölüm değil
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current;
    if (!video || !readyRef.current) return;
    const dur = video.duration;
    if (!isFinite(dur) || dur === 0) return;
    video.currentTime = Math.min(progress * dur, dur);
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      setReady(true);
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener("play", markReady, { once: true });
    video.addEventListener("canplay", markReady, { once: true });
    video.load();

    return () => {
      video.removeEventListener("play", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, []);

  return (
    /* fixed — header'ın altında, içerik üstüne kayarken arka planda oynar */
    <div
      className="fixed left-0 right-0 z-0 overflow-hidden"
      style={{ top: 0, height: "38svh" }}
    >
      <video
        ref={videoRef}
        src="/hero-video.mp4"
        className="h-full w-full object-cover transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
        autoPlay
        muted
        playsInline
        preload="auto"
        loop={false}
        disablePictureInPicture
        controlsList="nodownload"
        data-testid="scroll-video"
      />

      {!ready && (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        </div>
      )}

      {/* Alt geçiş — içerik üzerine kayarken yumuşak bağlantı */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
