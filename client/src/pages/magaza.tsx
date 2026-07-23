import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import {
  MessageCircle, Phone, Search, SlidersHorizontal,
  X, Package, CheckCircle2, XCircle,
} from "lucide-react";
import BuremFooter from "@/components/ui/footer";
import { SEO } from "@/components/seo";

const WA = "905322664764";
const PHONE = "+905322664764";
const PHONE_DISPLAY = "+90 532 266 47 64";

const CATEGORIES = ["Tümü","İnverter","Servo Sürücü","PLC","HMI","Elektronik Kart","Motor","Sensör","Diğer"];
const BRANDS     = ["Tümü","Siemens","ABB","Fanuc","Yaskawa","Mitsubishi","Lenze","Schneider","Danfoss","Omron","SEW-Eurodrive","Bosch Rexroth","Beckhoff","Allen Bradley","Panasonic"];
const CONDITIONS: Record<string,string> = { new:"Sıfır", used:"İkinci El", refurbished:"Yenilenmiş" };

function waLink(p: Product) {
  const msg = `Merhaba, *${p.name}* (${p.brand}${p.partNumber ? ` — ${p.partNumber}` : ""}) hakkında fiyat almak istiyorum.`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

/* ─── Kart ─── */
function ProductCard({ p }: { p: Product }) {
  return (
    <div
      className="group flex-shrink-0 w-56 flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      data-testid={`card-product-${p.id}`}
    >
      <div className="relative h-44 overflow-hidden bg-muted flex-shrink-0">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name}
            className="h-full w-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}
        <span className={`absolute top-2 right-2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
          p.inStock
            ? "bg-green-500/15 text-green-600 border border-green-500/30"
            : "bg-red-500/10 text-red-500 border border-red-500/20"
        }`}>
          {p.inStock ? <><CheckCircle2 className="h-2.5 w-2.5"/>Stokta</> : <><XCircle className="h-2.5 w-2.5"/>Yok</>}
        </span>
        {p.condition && p.condition !== "new" && (
          <span className="absolute top-2 left-2 rounded-full border border-border bg-background/90 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            {CONDITIONS[p.condition] ?? p.condition}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.brand}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-foreground line-clamp-2" data-testid={`text-product-name-${p.id}`}>
            {p.name}
          </h3>
          {p.partNumber && (
            <p className="mt-0.5 text-[10px] font-mono text-muted-foreground">P/N: {p.partNumber}</p>
          )}
        </div>
        {p.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>
        )}
        <div className="mt-auto pt-1 flex flex-col gap-1.5">
          <a href={waLink(p)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:bg-[#20ba5a] transition-colors"
            data-testid={`button-wa-${p.id}`}>
            <MessageCircle className="h-3.5 w-3.5" />WhatsApp Fiyat Sor
          </a>
          <a href={`tel:${PHONE}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            data-testid={`button-phone-${p.id}`}>
            <Phone className="h-3.5 w-3.5" />Ara
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Sayfa ─── */
export default function MagazaPage() {
  const trackRef  = useRef<HTMLDivElement>(null);
  const dragging  = useRef(false);
  const startX    = useRef(0);
  const scrollL   = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

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

  const activeFilters = [brand !== "Tümü" && brand, cat !== "Tümü" && cat, stockOnly && "Stokta"].filter(Boolean) as string[];

  const startDrag = useCallback((x: number) => {
    dragging.current = true;
    startX.current = x;
    scrollL.current = trackRef.current?.parentElement?.scrollLeft ?? 0;
    setGrabbing(true);
  }, []);

  const moveDrag = useCallback((x: number) => {
    if (!dragging.current || !trackRef.current?.parentElement) return;
    trackRef.current.parentElement.scrollLeft = scrollL.current - (x - startX.current);
  }, []);

  const endDrag = useCallback(() => {
    dragging.current = false;
    setGrabbing(false);
  }, []);

  return (
    <>
      <SEO
        title="Yedek Parça Kataloğu | Burem Elektronik"
        description="Siemens, ABB, Fanuc, Yaskawa ve daha fazla markaya ait endüstriyel elektronik yedek parçalar."
        canonical="/magaza"
      />

      <div className="min-h-screen bg-background text-foreground">

        {/* ── HEADER — ana sayfayla aynı stil ── */}
        <header className="relative sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <Link href="/" aria-label="Ana sayfa">
              <img src="/logo.png" alt="Burem Elektronik" className="h-9 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <a href={`tel:${PHONE}`}
                className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                data-testid="link-phone-nav">
                <Phone className="h-4 w-4" />{PHONE_DISPLAY}
              </a>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20ba5a] transition-colors"
                data-testid="link-wa-nav">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </nav>
        </header>

        {/* ── ÜRÜN BÖLÜMÜ — referanslarımız ile aynı w-full overflow-hidden pattern ── */}
        <section className="w-full py-12 overflow-hidden">

          {/* Başlık + arama — max-width ile ortalanmış */}
          <div className="mx-auto max-w-6xl px-4 md:px-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <Link href="/" className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Ana Sayfa
                </Link>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Mağaza</p>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
                  Yedek Parça Kataloğu
                </h1>
              </div>
              <p className="text-sm text-muted-foreground hidden sm:block text-right max-w-xs">
                {isLoading ? "Yükleniyor…" : `${filtered.length} ürün listelendi`}
              </p>
            </div>

            {/* Arama + Filtre */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ürün adı, marka veya parça no…"
                  className="w-full rounded-xl border border-border bg-muted/40 pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  data-testid="input-search" />
              </div>
              <button onClick={() => setFiltersOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${filtersOpen || activeFilters.length > 0 ? "border-foreground bg-foreground text-background" : "border-border bg-muted/40 hover:bg-muted"}`}
                data-testid="button-filters">
                <SlidersHorizontal className="h-4 w-4" />Filtrele
                {activeFilters.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground">{activeFilters.length}</span>
                )}
              </button>
              {activeFilters.map((f) => (
                <span key={f} className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium">
                  {f}
                  <button onClick={() => { if (f === brand) setBrand("Tümü"); else if (f === cat) setCat("Tümü"); else setStockOnly(false); }} className="hover:text-red-500 transition-colors"><X className="h-3 w-3"/></button>
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
                    <X className="h-3.5 w-3.5"/>Filtreleri Temizle
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── TAM GENİŞLİK KAYDIR ALANI — referanslarımız ile birebir aynı ── */}
          {isLoading ? (
            <div className="flex gap-4 px-6 overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-56 h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
              <Package className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold">Ürün bulunamadı</p>
              <p className="text-sm text-muted-foreground">Farklı anahtar kelime veya filtre deneyin.</p>
              <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Merhaba, aradığım yedek parçayı katalogda bulamadım. Yardımcı olabilir misiniz?")}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20ba5a] transition-colors">
                <MessageCircle className="h-4 w-4"/>WhatsApp'tan Sorun
              </a>
            </div>
          ) : (
            <div className="relative">
              {/* Sol kenar fade — referanslarımız ile aynı */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
              {/* Sağ kenar fade */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

              {/* Sürükleyerek kaydırılabilir şerit */}
              <div
                className="py-4 select-none overflow-x-hidden"
                style={{ cursor: grabbing ? "grabbing" : "grab" }}
                onMouseDown={(e) => startDrag(e.clientX)}
                onMouseMove={(e) => moveDrag(e.clientX)}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={(e) => startDrag(e.touches[0].clientX)}
                onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
                onTouchEnd={endDrag}
              >
                <div ref={trackRef} className="flex w-max gap-4 px-4">
                  {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
                </div>
              </div>
            </div>
          )}
        </section>

        <BuremFooter />
      </div>
    </>
  );
}
