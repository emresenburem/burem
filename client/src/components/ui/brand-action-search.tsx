import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircuitBoard,
  Cpu,
  Search,
  Send,
  Wrench,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import { normalizeSearchText } from "@/lib/product-utils";

export interface BrandLogo {
  name: string;
  logo: string;
  scale?: number;
  logoHeight?: number;
}

interface BrandAction {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  brandNames: string[];
}

interface BrandActionSearchProps {
  brands: BrandLogo[];
  compact?: boolean;
  onBrandClick?: (brand: BrandLogo) => void;
}

const BRAND_ACTIONS: BrandAction[] = [
  {
    id: "drive",
    label: "İnverter & Sürücü",
    description: "AC/DC, frekans ve güç sürücüsü markaları",
    icon: <Zap className="h-4 w-4 text-amber-500" />,
    brandNames: [
      "Baumüller", "Siemens", "ABB", "Schneider", "Lenze", "Mitsubishi",
      "Danfoss", "Delta", "Fuji", "SEW", "Rexroth", "Panasonic",
      "Control Techniques", "KEB",
    ],
  },
  {
    id: "servo",
    label: "Servo Sistemleri",
    description: "Servo sürücü ve servo motor markaları",
    icon: <Wrench className="h-4 w-4 text-blue-500" />,
    brandNames: [
      "Siemens", "ABB", "Fanuc", "Yaskawa", "Mitsubishi", "Omron",
      "Lenze", "Beckhoff", "Panasonic", "B&R", "Control Techniques", "KEB",
    ],
  },
  {
    id: "plc-hmi",
    label: "PLC & HMI",
    description: "Kontrolör ve operatör paneli markaları",
    icon: <CircuitBoard className="h-4 w-4 text-cyan-500" />,
    brandNames: [
      "Siemens", "Schneider", "Mitsubishi", "Omron", "Allen Bradley",
      "Beckhoff", "ABB", "B&R", "Panasonic",
    ],
  },
  {
    id: "cnc",
    label: "CNC & Tezgah Elektroniği",
    description: "CNC kontrol ve tezgah markaları",
    icon: <Cpu className="h-4 w-4 text-violet-500" />,
    brandNames: ["Fanuc", "Siemens", "Heidenhain", "Okuma", "MAZAK", "HAAS", "Mitsubishi"],
  },
  {
    id: "card",
    label: "Elektronik Kart",
    description: "Güç, kontrol ve endüstriyel elektronik kartlar",
    icon: <Cpu className="h-4 w-4 text-rose-500" />,
    brandNames: [
      "Baumüller", "Siemens", "ABB", "Schneider", "Omron",
      "Beckhoff", "Allen Bradley", "Panasonic", "FIDA",
    ],
  },
  {
    id: "ultrasonic",
    label: "Ultrasonik Kaynak",
    description: "Generatör, transdüser ve kaynak elektroniği",
    icon: <Waves className="h-4 w-4 text-emerald-500" />,
    brandNames: ["Mecasonic", "FIDA"],
  },
];

