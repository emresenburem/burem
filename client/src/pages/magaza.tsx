import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Check,
  ChevronDown,
  MessageCircle,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { ProductWithImages } from "@shared/schema";
import BuremFooter from "@/components/ui/footer";
import StoreHeader from "@/components/store-header";
import StoreProductCard from "@/components/store-product-card";
import { SEO } from "@/components/seo";
import { whatsappLink } from "@/lib/site-contact";
import {
  CONDITION_LABELS,
  conditionLabel,
  normalizeSearchText,
} from "@/lib/product-utils";

const FALLBACK_CATEGORIES = [
  "İnverter",
  "Servo Sürücü",
  "PLC",
  "HMI",
  "Elektronik Kart",
  "Motor",
  "Sensör",
  "Diğer",
];

const FALLBACK_BRANDS = [
  "Siemens",
  "ABB",
  "Fanuc",
  "Yaskawa",
  "Mitsubishi",
  "Lenze",
  "Schneider",
  "Danfoss",
  "Omron",
  "SEW-Eurodrive",
  "Bosch Rexroth",
  "Beckhoff",
  "Allen Bradley",
  "Panasonic",
];

const CONDITION_OPTIONS = [
  { value: "new", label: CONDITION_LABELS.new },
  { value: "used", label: CONDITION_LABELS.used },
  { value: "refurbished", label: CONDITION_LABELS.refurbished },
];

type ActiveFilter = { key: string; label: string };

interface FilterContentProps {
  brands: string[];
  categories: string[];
  conditions: { value: string; label: string }[];
  brand: string;
  category: string;
  condition: string;
  stockOnly: boolean;
  onBrandChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onStockChange: () => void;
  onReset: () => void;
  onClose?: () => void;
}

