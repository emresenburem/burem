import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Check,
  ChevronDown,
  ChevronRight,
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
  optimizedProductImageUrl,
} from "@/lib/product-utils";
import BRANDS from "@/lib/brands";

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
  brandCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
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
  brandCounts,
  categoryCounts,
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
    <div className="divide-y divide-border">
      <div className="flex items-center justify-between gap-4 pb-4">
        <div>
          <h2 className="text-sm font-extrabold">Filtreler</h2>
          <p className="mt-1 text-xs text-muted-foreground">Kataloğu daralt</p>
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

      <section className="py-4" aria-labelledby="catalog-category-filter">
        <h3 id="catalog-category-filter" className="mb-2 text-xs font-extrabold">Kategoriler</h3>
        <div className="space-y-0.5">
          {categories.filter((item) => item !== "Tümü").map((item) => {
            const selected = category === item;
            return (
              <button
                type="button"
                key={item}
                aria-pressed={selected}
                onClick={() => onCategoryChange(selected ? "Tümü" : item)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-muted"
                data-testid={`filter-category-${item}`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}>
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span className={selected ? "font-bold text-foreground" : "text-muted-foreground"}>{item}</span>
                </span>
                <span className="text-[11px] tabular-nums text-muted-foreground">{categoryCounts[item] ?? 0}</span>
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={category === "Tümü"}
            onClick={() => onCategoryChange("Tümü")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted"
          >
            <span>Tüm kategoriler</span>
            <span className="text-[11px] tabular-nums">{Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)}</span>
          </button>
        </div>
      </section>

      <section className="py-4" aria-labelledby="catalog-brand-filter">
        <h3 id="catalog-brand-filter" className="mb-2 text-xs font-extrabold">Markalar</h3>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {brands.filter((item) => item !== "Tümü").map((item) => {
            const selected = brand === item;
            return (
              <button
                type="button"
                key={item}
                aria-pressed={selected}
                onClick={() => onBrandChange(selected ? "Tümü" : item)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-muted"
                data-testid={`filter-brand-${item}`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}>
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span className={selected ? "font-bold text-foreground" : "text-muted-foreground"}>{item}</span>
                </span>
                <span className="text-[11px] tabular-nums text-muted-foreground">{brandCounts[item] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 py-4">
        <label className="block">
          <span className="mb-2 block text-xs font-extrabold">Ürün durumu</span>
          <span className="relative block">
            <select
              value={condition}
              onChange={(event) => onConditionChange(event.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 pr-9 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
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
          <span className="mb-2 block text-xs font-extrabold">Stok durumu</span>
          <button
            type="button"
            role="switch"
            aria-checked={stockOnly}
            onClick={onStockChange}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
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
      </section>

      {hasSelectedFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 pt-4 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
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
          className="mt-4 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white"
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
  const [sort, setSort] = useState("default");

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

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of allProducts) counts[product.brand] = (counts[product.brand] ?? 0) + 1;
    return counts;
  }, [allProducts]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of allProducts) counts[product.category] = (counts[product.category] ?? 0) + 1;
    return counts;
  }, [allProducts]);

  const brandCards = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of allProducts) {
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return BRANDS.map((item) => ({
      ...item,
      productCount: counts.get(item.name) ?? 0,
    }));
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

  const sortedProducts = useMemo(() => {
    if (sort === "default") return filtered;
    return [...filtered].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "tr");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "tr");
      if (a.price == null) return b.price == null ? 0 : 1;
      if (b.price == null) return -1;
      const aPrice = Number(a.price);
      const bPrice = Number(b.price);
      return sort === "price-desc" ? bPrice - aPrice : aPrice - bPrice;
    });
  }, [filtered, sort]);

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
    brandCounts,
    categoryCounts,
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
  const heroProduct = allProducts.find((product) => product.images?.[0]?.imageUrl || product.imageUrl);
  const heroImage = heroProduct?.images?.[0]?.imageUrl ?? heroProduct?.imageUrl ?? "/products/siemens-g120.png";

  return (
    <>
      <SEO
        title="Yedek Parça Kataloğu | Burem Elektronik"
        description="Siemens, ABB, Fanuc, Yaskawa ve daha fazla markaya ait endüstriyel elektronik yedek parçaları keşfedin."
        canonical="/magaza"
      />

      <div className="min-h-screen bg-[#f6f6f4] text-foreground">
        <StoreHeader />

        <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f1f2f0]">
          {heroImage && (
            <img
              src={optimizedProductImageUrl(heroImage, 1100)}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 h-full w-[58%] object-cover object-center opacity-25 mix-blend-multiply [mask-image:linear-gradient(to_right,transparent,black_42%)]"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#f1f2f0_0%,rgba(241,242,240,.94)_42%,rgba(241,242,240,.14)_100%)]" />
          <div className="relative mx-auto flex min-h-[220px] max-w-7xl items-end px-4 py-8 md:min-h-[250px] md:px-6 md:py-10">
            <div className="max-w-2xl">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Burem Elektronik</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-[42px]">Yedek Parça Kataloğu</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
                Endüstriyel otomasyon ve sürücü sistemleri için yedek parçaları marka, parça numarası ve stok bilgileriyle inceleyin.
              </p>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <nav aria-label="İçerik yolu" className="mb-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Ana Sayfa</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span>Mağaza</span>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="font-semibold text-foreground">Yedek Parça</span>
          </nav>

          <div className="grid gap-7 lg:grid-cols-[232px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-slate-200 bg-white px-4">
                <FilterContent {...filterProps} />
              </div>
            </aside>

            <section className="min-w-0" aria-label="Ürün kataloğu">
              <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {isLoading ? "Ürünler yükleniyor…" : `${sortedProducts.length} ürün listeleniyor`}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="relative block min-w-0 flex-1 sm:min-w-[230px]">
                    <span className="sr-only">Ürün ara</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Ürün veya parça no ara..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-slate-500 focus:ring-2 focus:ring-slate-900/10"
                      data-testid="input-product-search"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((value) => !value)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 lg:hidden"
                    data-testid="button-filters"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filtrele
                    {activeFilters.length > 0 && <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] text-white">{activeFilters.length}</span>}
                  </button>
                  <label className="relative">
                    <span className="sr-only">Sıralama</span>
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 sm:w-[145px]"
                      aria-label="Sıralama"
                    >
                      <option value="default">Varsayılan</option>
                      <option value="name-asc">Ürün adı A-Z</option>
                      <option value="name-desc">Ürün adı Z-A</option>
                      <option value="price-asc">Fiyat artan</option>
                      <option value="price-desc">Fiyat azalan</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </label>
                </div>
              </div>

              {filtersOpen && (
            <div className="fixed inset-0 z-[80] lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                onClick={() => setFiltersOpen(false)}
                aria-label="Filtreleri kapat"
              />
              <aside className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl">
                <FilterContent {...filterProps} onClose={() => setFiltersOpen(false)} />
              </aside>
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-foreground"
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-[.9] animate-pulse rounded-xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3" data-testid="grid-products">
              {sortedProducts.map((product) => <StoreProductCard key={product.id} product={product} />)}
            </div>
          )}
            </section>
          </div>

          <section className="mt-14" aria-labelledby="shop-by-brand-heading">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Burem Elektronik · Marka Rehberi
                </p>
                <h2 id="shop-by-brand-heading" className="text-2xl font-bold tracking-tight md:text-3xl">
                  Markaya göre keşfet
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Endüstriyel yedek parça ve ekipmanları tanıdığınız markaya göre bulun.
                </p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {brandCards.length} marka
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {brandCards.map((item) => (
                <Link
                  key={item.name}
                  href={`/brand/${encodeURIComponent(item.name)}`}
                  aria-label={`${item.name} markasını keşfet`}
                  className="group relative flex min-h-[132px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-card px-4 py-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-[148px]"
                  data-testid={`brand-card-${item.name}`}
                >
                  <span
                    className="absolute inset-x-8 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <div className="flex h-12 w-full items-center justify-center sm:h-14">
                    <img
                      src={item.logo}
                      alt=""
                      loading="lazy"
                      className="max-h-full max-w-[78%] object-contain opacity-75 grayscale transition-all duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                      style={{ transform: item.scale ? `scale(${item.scale})` : undefined }}
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                    <span className="sr-only">{item.name}</span>
                  </div>
                  <span className="mt-3 text-sm font-bold text-foreground">
                    {item.name}
                  </span>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    {item.productCount > 0
                      ? `${item.productCount} ürün`
                      : "Markayı keşfet"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <BuremFooter />
      </div>
    </>
  );
}