function useDebounce<T>(value: T, delay = 220) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function BrandActionSearch({
  brands,
  compact = false,
  onBrandClick,
}: BrandActionSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BrandAction | null>(null);
  const debouncedQuery = useDebounce(query);

  const searchResults = useMemo(() => {
    const normalizedQuery = normalizeSearchText(debouncedQuery);
    const matchingActions = BRAND_ACTIONS.filter((action) => {
      if (!normalizedQuery) return true;
      return normalizeSearchText(`${action.label} ${action.description}`).includes(normalizedQuery);
    });

    const matchingBrands = normalizedQuery
      ? brands
          .filter((brand) => normalizeSearchText(brand.name).includes(normalizedQuery))
          .map<BrandAction>((brand) => ({
            id: `brand-${brand.name}`,
            label: brand.name,
            description: "Marka servis ve onarım seçeneklerini göster",
            icon: <Search className="h-4 w-4 text-primary" />,
            brandNames: [brand.name],
          }))
      : [];

    return [...matchingActions, ...matchingBrands.filter(
      (brandAction) => !matchingActions.some((action) => action.label === brandAction.label),
    )];
  }, [brands, debouncedQuery]);

  const selectedBrands = useMemo(() => {
    if (!selectedAction) return [];
    const names = new Set(selectedAction.brandNames.map(normalizeSearchText));
    return brands.filter((brand) => names.has(normalizeSearchText(brand.name)));
  }, [brands, selectedAction]);

  const handleFocus = () => {
    setIsFocused(true);
    setSelectedAction(null);
  };

  const handleSelect = (action: BrandAction) => {
    setSelectedAction(action);
    setQuery(action.label);
    setIsFocused(false);
  };

  const clearSelection = () => {
    setQuery("");
    setSelectedAction(null);
    setIsFocused(true);
  };

  if (compact) {
    return (
      <div className="w-[min(92vw,440px)] p-4">
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Marka bul
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">
            Cihaz veya servis alanı seçin
          </p>
        </div>

        <div className="relative">
          <label className="sr-only" htmlFor="navbar-brand-action-search">
            Servis alanı veya marka ara
          </label>
          <input
            id="navbar-brand-action-search"
            type="search"
            value={query}
            placeholder="Servo, PLC, CNC veya Siemens…"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedAction(null);
              setIsFocused(true);
            }}
            onFocus={handleFocus}
            onBlur={() => window.setTimeout(() => setIsFocused(false), 180)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-9 text-xs font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            autoComplete="off"
            data-testid="input-navbar-brand-search"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {query ? <Send className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
          </span>

          <AnimatePresence>
            {isFocused && !selectedAction && (
              <motion.div
                className="absolute left-0 right-0 top-[calc(100%+5px)] z-20 max-h-72 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-xl"
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -5, height: 0 }}
              >
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((action) => (
                      <li key={action.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelect(action)}
                          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                            {action.icon}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-foreground">
                              {action.label}
                            </span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {action.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                    Eşleşen servis veya marka bulunamadı.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {selectedAction && selectedBrands.length > 0 && (
            <motion.div
              key={selectedAction.id}
              className="mt-4 border-t border-border/70 pt-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-foreground">
                  {selectedAction.label}
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Değiştir
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {selectedBrands.map((brand) => (
                  <motion.button
                    type="button"
                    key={brand.name}
                    onClick={() => onBrandClick?.(brand)}
                    className="flex h-14 items-center justify-center rounded-lg border border-transparent bg-muted/40 p-2 transition-colors hover:border-primary/30 hover:bg-background"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    title={`${brand.name} detaylarını aç`}
                  >
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-full w-full object-contain"
                      style={{ transform: brand.scale ? `scale(${brand.scale})` : undefined }}
                      onError={(event) => {
                        const image = event.currentTarget;
                        image.style.display = "none";
                        const fallback = image.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <span className="hidden text-center text-[9px] font-bold" style={{ color: (brand as BrandLogo & { color?: string }).color }}>
                      {brand.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:py-9">
      <div className="mx-auto max-w-xl">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
              Servis alanı seçin
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              Hangi cihaz için marka arıyorsunuz?
            </h2>
          </div>
          {selectedAction && (
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              aria-label="Marka seçimini temizle"
            >
              <X className="h-3.5 w-3.5" />
              Temizle
            </button>
          )}
        </div>

        <div className="relative">
          <label className="sr-only" htmlFor="brand-action-search">
            Servis alanı veya marka ara
          </label>
          <input
            id="brand-action-search"
            type="search"
            value={query}
            placeholder="Örn. servo, PLC, CNC veya Siemens"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedAction(null);
              setIsFocused(true);
            }}
            onFocus={handleFocus}
            onBlur={() => window.setTimeout(() => setIsFocused(false), 180)}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 pr-10 text-sm font-medium text-foreground shadow-soft outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            autoComplete="off"
            data-testid="input-brand-action-search"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
            <AnimatePresence mode="popLayout" initial={false}>
              {query ? (
                <motion.div
                  key="send"
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                >
                  <Search className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isFocused && !selectedAction && (
              <motion.div
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-elevated"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((action, index) => (
                      <motion.li
                        key={action.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.035 }}
                      >
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelect(action)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                              {action.icon}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-foreground">
                                {action.label}
                              </span>
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {action.description}
                              </span>
                            </span>
                          </span>
                          <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:block">
                            Göster
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                    Eşleşen servis veya marka bulunamadı.
                  </p>
                )}
                <div className="border-t border-border/70 px-3 py-2 text-[10px] font-semibold text-muted-foreground">
                  Bir alan seçtiğinizde ilgili marka logoları burada görünecek.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedAction && selectedBrands.length > 0 && (
          <motion.div
            key={selectedAction.id}
            className="mt-7"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mb-2 flex items-center justify-center gap-2 text-center">
              <span className="text-sm font-bold text-foreground">{selectedAction.label}</span>
              <span className="text-xs text-muted-foreground">
                · {selectedBrands.length} marka
              </span>
            </div>
            <LogoCarousel
              logos={selectedBrands}
              columnCount={Math.min(4, selectedBrands.length)}
              mobileColumnCount={Math.min(3, selectedBrands.length)}
              cycleInterval={3200}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}