import { useState, useId } from "react";
import { SparklesCore } from "@/components/ui/sparkles-core";

export interface AccordionItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  particleColor: string;
  gradient: string;
}

/* ─── Yatay panel ─── */
function HorizontalPanel({
  item,
  isActive,
  onMouseEnter,
}: {
  item: AccordionItem;
  isActive: boolean;
  onMouseEnter: () => void;
}) {
  const uid = useId();
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0
        transition-all duration-700 ease-in-out h-[420px]
        ${isActive ? "flex-[4]" : "flex-[0.55]"}
      `}
      style={{ background: item.gradient }}
      onMouseEnter={onMouseEnter}
    >
      {/* Sparkles */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-30"}`}>
        <SparklesCore
          id={uid}
          background="transparent"
          minSize={0.5}
          maxSize={isActive ? 1.6 : 0.8}
          particleDensity={isActive ? 90 : 30}
          particleColor={item.particleColor}
          speed={isActive ? 1.2 : 0.4}
          className="w-full h-full"
        />
      </div>

      {/* İkon (arka planda büyür) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          isActive ? "opacity-20 scale-150" : "opacity-70 scale-100"
        }`}
        style={{ color: item.particleColor }}
      >
        <div className="w-24 h-24 [&>svg]:w-full [&>svg]:h-full">{item.icon}</div>
      </div>

      {/* Aktif: başlık + açıklama */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-7 transition-all duration-500 ${
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <p className="text-white text-2xl font-bold leading-tight tracking-tight">{item.title}</p>
        <p className="text-white/65 text-sm mt-3 leading-relaxed">{item.description}</p>
      </div>

      {/* Pasif: dikey başlık */}
      <div
        className={`absolute inset-0 flex items-end justify-center pb-6 transition-opacity duration-300 ${
          isActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <span
          className="text-white/80 text-[13px] font-semibold whitespace-nowrap tracking-wide"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {item.title}
        </span>
      </div>
    </div>
  );
}

/* ─── Dikey panel ─── */
function VerticalPanel({
  item,
  isActive,
  onMouseEnter,
}: {
  item: AccordionItem;
  isActive: boolean;
  onMouseEnter: () => void;
}) {
  const uid = useId();
  return (
    <div
      className={`
        relative w-full rounded-2xl overflow-hidden cursor-pointer flex-shrink-0
        transition-all duration-600 ease-in-out
        ${isActive ? "flex-[3]" : "flex-[0.7]"}
      `}
      style={{ background: item.gradient }}
      onMouseEnter={onMouseEnter}
    >
      {/* Sparkles */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-20"}`}>
        <SparklesCore
          id={uid}
          background="transparent"
          minSize={0.4}
          maxSize={isActive ? 1.2 : 0.6}
          particleDensity={isActive ? 70 : 20}
          particleColor={item.particleColor}
          speed={isActive ? 1.0 : 0.3}
          className="w-full h-full"
        />
      </div>

      {/* İkon arka planda */}
      <div
        className={`absolute inset-0 flex items-center justify-end pr-4 transition-all duration-500 ${
          isActive ? "opacity-15 scale-125" : "opacity-40 scale-100"
        }`}
        style={{ color: item.particleColor }}
      >
        <div className="w-14 h-14 [&>svg]:w-full [&>svg]:h-full">{item.icon}</div>
      </div>

      {/* Pasif: yatay ikon + başlık */}
      <div
        className={`absolute inset-0 flex items-center gap-3 px-4 transition-all duration-300 ${
          isActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full" style={{ color: item.particleColor }}>
          {item.icon}
        </div>
        <span className="text-white/90 text-sm font-semibold truncate">{item.title}</span>
      </div>

      {/* Aktif: başlık + açıklama */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-4 transition-all duration-500 ${
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <p className="text-white text-base font-bold leading-snug">{item.title}</p>
        <p className="text-white/65 text-xs mt-1.5 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}

/* ─── Ana bileşen ─── */
export function ImageAccordion({
  items,
  defaultActive = 0,
  direction = "horizontal",
  className = "",
}: {
  items: AccordionItem[];
  defaultActive?: number;
  direction?: "horizontal" | "vertical";
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(defaultActive);

  if (direction === "vertical") {
    return (
      <div className={`flex flex-col gap-2 w-full h-full ${className}`}>
        {items.map((item, index) => (
          <VerticalPanel
            key={item.id}
            item={item}
            isActive={index === activeIndex}
            onMouseEnter={() => setActiveIndex(index)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-row items-stretch gap-3 w-full h-[420px] ${className}`}>
      {items.map((item, index) => (
        <HorizontalPanel
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
        />
      ))}
    </div>
  );
}
