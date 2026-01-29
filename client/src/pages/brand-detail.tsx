import { useRoute } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck, Timer, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BRANDS } from "./home";

function BrandWatermark({ logo }: { logo?: string }) {
  const watermarks = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      scale: 1.2 + Math.random() * 0.5,
      opacity: 0.4 + Math.random() * 0.2,
    }));
  }, []);

  if (!logo) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {watermarks.map((w) => (
        <motion.img
          key={w.id}
          src={logo}
          alt=""
          className="absolute h-32 w-32"
          style={{
            top: w.top,
            left: w.left,
            rotate: w.rotate,
            scale: w.scale,
            opacity: w.opacity,
            filter: "grayscale(0) brightness(1) contrast(1.1)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: w.opacity }}
          transition={{ duration: 1 }}
        />
      ))}
    </div>
  );
}

export default function BrandPage() {
  const [, params] = useRoute("/brand/:name");
  const brandName = params?.name ? decodeURIComponent(params.name) : "";
  const brand = BRANDS.find(b => b.name === brandName);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandWatermark logo={brand?.logo} />
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
