import { useEffect, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export function ScrollVideo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current;
    if (!video || !isFinite(video.duration)) return;
    video.currentTime = progress * video.duration;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, []);

  return (
    /* 300vh uzunluk = scroll için yer */
    <div ref={sectionRef} style={{ height: "300vh" }} className="relative">
      {/* Sticky kap: scroll boyunca ekranda sabit kalır */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          data-testid="scroll-video"
        />
        {/* Alt geçiş gradyanı — sayfa içeriğine yumuşak bağlantı */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-white" />
      </div>
    </div>
  );
}
