import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { MessageCircle, Phone, Search, SlidersHorizontal, X, Package, CheckCircle2, XCircle } from "lucide-react";
import BuremFooter from "@/components/ui/footer";
import { SEO } from "@/components/seo";

const WA = "905322664764";
const PHONE = "+905322664764";
const PHONE_DISPLAY = "+90 532 266 47 64";

const CATEGORIES = ["Tümü", "İnverter", "Servo Sürücü", "PLC", "HMI", "Elektronik Kart", "Motor", "Sensör", "Diğer"];
const BRANDS     = ["Tümü", "Siemens", "ABB", "Fanuc", "Yaskawa", "Mitsubishi", "Lenze", "KEB", "Schneider", "Danfoss", "Omron", "SEW-Eurodrive", "Bosch Rexroth", "Beckhoff", "Allen Bradley", "Panasonic"];
const CONDITIONS: Record<string, string> = { new: "Sıfır", used: "2. El", refurbished: "Yenilenmiş" };

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("tr-TR").format(price)} TL`;
}

function waLink(p: Product) {
  const msg = `Merhaba, *${p.name}* (${p.brand}${p.partNumber ? ` — ${p.partNumber}` : ""}) hakkında fiyat almak istiyorum.`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

function ProductCard({ p }: { p: Product }) {
  return (
    <div
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-border/80 hover:shadow-lg transition-all duration-200"
      data-testid={`card-product-${p.id}`}
    >
      {/* Görsel */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {/* Stok durumu */}
        <span className={`absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          p.inStock ? "bg-green-500/15 text-green-600 border border-green-500/30" : "bg-red-500/10 text-red-500 border border-red-500/20"
        }`}>
          {p.inStock
            ? <><CheckCircle2 className="h-3 w-3" />Stokta</>
            : <><XCircle className="h-3 w-3" />Stok Dışı</>
          }
        </span>
        {/* Durum etiketi */}
        {p.condition && p.condition !== "new" && (
          <span className="absolute top-2 left-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {CONDITIONS[p.condition] ?? p.condition}
          </span>
        )}
      </div>

      {/* İçerik */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{p.brand}</span>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-foreground line-clamp-2" data-testid={`text-product-name-${p.id}`}>{p.name}</h3>
          {p.partNumber && (
            <span className="mt-0.5 block text-[11px] text-muted-foreground font-mono">P/N: {p.partNumber}</span>
          )}
        </div>
        {p.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>
        )}
        {p.price != null && (
          <p className="text-lg font-bold tracking-tight text-foreground">{formatPrice(p.price)}</p>
        )}
        {p.stockQuantity != null && p.stockQuantity > 0 && (
          <p className="text-xs text-muted-foreground">{p.stockQuantity} adet mevcut</p>
        )}
        <div className="mt-auto pt-2 flex flex-col gap-1.5">
          <a
            href={waLink(p)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:bg-[#20ba5a] transition-colors"
            data-testid={`button-wa-${p.id}`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp Fiyat Sor
          </a>
          <a
            href={`tel:${PHONE}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
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

export default function MagazaPage() {
  const [search, setSearch]   = useState("");
  const [brand, setBrand]     = useState("Tümü");
  const [cat, setCat]         = useState("Tümü");
  const [stockOnly, setStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (brand !== "Tümü" && p.brand !== brand) return false;
      if (cat   !== "Tümü" && p.category !== cat) return false;
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
    });
  }, [allProducts, brand, cat, stockOnly, search]);

  const activeFilters = [
    brand !== "Tümü" && brand,
    cat   !== "Tümü" && cat,
    stockOnly && "Stokta",
  ].filter(Boolean) as string[];

  return (
    <>
      <SEO
        title="Yedek Parça Kataloğu | Burem Elektronik"
        description="Siemens, ABB, Fanuc, Yaskawa ve daha fazla markaya ait endüstriyel elektronik yedek parçalar. WhatsApp ile fiyat sorun."
        canonical="/magaza"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Nav */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <Link href="/" className="flex items-center gap-2" aria-label="Ana sayfa">
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

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          {/* Başlık */}
          <div className="mb-6">
            <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Ana Sayfa
            </Link>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
              Yedek Parça Kataloğu
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLoading ? "Yükleniyor…" : `${filtered.length} ürün listelendi`}
            </p>
          </div>

          {/* Arama + Filtre satırı */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ürün adı, marka veya parça no…"
                className="w-full rounded-2xl border border-border bg-muted/40 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                data-testid="input-search"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                filtersOpen || activeFilters.length > 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-muted/40 text-foreground hover:bg-muted"
              }`}
              data-testid="button-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtrele
              {activeFilters.length > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Filtre paneli */}
          {filtersOpen && (
            <div className="mb-6 rounded-2xl border border-border bg-card p-4 space-y-4">
              {/* Marka */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Marka</p>
                <div className="flex flex-wrap gap-2">
                  {BRANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBrand(b)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        brand === b
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                      }`}
                      data-testid={`filter-brand-${b}`}
                    >{b}</button>
                  ))}
                </div>
              </div>
              {/* Kategori */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kategori</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        cat === c
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                      }`}
                      data-testid={`filter-cat-${c}`}
                    >{c}</button>
                  ))}
                </div>
              </div>
              {/* Stok */}
              <div className="flex items-center gap-3">
                <button
                  role="switch"
                  aria-checked={stockOnly}
                  onClick={() => setStockOnly((v) => !v)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${stockOnly ? "bg-foreground" : "bg-border"}`}
                  data-testid="toggle-stock"
                >
                  <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${stockOnly ? "translate-x-4" : ""}`} />
                </button>
                <span className="text-sm text-foreground">Sadece stokta olanlar</span>
              </div>
              {/* Sıfırla */}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => { setBrand("Tümü"); setCat("Tümü"); setStockOnly(false); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-clear-filters"
                >
                  <X className="h-3.5 w-3.5" /> Filtreleri Temizle
                </button>
              )}
            </div>
          )}

          {/* Aktif filtre chip'leri */}
          {activeFilters.length > 0 && !filtersOpen && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeFilters.map((f) => (
                <span key={f} className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  {f}
                  <button onClick={() => {
                    if (f === brand) setBrand("Tümü");
                    else if (f === cat) setCat("Tümü");
                    else setStockOnly(false);
                  }} className="ml-0.5 hover:text-red-500 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Ürün grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold">Ürün bulunamadı</p>
              <p className="text-sm text-muted-foreground">Farklı anahtar kelime veya filtre deneyin.</p>
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent("Merhaba, aradığım yedek parçayı katalogda bulamadım. Yardımcı olabilir misiniz?")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20ba5a] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp'tan Sorun
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" data-testid="grid-products">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </main>

        <BuremFooter />
      </div>
    </>
  );
}
