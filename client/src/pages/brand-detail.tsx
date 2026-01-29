import { useRoute } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck, Timer, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const brandName = params?.name ? decodeURIComponent(params.name) : "";

  const brand = useMemo(() => {
    const normalized = brandName.trim().toLowerCase();
    const brands = [
      { name: "Siemens", bgColor: "#008080", color: "#FFFFFF", logo: "https://www.logo.wine/a/logo/Siemens/Siemens-Logo.wine.svg" },
      { name: "ABB", bgColor: "#FF0000", color: "#FFFFFF", logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg" },
      { name: "Schneider", bgColor: "#3DCD58", color: "#FFFFFF", logo: "https://www.logo.wine/a/logo/Schneider_Electric/Schneider_Electric-Logo.wine.svg" },
      { name: "Fanuc", bgColor: "#FFD700", color: "#CC0000", logo: "https://www.logo.wine/a/logo/FANUC/FANUC-Logo.wine.svg" },
      { name: "Yaskawa", bgColor: "#004098", color: "#FFFFFF", logo: "https://www.logo.wine/a/logo/Yaskawa_Electric_Corporation/Yaskawa_Electric_Corporation-Logo.wine.svg" },
      { name: "Omron", bgColor: "#003DA5", color: "#FFFFFF", logo: "https://www.logo.wine/a/logo/Omron/Omron-Logo.wine.svg" },
      { name: "Lenze", bgColor: "#0046AD", color: "#FFFFFF", logo: "https://findlogovector.com/wp-content/uploads/2019/04/lenze-logo-vector.png" },
      { name: "Mitsubishi", bgColor: "#FFFFFF", color: "#E60012", logo: "https://www.logo.wine/a/logo/Mitsubishi/Mitsubishi-Logo.wine.svg" },
      { name: "Danfoss", bgColor: "#E2000F", color: "#FFFFFF", logo: "https://findlogovector.com/wp-content/uploads/2018/09/danfoss-logo-vector.png" },
      { name: "Delta", bgColor: "#003A8C", color: "#FFFFFF", logo: "https://seekvectorlogo.net/wp-content/uploads/2019/04/delta-electronics-vector-logo.png" },
      { name: "Beckhoff", bgColor: "#000000", color: "#E30613", logo: "https://cdn.worldvectorlogo.com/logos/beckhoff-logo.svg" },
      { name: "Allen Bradley", bgColor: "#000000", color: "#CC0000", logo: "https://seekvectorlogo.net/wp-content/uploads/2019/02/allen-bradley-vector-logo.png" },
      { name: "Fuji", bgColor: "#E60012", color: "#FFFFFF", logo: "https://www.logo.wine/a/logo/Fuji_Electric/Fuji_Electric-Logo.wine.svg" },
      { name: "Rexroth", bgColor: "#003366", color: "#FFFFFF", logo: "https://www.logo.wine/a/logo/Bosch_Rexroth/Bosch_Rexroth-Logo.wine.svg" },
    ];

    return brands.find((b) => b.name.toLowerCase() === normalized) ?? null;
  }, [brandName]);

  return (
    <div className="relative min-h-screen text-foreground">
      <BrandBackgroundLogo brand={brand} />

      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Button variant="ghost" className="rounded-xl" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
          <div className="text-right">
            <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
              {brandName} Servis Merkezi
            </h1>
            <p className="text-xs text-muted-foreground">Inductra Elektronik Güvencesiyle</p>
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
        </motion.div>
      </main>
    </div>
  );
}
