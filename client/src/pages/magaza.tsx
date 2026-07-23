import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import {
  MessageCircle, Phone, Search, SlidersHorizontal,
  X, Package, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { SEO } from "@/components/seo";

const WA = "905322664764";
const PHONE = "+905322664764";
const PHONE_DISPLAY = "+90 532 266 47 64";

const CATEGORIES = ["Tümü","İnverter","Servo Sürücü","PLC","HMI","Elektronik Kart","Motor","Sensör","Diğer"];
const BRANDS = ["Tümü","Siemens","ABB","Fanuc","Yaskawa","Mitsubishi","Lenze","Schneider","Danfoss","Omron","SEW-Eurodrive","Bosch Rexroth","Beckhoff","Allen Bradley","Panasonic"];
const CONDITIONS: Record<string,string> = { new:"Sıfır", used:"İkinci El", refurbished:"Yenilenmiş" };

function waLink(p: Product) {
  const msg = `Merhaba, *${p.name}* (${p.brand}${p.partNumber ? ` — ${p.partNumber}` : ""}) hakkında fiyat almak istiyorum.`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

/* ─── Kart ─── */
function ProductCard({ p }: { p: Product }) {
  return (
    <div
      className="group relative flex flex-col border-r border-border bg-card hover:bg-accent/5 transition-colors flex-shrink-0"
      style={{ width: 280 }}
      data-testid={`card-product-${p.id}`}
    >
      {/* Görsel alanı — sabit yükseklik */}
      <div className="relative overflow-hidden bg-muted flex-shrink-0" style={{ height: 220 }}>
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-14 w-14 text-muted-foreground/20" />
          </div>
        )}
        <span className={`absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          p.inStock
            ? "bg-green-500/15 text-green-600 border border-green-500/30"
            : "bg-red-500/10 text-red-500 border border-red-500/20"
        }`}>
          {p.inStock ? <><CheckCircle2 className="h-3 w-3"/>Stokta</> : <><XCircle className="h-3 w-3"/>Stok Dışı</>}
        </span>
        {p.condition && p.condition !== "new" && (
          <span className="absolute top-3 left-3 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {CONDITIONS[p.condition] ?? p.condition}
          </span>
        )}
      </div>

      {/* İçerik */}
      <div className="flex flex-1 flex-col gap-3 p-5 border-t border-border">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{p.brand}</span>
          <h3 className="mt-1 text-sm font-semibold leading-snug text-foreground line-clamp-2" data-testid={`text-product-name-${p.id}`}>{p.name}</h3>
          {p.partNumber && (
            <span className="mt-1 block text-[11px] font-mono text-muted-foreground">P/N: {p.partNumber}</span>
          )}
        </div>
        {p.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{p.description}</p>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-1">
          <a
            href={waLink(p)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#20ba5a] transition-colors"
            data-testid={`button-wa-${p.id}`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp Fiyat Sor
          </a>
          <a
            href={`tel:${PHONE}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            data-testid={`button-phone-${p.id}`}
          >
            <Phone className="h-3.5 w-3.5" />
            Ara
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Sayfa ─── */
export default function MagazaPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [search, setSearch]       = useState("");
  const [brand, setBrand]         = useState("Tümü");
  const [cat, setCat]             = useState("Tümü");
  const [stockOnly, setStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const filtered = useMemo(() => allProducts.filter((p) => {
    if (brand !== "Tümü" && p.brand !== brand) return false;
    if (cat   !== "Tümü" && p.category !== cat)  return false;
    if (stockOnly && !p.inStock) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.partNumber ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  }), [allProducts, brand, cat, stockOnly, search]);

  const activeFilters = [
    brand !== "Tümü" && brand,
    cat   !== "Tümü" && cat,
    stockOnly && "Stokta",
  ].filter(Boolean) as string[];

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 560 : -560, behavior: "smooth" });
  }

  return (
    <>
      <SEO
        title="Yedek Parça Kataloğu | Burem Elektronik"
        description="Siemens, ABB, Fanuc, Yaskawa ve daha fazla markaya ait endüstriyel elektronik yedek parçalar."
        canonical="/magaza"
      />

      {/*
        Tam ekran layout:
          ┌─ header (shrink-0) ──────────────────┐
          ├─ kontrol (shrink-0) ─────────────────┤
          └─ ürün şeridi (flex-1 min-h-0) ───────┘
      */}
      <div className="flex flex-col" style={{ height: "100dvh" }}>

        {/* ── NAV ── */}
        <header className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-md z-40">
          <nav className="flex items-center justify-between px-6 py-3 w-full">
            <Link href="/" aria-label="Ana sayfa" className="flex items-center gap-2">
              <img src="/logo.png" alt="Burem Elektronik" className="h-9 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${PHONE}`}
                className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                data-testid="link-phone-nav"
              >
                <Phone className="h-4 w-4" />{PHONE_DISPLAY}
              </a>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20ba5a] transition-colors"
                data-testid="link-wa-nav"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </nav>
        </header>

        {/* ── KONTROL ŞERIDI ── */}
        <div className="flex-shrink-0 border-b border-border bg-background px-6 py-4">
          {/* Satır 1: başlık + oklar */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <Link href="/" className="mb-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Ana Sayfa
              </Link>
              <h1 className="text-xl font-bold tracking-tight leading-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
                Yedek Parça Kataloğu
                <span className="ml-3 text-sm font-normal text-muted-foreground">
                  {isLoading ? "…" : `${filtered.length} ürün`}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => scroll("left")} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/40 hover:bg-muted transition-colors" data-testid="button-scroll-left" aria-label="Sola kaydır">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scroll("right")} className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors" data-testid="button-scroll-right" aria-label="Sağa kaydır">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Satır 2: arama + filtre */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ürün adı, marka veya parça no…"
                className="w-full rounded-xl border border-border bg-muted/40 pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                data-testid="input-search"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                filtersOpen || activeFilters.length > 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-muted/40 text-foreground hover:bg-muted"
              }`}
              data-testid="button-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtrele
              {activeFilters.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground">
                  {activeFilters.length}
                </span>
              )}
            </button>
            {activeFilters.map((f) => (
              <span key={f} className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                {f}
                <button onClick={() => {
                  if (f === brand) setBrand("Tümü");
                  else if (f === cat) setCat("Tümü");
                  else setStockOnly(false);
                }} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3"/></button>
              </span>
            ))}
          </div>

          {/* Filtre paneli */}
          {filtersOpen && (
            <div className="mt-4 rounded-2xl border border-border bg-card p-4 space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marka</p>
                <div className="flex flex-wrap gap-1.5">
                  {BRANDS.map((b) => (
                    <button key={b} onClick={() => setBrand(b)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${brand === b ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}
                      data-testid={`filter-brand-${b}`}>{b}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kategori</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setCat(c)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${cat === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}
                      data-testid={`filter-cat-${c}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button role="switch" aria-checked={stockOnly} onClick={() => setStockOnly((v) => !v)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${stockOnly ? "bg-foreground" : "bg-border"}`}
                  data-testid="toggle-stock">
                  <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${stockOnly ? "translate-x-4" : ""}`}/>
                </button>
                <span className="text-sm">Sadece stokta olanlar</span>
              </div>
              {activeFilters.length > 0 && (
                <button onClick={() => { setBrand("Tümü"); setCat("Tümü"); setStockOnly(false); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  data-testid="button-clear-filters">
                  <X className="h-3.5 w-3.5"/> Filtreleri Temizle
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── ÜRÜN ŞERİDİ — kalan tüm alan ── */}
        <div className="flex-1 min-h-0 overflow-hidden bg-background">
          {isLoading ? (
            <div className="flex h-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 border-r border-border animate-pulse bg-muted" style={{ width: 280 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-6">
              <Package className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold">Ürün bulunamadı</p>
              <p className="text-sm text-muted-foreground">Farklı anahtar kelime veya filtre deneyin.</p>
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent("Merhaba, aradığım yedek parçayı katalogda bulamadım. Yardımcı olabilir misiniz?")}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20ba5a] transition-colors"
              >
                <MessageCircle className="h-4 w-4"/>WhatsApp'tan Sorun
              </a>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex h-full overflow-x-auto"
              style={{ scrollbarWidth: "thin" }}
              data-testid="strip-products"
            >
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
