import React, { useState, useRef, useEffect, useMemo } from "react";

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  onClick?: () => void;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  activeIndex?: number;
}

const defaultAccentColor = "var(--component-active-color-default)";

export const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor,
  activeIndex: controlledIndex,
}) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 6;
    return isValid ? items! : [];
  }, [items]);

  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    const activeText = textRefs.current[activeIndex];
    if (activeItem && activeText) {
      activeItem.style.setProperty("--lineWidth", `${activeText.offsetWidth}px`);
    }

    const handleResize = () => {
      const el = itemRefs.current[activeIndex];
      const tx = textRefs.current[activeIndex];
      if (el && tx) el.style.setProperty("--lineWidth", `${tx.offsetWidth}px`);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, finalItems]);

  const navStyle = useMemo(
    () =>
      ({
        "--component-active-color": accentColor || defaultAccentColor,
      }) as React.CSSProperties,
    [accentColor]
  );

  const handleClick = (index: number) => {
    setInternalIndex(index);
    finalItems[index].onClick?.();
  };

  return (
    <nav className="menu" role="navigation" style={navStyle}>
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex;
        const IconComponent = item.icon;
        return (
          <button
            key={item.label}
            className={`menu__item ${isActive ? "active" : ""}`}
            onClick={() => handleClick(index)}
            ref={(el) => (itemRefs.current[index] = el)}
            style={{ "--lineWidth": "0px" } as React.CSSProperties}
            data-testid={`nav-menu-${item.label.toLowerCase()}`}
          >
            <div className="menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`menu__text ${isActive ? "active" : ""}`}
              ref={(el) => (textRefs.current[index] = el)}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};
