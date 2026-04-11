import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";

interface IntroScreenProps {
  onDone: () => void;
}

export function IntroScreen({ onDone }: IntroScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 700);
    }, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden bg-[#060608] cursor-pointer select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: "blur(12px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => {
            setVisible(false);
            setTimeout(onDone, 700);
          }}
        >
          {/* Spotlight üst sol */}
          <Spotlight
            className="-top-40 left-0 md:left-32 md:-top-24"
            fill="#4f8cff"
          />
          {/* Spotlight sağ */}
          <Spotlight
            className="top-10 right-0 md:right-0 md:top-0"
            fill="#a78bfa"
          />

          {/* Izgara arka plan deseni */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* CPU devre animasyonu — arka planda */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <CpuArchitecture
              width="700px"
              height="350px"
              text="BUREM"
              animateText={true}
              animateLines={true}
              animateMarkers={true}
              showCpuConnections={true}
              className="text-white/40"
            />
          </div>

          {/* Merkez içerik */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src="/logo.png"
                alt="Burem Elektronik"
                className="h-28 w-auto object-contain brightness-[10] invert"
                draggable={false}
              />
            </motion.div>

            {/* Şirket adı */}
            <motion.h1
              className="text-4xl md:text-6xl font-bold tracking-tight"
              style={{
                fontFamily: "Space Grotesk, var(--font-sans)",
                background: "linear-gradient(135deg, #ffffff 0%, #a0b4ff 40%, #c4b5fd 70%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              BUREM ELEKTRONİK
            </motion.h1>

            {/* Alt başlık */}
            <motion.p
              className="text-neutral-400 text-base md:text-lg max-w-md"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              Endüstriyel elektronik onarım · Sürücü tamiri · Testli teslim
            </motion.p>

            {/* İnce çizgi ayırıcı */}
            <motion.div
              className="w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />

            {/* Devam ipucu */}
            <motion.span
              className="text-xs text-neutral-600 tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.3, 0.7] }}
              transition={{ duration: 1.2, delay: 1.4, repeat: Infinity, repeatType: "mirror" }}
            >
              Tıklayın veya bekleyin
            </motion.span>
          </div>

          {/* Alt köşe dekoratif nokta */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/20"
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
