import { useState } from "react";

interface AccordionItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const AccordionPanel = ({
  item,
  isActive,
  onMouseEnter,
}: {
  item: AccordionItem;
  isActive: boolean;
  onMouseEnter: () => void;
}) => {
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0
        transition-all duration-700 ease-in-out h-[400px]
        ${isActive ? "flex-[4]" : "flex-[0.5]"}
      `}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 ease-in-out"
        style={isActive ? { transform: "scale(1)" } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Aktif içerik */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-500 ${
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-white text-xl font-bold leading-tight">{item.title}</p>
        <p className="text-white/70 text-sm mt-2 leading-relaxed">{item.description}</p>
      </div>

      {/* Pasif başlık (dikey) */}
      <div
        className={`absolute inset-0 flex items-end justify-center pb-6 transition-opacity duration-300 ${
          isActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="text-white text-sm font-semibold whitespace-nowrap rotate-90 origin-center">
          {item.title}
        </span>
      </div>
    </div>
  );
};

export function ImageAccordion({
  items,
  defaultActive = 0,
}: {
  items: AccordionItem[];
  defaultActive?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(defaultActive);

  return (
    <div className="flex flex-row items-stretch gap-3 w-full h-[400px]">
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
