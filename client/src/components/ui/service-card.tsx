import React, { useState } from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  title: string;
  description: string;
  tag?: string;
  icons: React.ReactNode[];
  gradient?: string;
  accentColor?: string;
}

export function ServiceCard({
  title,
  description,
  tag,
  icons,
  gradient = "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
  accentColor = "rgba(99,102,241,0.35)",
}: ServiceCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden cursor-default select-none"
      style={{ background: gradient, minHeight: 220 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Animated glow blob on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${accentColor} 0%, transparent 70%)`,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "150px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col h-full" style={{ minHeight: 220 }}>
        {/* Tag */}
        {tag && (
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/35 mb-3">
            {tag}
          </span>
        )}

        {/* Title */}
        <h3
          className="text-white font-bold text-xl leading-tight mb-2"
          style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/55 text-sm leading-relaxed flex-1">{description}</p>

        {/* Icon boxes — stagger animate on hover */}
        <div className="flex gap-3 mt-6">
          {icons.map((icon, i) => (
            <motion.div
              key={i}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white/80"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(4px)",
              }}
              initial={false}
              animate={
                hovered
                  ? { y: 0, opacity: 1, scale: 1 }
                  : { y: 18, opacity: 0, scale: 0.75 }
              }
              transition={{
                delay: hovered ? i * 0.07 : (icons.length - 1 - i) * 0.04,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
            >
              {icon}
            </motion.div>
          ))}

          {/* Decorative empty 4th box (like box4 in social card) */}
          <motion.div
            className="w-11 h-11 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            initial={false}
            animate={
              hovered
                ? { y: 0, opacity: 1, scale: 1 }
                : { y: 18, opacity: 0, scale: 0.75 }
            }
            transition={{
              delay: hovered ? icons.length * 0.07 : 0,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
