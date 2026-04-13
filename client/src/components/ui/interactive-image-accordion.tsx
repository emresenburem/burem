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

function AccordionPanel({
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
      {/* Sparkle layer — always rendered, opacity controlled */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isActive ? "opacity-100" : "opacity-30"
        }`}
      >
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

      {/* Large icon — fades to background when active */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          isActive ? "opacity-20 scale-150" : "opacity-70 scale-100"
        }`}
        style={{ color: item.particleColor }}
      >
        <div className="w-24 h-24 [&>svg]:w-full [&>svg]:h-full">{item.icon}</div>
      </div>

      {/* Active: title + description at bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-7 transition-all duration-500 ${
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <p className="text-white text-2xl font-bold leading-tight tracking-tight">
          {item.title}
        </p>
        <p className="text-white/65 text-sm mt-3 leading-relaxed">{item.description}</p>
      </div>

      {/* Inactive: vertical title */}
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

export function ImageAccordion({
  items,
  defaultActive = 0,
}: {
  items: AccordionItem[];
  defaultActive?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(defaultActive);

  return (
    <div className="flex flex-row items-stretch gap-3 w-full h-[420px]">
      {items.map((item, index) => (
        <AccordionPanel
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
        />
      ))}
    </div>
  );
}