function FilterContent({
  brands,
  categories,
  conditions,
  brand,
  category,
  condition,
  stockOnly,
  onBrandChange,
  onCategoryChange,
  onConditionChange,
  onStockChange,
  onReset,
  onClose,
}: FilterContentProps) {
  const hasSelectedFilters =
    brand !== "Tümü" ||
    category !== "Tümü" ||
    condition !== "Tümü" ||
    stockOnly;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Kataloğu daralt
          </p>
          <h2 className="mt-1 text-lg font-bold">Filtreler</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Filtreleri kapat"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div>
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Marka
        </p>
        <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
          {brands.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => onBrandChange(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                brand === item
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
              data-testid={`filter-brand-${item}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Kategori
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => onCategoryChange(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === item
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
              data-testid={`filter-category-${item}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Ürün durumu
          </span>
          <span className="relative block">
            <select
              value={condition}
              onChange={(event) => onConditionChange(event.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-9 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              data-testid="filter-condition"
            >
              <option value="Tümü">Tümü</option>
              {conditions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </span>
        </label>

        <div>
          <span className="mb-2.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Stok durumu
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={stockOnly}
            onClick={onStockChange}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
              stockOnly
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
            data-testid="toggle-stock"
          >
            Sadece stokta olanlar
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                stockOnly
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-border"
              }`}
            >
              {stockOnly && <Check className="h-3 w-3" />}
            </span>
          </button>
        </div>
      </div>

      {hasSelectedFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
          data-testid="button-clear-filters"
        >
          <X className="h-3.5 w-3.5" />
          Filtreleri temizle
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background"
        >
          Sonuçları göster
        </button>
      )}
    </div>
  );
}

function optionList(fallback: string[], values: string[]) {
  const filteredValues = values.filter((value) => Boolean(value?.trim()));

  const uniqueValues = filteredValues.filter(
    (value, index) => filteredValues.indexOf(value) === index,
  );
  return [
    "Tümü",
    ...fallback.filter((value) => uniqueValues.includes(value)),
    ...uniqueValues.filter((value) => !fallback.includes(value)),
  ];
}

export default function MagazaPage() {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("Tümü");
  const [category, setCategory] = useState("Tümü");
  const [condition, setCondition] = useState("Tümü");
  const [stockOnly, setStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: allProducts = [], isLoading } = useQuery<ProductWithImages[]>({
    queryKey: ["/api/products"],
  });

  const brands = useMemo(
    () => optionList(FALLBACK_BRANDS, allProducts.map((product) => product.brand)),
    [allProducts],
  );
  const categories = useMemo(
    () => optionList(FALLBACK_CATEGORIES, allProducts.map((product) => product.category)),
    [allProducts],
  );

  const conditions = useMemo(() => {
    const known = new Set(CONDITION_OPTIONS.map((item) => item.value));
    const extras = allProducts
      .map((product) => product.condition)
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .filter((value) => !known.has(value))
      .filter((value, index, values) => values.indexOf(value) === index)
      .map((value) => ({ value, label: conditionLabel(value) ?? value }));
    return [...CONDITION_OPTIONS, ...extras];
  }, [allProducts]);

  const filtered = useMemo(() => {
    const query = normalizeSearchText(search);

    return allProducts.filter((product) => {
      if (brand !== "Tümü" && product.brand !== brand) return false;
      if (category !== "Tümü" && product.category !== category) return false;
      if (condition !== "Tümü" && (product.condition ?? "new") !== condition) return false;
      if (stockOnly && product.inStock !== true) return false;
      if (!query) return true;

      return [
        product.name,
        product.brand,
        product.category,
        product.partNumber,
        product.description,
      ].some((value) => normalizeSearchText(value ?? "").includes(query));
    });
  }, [allProducts, brand, category, condition, search, stockOnly]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (search.trim()) filters.push({ key: "search", label: `Arama: ${search.trim()}` });
    if (brand !== "Tümü") filters.push({ key: "brand", label: brand });
    if (category !== "Tümü") filters.push({ key: "category", label: category });
    if (condition !== "Tümü") {
      filters.push({ key: "condition", label: conditionLabel(condition) ?? condition });
    }
    if (stockOnly) filters.push({ key: "stock", label: "Stokta" });
    return filters;
  }, [brand, category, condition, search, stockOnly]);

  const clearFilters = () => {
    setSearch("");
    setBrand("Tümü");
    setCategory("Tümü");
    setCondition("Tümü");
    setStockOnly(false);
  };

  const removeFilter = (key: string) => {
    if (key === "search") setSearch("");
    if (key === "brand") setBrand("Tümü");
    if (key === "category") setCategory("Tümü");
    if (key === "condition") setCondition("Tümü");
    if (key === "stock") setStockOnly(false);
  };

  const filterProps = {
    brands,
    categories,
    conditions,
    brand,
    category,
    condition,
    stockOnly,
    onBrandChange: setBrand,
    onCategoryChange: setCategory,
    onConditionChange: setCondition,
    onStockChange: () => setStockOnly((value) => !value),
    onReset: clearFilters,
  };

  return (
    <>
      <SEO
        title="Yedek Parça Kataloğu | Burem Elektronik"
        description="Siemens, ABB, Fanuc, Yaskawa ve daha fazla markaya ait endüstriyel elektronik yedek parçaları keşfedin."
        canonical="/magaza"
      />

      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader />

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
          <section className="relative mb-8 overflow-hidden rounded-[30px] bg-slate-950 px-6 py-8 text-white shadow-elevated md:px-10 md:py-10">
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative max-w-3xl">
              <Link
                href="/"
                className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                ← Ana Sayfa
              </Link>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                Burem Elektronik / Yedek Parça
              </p>
              <h1
                className="max-w-2xl text-3xl font-bold tracking-tight md:text-5xl"
                style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
              >
                Aradığınız parçayı, model numarasıyla bulun.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 md:text-base">
                Endüstriyel elektronik yedek parçalarını marka, kategori veya parça numarasına göre filtreleyin.
              </p>

              <div className="relative mt-7 max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ürün, marka, kategori veya parça/model no ara…"
                  aria-label="Ürünlerde ara"
                  className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 pl-12 text-sm text-slate-950 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/15"
                  data-testid="input-search"
                />
              </div>
            </div>
          </section>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isLoading ? "Ürünler yükleniyor…" : `${filtered.length} ürün listeleniyor`}
              </p>
              {!isLoading && allProducts.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Toplam {allProducts.length} ürün içinden
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${
                filtersOpen || activeFilters.length > 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
              data-testid="button-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtrele
              {activeFilters.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1 text-[10px] text-foreground">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="mb-8 hidden rounded-[24px] border border-border bg-card p-5 shadow-soft md:block">
              <FilterContent {...filterProps} />
            </div>
          )}

          {filtersOpen && (
            <div className="fixed inset-0 z-[80] md:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                onClick={() => setFiltersOpen(false)}
                aria-label="Filtreleri kapat"
              />
              <aside className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-background p-5 shadow-2xl">
                <FilterContent {...filterProps} onClose={() => setFiltersOpen(false)} />
              </aside>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  {filter.label}
                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`${filter.label} filtresini kaldır`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 text-xs font-bold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Tümünü temizle
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse rounded-[24px] bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-[28px] border border-dashed border-border px-6 py-20 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground/50">
                <Package className="h-8 w-8" />
              </div>
              <p className="text-lg font-bold">Aradığınız ürün bulunamadı.</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Farklı bir model veya parça numarası deneyin. Aradığınız parça katalogda yoksa bize doğrudan sorabilirsiniz.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background transition-opacity hover:opacity-85"
                  data-testid="button-clear-empty-filters"
                >
                  Filtreleri temizle
                </button>
                <a
                  href={whatsappLink("Merhaba, aradığım yedek parçayı katalogda bulamadım. Yardımcı olabilir misiniz?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#20ba5a]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp’tan sor
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="grid-products">
              {filtered.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

        <BuremFooter />
      </div>
    </>
  );
}