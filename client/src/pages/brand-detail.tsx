import { useRoute } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck, Timer, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function BrandCursorLogo({ brand, active = true }: { brand: { name: string; logo?: string; color?: string } | null; active?: boolean }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [lastMoveAt, setLastMoveAt] = useState<number>(0);

  useEffect(() => {
    if (!active) return;

    let raf = 0;
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setPos({ x, y });
        setVisible(true);
        setLastMoveAt(Date.now());
      });
    };

    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [active]);

  if (!active || !brand?.logo) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden="true"
      data-testid="overlay-brand-cursor-logo"
    >
      <motion.div
        className="absolute"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.9,
        }}
        transition={{ duration: 0.12, ease: "easeOut" }}
      >
        <div
          className="grid place-items-center rounded-full"
          style={{
            width: 120,
            height: 120,
            background:
              "radial-gradient(circle, rgba(250,251,252,0.6) 0%, rgba(250,251,252,0.22) 45%, rgba(250,251,252,0) 72%)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(10,17,34,0.14)",
              boxShadow:
                "0 0 0 1px rgba(10,17,34,0.06) inset, 0 0 0 10px rgba(10,17,34,0.03)",
            }}
          />
          <div
            className="absolute inset-[-10px] rounded-full"
            style={{ border: "1px solid rgba(10,17,34,0.06)" }}
          />
          <div
            className="absolute inset-[-22px] rounded-full"
            style={{ border: "1px solid rgba(10,17,34,0.04)" }}
          />
          <img
            src={brand.logo}
            alt=""
            className="h-12 w-12 object-contain"
            style={{
              filter: "contrast(1.1) saturate(1.05)",
              opacity: 0.9,
            }}
            data-testid="img-brand-cursor-logo"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function BrandPage() {
  const [, params] = useRoute("/brand/:name");
  const brandName = params?.name ? decodeURIComponent(params.name) : "";

  const brand = useMemo(() => {
    const normalized = brandName.trim().toLowerCase();
    const brands = [
      { name: "Siemens", color: "#009999", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens-logo.svg" },
      { name: "ABB", color: "#FF0000", logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg" },
      { name: "Schneider", color: "#3dcd58", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Schneider_Electric_2007.svg" },
      { name: "Fanuc", color: "#FFD700", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Fanuc_logo.svg" },
      { name: "Yaskawa", color: "#004098", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Yaskawa_Electric_Corporation_logo.svg" },
      { name: "Omron", color: "#005EB8", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Omron_logo.svg" },
      { name: "Lenze", color: "#0046AD", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Lenze_logo.svg" },
      { name: "Mitsubishi", color: "#E60012", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Mitsubishi-logo.png" },
      { name: "Danfoss", color: "#E2000F", logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Danfoss-Logo.svg" },
      { name: "Delta", color: "#003A8C", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Delta_Electronics_logo.svg" },
      { name: "Beckhoff", color: "#E30613", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Beckhoff_Logo.svg" },
      { name: "Allen Bradley", color: "#000000", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Rockwell_Automation_logo.svg" },
      { name: "Fuji", color: "#E60012", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/Fuji_Electric_logo.svg" },
      { name: "Eaton", color: "#005EB8", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Eaton_logo.svg" },
    ];

    return brands.find((b) => b.name.toLowerCase() === normalized) ?? null;
  }, [brandName]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandCursorLogo brand={brand} active />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.2]" />
        <div className="absolute inset-0 bg-noise opacity-[0.2]" />
      </div>

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

      <main className="mx-auto max-w-4xl px-4 py-12 md:px-6">
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
