import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

export interface GooeySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  results?: string[];
  onResultSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const GooeyFilter = () => (
  <svg aria-hidden="true" className="animated-search-svg">
    <defs>
      <filter id="goo-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -15"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

const SearchIcon = ({ loading }: { loading: boolean }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8, x: -4 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.8, x: -4 }}
    transition={{ delay: 0.08, duration: 0.45, type: "spring", bounce: 0.15 }}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={clsx(loading && "animated-search-icon-loading")}
  >
    {loading ? (
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.4" strokeDasharray="28 18" />
    ) : (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2" />
        <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    )}
  </motion.svg>
);

export function GooeySearchBar({
  value,
  onChange,
  results = [],
  onResultSelect,
  placeholder = "Ürün ara…",
  className,
}: GooeySearchBarProps) {
  const rootRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(Boolean(value));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!value.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = window.setTimeout(() => setIsLoading(false), 260);
    return () => window.clearTimeout(timeout);
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(true);
  };

  const handleResultSelect = (result: string) => {
    onChange(result);
    onResultSelect?.(result);
    inputRef.current?.focus();
  };

  return (
    <form
      ref={rootRef}
      role="search"
      onSubmit={handleSubmit}
      className={clsx("animated-search", isOpen && "animated-search-open", className)}
    >
      <GooeyFilter />
      <motion.div
        className="animated-search-control"
        initial={false}
        animate={{ width: isOpen ? "100%" : 132 }}
        transition={{ duration: 0.65, type: "spring", bounce: 0.15 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isOpen ? (
            <motion.button
              key="trigger"
              type="button"
              className="animated-search-trigger"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Ürün aramasını aç"
            >
              <span>Ara</span>
            </motion.button>
          ) : (
            <motion.input
              key="input"
              ref={inputRef}
              type="search"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              aria-label="Ürünlerde ara"
              className="animated-search-input"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {isOpen && (
            <motion.span
              key={isLoading ? "loading" : "search"}
              className="animated-search-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <SearchIcon loading={isLoading} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isOpen && value.trim() && !isLoading && results.length > 0 && (
          <motion.div
            className="animated-search-results"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role="listbox"
            aria-label="Ürün arama sonuçları"
          >
            {results.slice(0, 6).map((result, index) => (
              <motion.button
                type="button"
                key={`${result}-${index}`}
                className="animated-search-result"
                onClick={() => handleResultSelect(result)}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035 }}
                role="option"
              >
                <span className="animated-search-result-dot" aria-hidden="true" />
                <span>{result}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}