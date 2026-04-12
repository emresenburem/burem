import React, { useRef } from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  title: string;
  description: string;
  tag?: string;
  icons: React.ReactNode[];
  accentColor?: string;
  iconColor?: string;
  featured?: boolean;
}

export function ServiceCard({
  title,
  description,
  tag,
  icons,
  accentColor = "rgba(99,102,241,0.12)",
  iconColor = "hsl(var(--primary))",
  featured = false,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current!.style.setProperty("--mx", `${x}px`);
    cardRef.current!.style.setProperty("--my", `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      className="group relative cursor-default select-none overflow-hidden rounded-2xl border border-zinc-200/80"
      style={
        {
          background: "rgba(250,250,252,0.95)",
          minHeight: featured ? 300 : 200,
          "--mx": "50%",
          "--my": "50%",
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.012 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      {/* Spotlight border — radial gradient follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background:
            "radial-gradient(350px circle at var(--mx) var(--my), rgba(206,210,220,0.45), transparent 65%)",
        }}
      />

      {/* Accent glow blob */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 30% 35%, ${accentColor} 0%, transparent 60%)`,
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col h-full" style={{ minHeight: featured ? 300 : 200 }}>
        {tag && (
          <span className="mb-3 font-mono text-[10px] tracking-widest uppercase text-zinc-400">
            {tag}
          </span>
        )}

        <h3
          className="text-zinc-900 font-semibold leading-tight mb-2"
          style={{
            fontFamily: "Space Grotesk, var(--font-sans)",
            fontSize: featured ? "1.5rem" : "1.2rem",
          }}
        >
          {title}
        </h3>

        <p className="text-zinc-500 text-sm leading-relaxed flex-1">{description}</p>

        {/* Icon boxes — stagger on hover */}
        <div className="flex gap-2.5 mt-6">
          {icons.map((icon, i) => (
            <motion.div
              key={i}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.07)",
                color: iconColor,
              }}
              initial={false}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              whileHover={{ y: -3, scale: 1.08 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: i * 0.05,
              }}
            >
              {icon}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
