import React, { useState } from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  title: string;
  description: string;
  tag?: string;
  icons: React.ReactNode[];
  accentColor?: string;
  iconColor?: string;
}

export function ServiceCard({
  title,
  description,
  tag,
  icons,
  accentColor = "rgba(99,102,241,0.12)",
  iconColor = "hsl(var(--primary))",
}: ServiceCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden cursor-default select-none border border-gray-200/80"
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        minHeight: 220,
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.015, borderColor: "rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Glow blob on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        style={{
          background: `radial-gradient(ellipse at 25% 40%, ${accentColor} 0%, transparent 65%)`,
        }}
      />

      {/* Subtle grid dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col" style={{ minHeight: 220 }}>
        {/* Tag */}
        {tag && (
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400 mb-3">
            {tag}
          </span>
        )}

        {/* Title */}
        <h3
          className="text-gray-900 font-bold text-xl leading-tight mb-2"
          style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed flex-1">{description}</p>

        {/* Icon boxes — stagger on hover */}
        <div className="flex gap-3 mt-6">
          {icons.map((icon, i) => (
            <motion.div
              key={i}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.08)",
                color: iconColor,
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

          {/* Decorative empty box */}
          <motion.div
            className="w-11 h-11 rounded-xl"
            style={{
              background: "rgba(0,0,0,0.02)",
              border: "1px solid rgba(0,0,0,0.04)",
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
