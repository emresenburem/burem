import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";

export function HeaderLogo() {
  const [, setLocation] = useLocation();
  const [isFlickering, setIsFlickering] = useState(false);

  // Yalnızca masaüstü hover'da tetiklenir — mobilde çalışmaz

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
        className="h-52 w-80 flex items-center justify-center overflow-hidden ml-2 mt-4"
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
        transition={{
          duration: 1.2,
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
          ease: "easeInOut",
        }}
      >
        <img
          src="/logo.png"
          alt="Burem Elektronik Logo"
          className={"h-80 w-80 object-contain " + (isFlickering ? "" : "mix-blend-multiply")}
          decoding="async"
          draggable={false}
        />
      </motion.div>

      {/* CPU Architecture dekoratif SVG */}
      <div
        className="hidden md:block w-48 h-24 opacity-60 group-hover:opacity-90 transition-opacity duration-500 mt-4 ml-[-8px]"
        aria-hidden="true"
      >
        <CpuArchitecture
          text="BUREM"
          width="100%"
          height="100%"
          animateText={false}
          animateLines={true}
          animateMarkers={true}
          showCpuConnections={true}
        />
      </div>
    </button>
  );
}
