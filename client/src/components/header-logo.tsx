import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useLocation } from "wouter";

export function HeaderLogo() {
  const [, setLocation] = useLocation();
  const controls = useAnimation();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    controls.set({
      opacity: 0,
      scale: 0.55,
      filter: "blur(24px) drop-shadow(0 0 60px rgba(180,210,255,1)) drop-shadow(0 0 120px rgba(255,255,255,0.95)) brightness(3)",
    });

    controls.start({
      opacity: 1,
      scale: 1,
      filter: "blur(0px) drop-shadow(0 0 0px rgba(180,210,255,0)) brightness(1)",
      transition: {
        duration: 1.35,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1,
      },
    });
  }, [controls]);

  const handleMouseEnter = () => {
    controls.start({
      filter: "blur(0px) drop-shadow(0 0 10px rgba(100,140,255,0.35)) brightness(1.08)",
      transition: { duration: 0.35, ease: "easeOut" },
    });
  };

  const handleMouseLeave = () => {
    controls.start({
      filter: "blur(0px) drop-shadow(0 0 0px rgba(100,140,255,0)) brightness(1)",
      transition: { duration: 0.45, ease: "easeOut" },
    });
  };

  return (
    <button
      type="button"
      onClick={() => setLocation("/")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group flex items-center gap-0 rounded-2xl py-1 text-left"
      data-testid="button-logo-home"
    >
      <motion.div
        className="h-52 w-80 flex items-center justify-center overflow-hidden ml-2 mt-4"
        aria-hidden="true"
        animate={controls}
        style={{ willChange: "filter, opacity, transform" }}
      >
        <img
          src="/logo.png"
          alt="Burem Elektronik Logo"
          className="h-80 w-80 object-contain mix-blend-multiply"
          decoding="async"
          draggable={false}
        />
      </motion.div>
    </button>
  );
}
