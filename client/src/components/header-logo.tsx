import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export function HeaderLogo() {
  const [, setLocation] = useLocation();
  const [isFlickering, setIsFlickering] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlickering(true);
      setTimeout(() => setIsFlickering(false), 1200);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = () => {
    if (!isFlickering) {
      setIsFlickering(true);
      setTimeout(() => setIsFlickering(false), 1200);
    }
  };

  return (
    <button
      type="button"
      onClick={() => setLocation("/")}
      onMouseMove={handleMouseMove}
      className="group flex items-center gap-0 rounded-2xl py-1 text-left"
      data-testid="button-logo-home"
    >
      <motion.div
        className="flex items-center justify-center overflow-hidden ml-2"
        style={{ width: 380, height: 100, willChange: "opacity" }}
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={isFlickering ? {
          opacity: [1, 0, 1, 0, 1, 0.2, 0.8, 0, 1, 0.4, 1],
        } : { opacity: 1 }}
        transition={{
          duration: 1.2,
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
          ease: "easeInOut",
        }}
      >
        <img
          src="/logo.png"
          alt="Burem Elektronik Logo"
          className="w-full h-full object-contain"
          decoding="async"
          draggable={false}
        />
      </motion.div>
    </button>
  );
}
