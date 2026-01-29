import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export function HeaderLogo() {
  const [, setLocation] = useLocation();
  const [isFlickering, setIsFlickering] = useState(false);
  const [triggerCount, setTriggerCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlickering(true);
      setTriggerCount(prev => prev + 1);
      setTimeout(() => setIsFlickering(false), 1200);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = () => {
    if (!isFlickering) {
      setIsFlickering(true);
      setTriggerCount(prev => prev + 1);
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
        className="h-40 w-64 flex items-center justify-center overflow-hidden ml-2" 
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={isFlickering ? {
          opacity: [1, 0, 1, 0, 1, 0.2, 0.8, 0, 1, 0.4, 1],
          filter: [
            "contrast(1) brightness(1)",
            "contrast(1.2) brightness(1.5)",
            "contrast(1) brightness(1)",
            "contrast(1.5) brightness(2)",
            "contrast(1) brightness(1)",
            "contrast(1.3) brightness(1.7)",
            "contrast(1) brightness(1)"
          ]
        } : { opacity: 1, filter: "contrast(1) brightness(1)" }}
        key={`logo-flicker-${triggerCount}`}
        transition={{
          duration: 1.2,
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
          ease: "easeInOut",
        }}
      >
        <img src="/logo.png" alt="Inductra Logo" className="h-full w-full object-contain" />
      </motion.div>
    </button>
  );
}
