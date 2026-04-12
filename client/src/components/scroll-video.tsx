import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export function ScrollVideo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

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

    /* iOS Safari: autoplay (muted + playsInline) tetiklenince
       browser video buffer'ını doldurur ve currentTime izin verir.
       İlk `play` event'i gelir gelmez pause yapıyoruz. */
    const onPlay = () => {
      markReady();
    };

    const onCanPlay = () => {
      /* iOS olmayan tarayıcılarda canplay yeterli */
      markReady();
    };

    video.addEventListener("play", onPlay, { once: true });
    video.addEventListener("canplay", onCanPlay, { once: true });

    video.load();

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  return (
    <div ref={sectionRef} style={{ height: "200vh" }} className="relative w-full">
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "65svh", background: "#111" }}
      >
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          className="h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
          /* autoPlay + muted + playsInline: iOS Safari'nin video bufferlamasına
             izin veren kombinasyon. İlk kare render olunca pause yapılır. */
          autoPlay
          muted
          playsInline
          preload="auto"
          loop={false}
          disablePictureInPicture
          controlsList="nodownload"
          data-testid="scroll-video"
        />

        {/* Yükleniyor göstergesi */}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          </div>
        )}

        {/* Alt geçiş */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-white" />
      </div>
    </div>
  );
}
