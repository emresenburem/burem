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
    if (!video) return;
    const dur = video.duration;
    if (!isFinite(dur) || dur === 0) return;
    video.currentTime = Math.min(progress * dur, dur);
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setup = () => {
      video.pause();
      video.currentTime = 0;
    };

    if (video.readyState >= 1) {
      setup();
    } else {
      video.addEventListener("loadedmetadata", setup, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", setup);
    };
  }, []);

  return (
    <div ref={sectionRef} style={{ height: "300vh" }} className="relative w-full">
      <div
        className="sticky top-0 w-full overflow-hidden bg-black"
        style={{ height: "100svh" }}
      >
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload"
          data-testid="scroll-video"
        />
        {/* Alt yumuşak geçiş */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-white" />
      </div>
    </div>
  );
}
