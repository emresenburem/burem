import { useRoute, useLocation } from "wouter";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldCheck, Timer, Wrench, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderLogo } from "@/components/header-logo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

const BRANDS = [
  { name: "Siemens", color: "#009999", logo: "https://www.logo.wine/a/logo/Siemens/Siemens-Logo.wine.svg" },
  { name: "ABB", color: "#FF0000", logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg" },
  { name: "Schneider", color: "#3dcd58", logo: "https://www.logo.wine/a/logo/Schneider_Electric/Schneider_Electric-Logo.wine.svg" },
  { name: "Fanuc", color: "#FFD700", logo: "https://www.logo.wine/a/logo/FANUC/FANUC-Logo.wine.svg" },
  { name: "Yaskawa", color: "#004098", logo: "https://www.logo.wine/a/logo/Yaskawa_Electric_Corporation/Yaskawa_Electric_Corporation-Logo.wine.svg" },
  { name: "Omron", color: "#005EB8", logo: "https://www.logo.wine/a/logo/Omron/Omron-Logo.wine.svg" },
  { name: "Lenze", color: "#0046AD", logo: "https://findlogovector.com/wp-content/uploads/2019/04/lenze-logo-vector.png" },
  { name: "Mitsubishi", color: "#E60012", logo: "https://www.logo.wine/a/logo/Mitsubishi/Mitsubishi-Logo.wine.svg" },
  { name: "Danfoss", color: "#E2000F", logo: "https://findlogovector.com/wp-content/uploads/2018/09/danfoss-logo-vector.png" },
  { name: "Delta", color: "#003A8C", logo: "https://seekvectorlogo.net/wp-content/uploads/2019/04/delta-electronics-vector-logo.png" },
  { name: "Beckhoff", color: "#E30613", logo: "https://cdn.worldvectorlogo.com/logos/beckhoff-logo.svg" },
  { name: "Allen Bradley", color: "#000000", logo: "https://seekvectorlogo.net/wp-content/uploads/2019/02/allen-bradley-vector-logo.png" },
  { name: "Fuji", color: "#E60012", logo: "https://www.logo.wine/a/logo/Fuji_Electric/Fuji_Electric-Logo.wine.svg" },
  { name: "Rexroth", color: "#003366", logo: "https://www.logo.wine/a/logo/Bosch_Rexroth/Bosch_Rexroth-Logo.wine.svg" },
];

function ProductsSection({ brandName }: { brandName: string }) {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/brand", brandName],
    queryFn: async () => {
      const res = await fetch(`/api/products/brand/${encodeURIComponent(brandName)}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  return (
    <div className="mt-16 space-y-6" data-testid="products-section">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
          {brandName} Yedek Parçaları
        </h3>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl border bg-card p-4 animate-pulse">
              <div className="h-32 bg-muted rounded-xl mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="rounded-2xl border bg-card/50 p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Bu marka için henüz yedek parça eklenmemiş.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Aradığınız parça için bizimle iletişime geçebilirsiniz.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="rounded-2xl border bg-card p-4 hover:shadow-lg transition-shadow"
              data-testid={`card-product-${product.id}`}
            >
              {product.imageUrl && (
                <div className="h-32 mb-4 rounded-xl overflow-hidden bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm">{product.name}</h4>
                  {product.inStock ? (
                    <Badge variant="secondary" className="text-xs shrink-0">Stokta</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs shrink-0">Sipariş</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{product.category}</p>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                )}
                {product.price && (
                  <p className="font-bold text-primary">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(product.price / 100)}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BrandBackgroundLogo({ brand }: { brand: { name: string; logo?: string; color?: string } | null }) {
  if (!brand?.logo) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      data-testid="bg-brand-logo"
    >
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid opacity-[0.15]" />
      <div className="absolute inset-0 bg-noise opacity-[0.15]" />

      <div className="absolute inset-0 grid place-items-center">
        <img
          src={brand.logo}
          alt=""
          className="w-[85vw] max-w-[1100px] h-auto object-contain"
          style={{ 
            opacity: 0.15,
            filter: "grayscale(0.3) contrast(1.2)" 
          }}
          data-testid="img-brand-logo-watermark"
        />
      </div>
    </div>
  );
}

export default function BrandPage() {
  const [, params] = useRoute("/brand/:name");
  const [, setLocation] = useLocation();
  const brandName = params?.name ? decodeURIComponent(params.name) : "";
  const [direction, setDirection] = useState(0);
  const prevBrandName = useRef(brandName);

  const { brand, prevBrand, nextBrand, currentIndex } = useMemo(() => {
    const normalized = brandName.trim().toLowerCase();
    const idx = BRANDS.findIndex((b) => b.name.toLowerCase() === normalized);
    
    if (idx === -1) {
      return { brand: null, prevBrand: null, nextBrand: null, currentIndex: -1 };
    }
    
    const prevIndex = idx === 0 ? BRANDS.length - 1 : idx - 1;
    const nextIndex = idx === BRANDS.length - 1 ? 0 : idx + 1;
    
    return {
      brand: BRANDS[idx],
      prevBrand: BRANDS[prevIndex],
      nextBrand: BRANDS[nextIndex],
      currentIndex: idx,
    };
  }, [brandName]);

  useEffect(() => {
    if (prevBrandName.current !== brandName) {
      const prevNormalized = prevBrandName.current.trim().toLowerCase();
      const prevIdx = BRANDS.findIndex((b) => b.name.toLowerCase() === prevNormalized);
      if (prevIdx !== -1 && currentIndex !== -1) {
        setDirection(currentIndex > prevIdx ? 1 : -1);
      }
      prevBrandName.current = brandName;
    }
  }, [brandName, currentIndex]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const navigateTo = (name: string, dir: number) => {
    setDirection(dir);
    setLocation(`/brand/${encodeURIComponent(name)}`);
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div 
        key={brandName}
        className="relative min-h-screen text-foreground"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
      <BrandBackgroundLogo brand={brand} />

      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-0 md:px-6">
          <div className="-ml-8 -mt-10 mb-[-2.5rem]">
            <HeaderLogo />
          </div>
          <div className="text-right -mt-2">
            <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
              {brandName} Servis Merkezi
            </h1>
            <p className="text-xs text-muted-foreground">Burem Elektronik Güvencesiyle</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 rounded-full px-4 py-1">Yetkin Teknik Servis</Badge>
          <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
            {brandName} Sürücü ve Kart Tamiri
          </h2>
          <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
            {brandName} marka endüstriyel cihazlarınız için profesyonel onarım çözümleri sunuyoruz. 
            Orijinal yedek parça desteği ve yük altında test imkanlarımızla işleyişinizin aksamasını engelliyoruz.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="rounded-3xl border bg-card p-6 shadow-sm">
              <Wrench className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-bold tracking-tight">Uzman Onarım</h3>
              <p className="text-sm text-muted-foreground">{brandName} teknolojisine hakim teknik ekip ve ekipmanlar.</p>
            </Card>
            <Card className="rounded-3xl border bg-card p-6 shadow-sm">
              <Timer className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-bold tracking-tight">Hızlı Termin</h3>
              <p className="text-sm text-muted-foreground">Kritik üretim hatları için öncelikli ve hızlı arıza tespiti.</p>
            </Card>
            <Card className="rounded-3xl border bg-card p-6 shadow-sm">
              <ShieldCheck className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-bold tracking-tight">Garantili İşçilik</h3>
              <p className="text-sm text-muted-foreground">Yapılan tüm işlemler ve değişen parçalar kayıt altındadır.</p>
            </Card>
          </div>

          <div className="mt-16 rounded-3xl border bg-primary/5 p-8 md:p-12 text-center">
            <h3 className="mb-4 text-2xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
              {brandName} Cihazınız İçin Teklif Alın
            </h3>
            <p className="mb-8 text-muted-foreground">Marka model ve arıza bilgisini ileterek ön fiyatlandırma talep edebilirsiniz.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-12 rounded-2xl px-8" onClick={() => window.location.href='/#contact'}>
                Teklif İste
              </Button>
              <Button variant="outline" size="lg" className="h-12 rounded-2xl px-8" onClick={() => window.open('https://wa.me/905000000000', '_blank')}>
                WhatsApp ile Yaz
              </Button>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <h4 className="font-bold tracking-tight">Desteklenen Modeller ve Hizmetler</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                `${brandName} Inverter ve AC Sürücüler`,
                `${brandName} Servo Sürücü ve Motorlar`,
                `${brandName} PLC ve Modül Onarımı`,
                `${brandName} Operatör Panelleri (HMI)`,
                `${brandName} Güç Kaynakları ve Kartlar`,
                "Orijinal Komponent Değişimi"
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ProductsSection brandName={brandName} />
        </motion.div>
      </main>

      {/* Navigation Buttons */}
      {prevBrand && (
        <motion.button
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center gap-2 w-24 h-12 rounded-xl bg-white/90 border shadow-lg backdrop-blur-sm cursor-pointer hover:bg-white transition-all"
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateTo(prevBrand.name, -1)}
          data-testid="btn-prev-brand"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          <img 
            src={prevBrand.logo} 
            alt={prevBrand.name}
            className="w-12 h-7 object-contain"
          />
        </motion.button>
      )}

      {nextBrand && (
        <motion.button
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center gap-2 w-24 h-12 rounded-xl bg-white/90 border shadow-lg backdrop-blur-sm cursor-pointer hover:bg-white transition-all"
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateTo(nextBrand.name, 1)}
          data-testid="btn-next-brand"
        >
          <img 
            src={nextBrand.logo} 
            alt={nextBrand.name}
            className="w-12 h-7 object-contain"
          />
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      )}
      </motion.div>
    </AnimatePresence>
  );
}
