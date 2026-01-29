import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import useSound from "use-sound";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Timer,
  Wrench,
  MessageCircle,
  Search,
  TestTube2,
  Zap,
  ListTodo,
  Microscope,
  ClipboardList,
  Binary,
  Telescope,
  Flame,
  PenLine,
  PackageCheck,
} from "lucide-react";

const BRANDS = [
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
  { name: "Eaton", color: "#005EB8", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Eaton_logo.svg" }
];

function BrandsPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [playTick] = useSound("/sounds/tick.mp3", { volume: 0.15, preload: true, interrupt: true });
  const lastOpenState = useRef(false);

  useEffect(() => {
    if (isOpen && !lastOpenState.current) {
      playTick();
    }
    lastOpenState.current = isOpen;
  }, [isOpen, playTick]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 50) {
        setIsOpen(true);
      } else if (e.clientX > 320) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="fixed left-0 top-0 z-[100] h-screen w-[300px] border-r bg-card/95 p-6 shadow-2xl backdrop-blur-xl"
          data-testid="popup-brands"
        >
          <h3 className="mb-6 font-semibold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
            Tamir Ettiğimiz Markalar
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {BRANDS.map((brand) => (
              <motion.div
                key={brand.name}
                whileHover={{ scale: 1.15, y: -5, rotate: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                onClick={() => setLocation(`/brand/${encodeURIComponent(brand.name)}`)}
                className="flex flex-col items-center justify-center rounded-xl border bg-white p-3 text-center transition-colors hover:border-primary/50 group shadow-sm cursor-pointer hover:shadow-xl hover:z-10"
                data-testid={`brand-item-${brand.name}`}
              >
                <div className="h-12 w-full flex items-center justify-center p-1">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="h-full w-full object-contain transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span 
                    className="font-bold tracking-tighter text-[18px] hidden" 
                    style={{ 
                      color: brand.color,
                      fontFamily: "Space Grotesk, sans-serif",
                      letterSpacing: "-0.05em"
                    }}
                  >
                    {brand.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Ve daha fazlası... Listenizde olmayan markalar için bize danışın.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/905000000000"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 transition-transform"
      data-testid="button-whatsapp"
    >
      <MessageCircle className="h-7 w-7 fill-white" />
    </motion.a>
  );
}
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const SERVICES = [
  {
    title: "Sürücü Tamiri",
    desc: "AC/DC sürücüler, inverterler, servo sürücüler. Arıza tespiti + onarım + test.",
    icon: Wrench,
  },
  {
    title: "Endüstriyel Elektronik",
    desc: "Güç kartları, kontrol kartları, SMPS, CNC/PLC çevre ekipmanları.",
    icon: ShieldCheck,
  },
  {
    title: "Hızlı Arıza Tespiti",
    desc: "Ön değerlendirme ve net raporlama. Gereksiz parça değişimi yok.",
    icon: Timer,
  },
];

const STEPS = [
  {
    k: "İnceleme",
    title: "Ön İnceleme",
    desc: "Arıza belirtisi, model bilgisi ve geçmiş işlemlerle hızlı başlangıç.",
    icon: ClipboardList,
  },
  {
    k: "Tespit",
    title: "Arıza Tespiti",
    desc: "Teknik ekip tarafından detaylı arıza analizi yapılır.",
    icon: Microscope,
  },
  {
    k: "Onarım",
    title: "Onarım + Parça İşçiligi",
    desc: "Ölçüm, izolasyon kontrolü, komponent değişimi ve temiz işçilik.",
    icon: Flame,
  },
  {
    k: "Test",
    title: "Test + Teslim",
    desc: "Yük altında test, stabilite kontrolü ve teslim öncesi rapor.",
    icon: PackageCheck,
  },
];

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          )[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      {
        rootMargin: "-30% 0px -60% 0px",
        threshold: [0.08, 0.12, 0.2, 0.3],
      },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);

  return active;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function InteractiveGradient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid opacity-[0.15]" />
      <div className="absolute inset-0 bg-noise opacity-[0.2]" />
    </div>
  );
}

function MagneticButton({ children, className, onClick, ...props }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Magnetic pull strength
    const strength = 0.35;
    setPosition({ x: distanceX * strength, y: distanceY * strength });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Global click handler handles the sound now
    if (onClick) onClick(e);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", damping: 15, stiffness: 150, mass: 0.1 }}
      className="inline-block"
    >
      <Button className={className} onClick={handleClick} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}

function HeaderLogo() {
  const [isFlickering, setIsFlickering] = useState(false);
  const [triggerCount, setTriggerCount] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isFlickering) {
      setIsFlickering(true);
      setTriggerCount(prev => prev + 1);
      setTimeout(() => setIsFlickering(false), 2500);
    }
  };

  return (
    <button
      type="button"
      onClick={() => scrollToId("top")}
      onMouseMove={handleMouseMove}
      className="group flex items-center gap-0 rounded-2xl py-1 text-left"
      data-testid="button-logo-home"
    >
      <motion.div 
        className="h-40 w-80 flex items-center justify-center overflow-hidden" 
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={isFlickering ? {
          opacity: [1, 0, 1, 0, 1, 0.2, 0.8, 0, 1, 0.4, 1],
        } : { opacity: 1 }}
        key={`logo-flicker-${triggerCount}`}
        transition={{
          duration: 2.5,
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
          ease: "easeInOut",
        }}
      >
        <img src="/logo.png" alt="Inductra Logo" className="h-full w-full object-contain mix-blend-multiply" />
      </motion.div>
      <span className="leading-tight -ml-16">
        <motion.span
          initial={{ opacity: 1, color: "#0a1122" }}
          animate={isFlickering ? {
            opacity: [1, 0, 1, 0, 1, 0.2, 0.8, 0, 1, 0.4, 1],
            color: ["#0a1122", "#3b82f6", "#0a1122", "#3b82f6", "#0a1122", "#3b82f6", "#0a1122"],
            textShadow: [
              "0 0 0px rgba(59,130,246,0)",
              "0 0 30px rgba(59,130,246,1)",
              "0 0 0px rgba(59,130,246,0)",
              "0 0 40px rgba(59,130,246,1)",
              "0 0 0px rgba(59,130,246,0)",
              "0 0 50px rgba(59,130,246,1)",
              "0 0 0px rgba(59,130,246,0)"
            ]
          } : { opacity: 1, color: "#0a1122" }}
          transition={{
            duration: 2.5,
            times: [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.45, 0.5, 0.7, 1],
            repeat: 0,
            ease: "easeInOut"
          }}
          className="block font-bold tracking-tight text-[#0a1122] text-xl md:text-2xl"
          style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
          data-testid="text-brand-name"
        >
          Inductra Elektronik
        </motion.span>
        <span
          className="block text-xs text-muted-foreground"
          data-testid="text-brand-tagline"
        >
          Sürücü Tamir Merkezi
        </span>
      </span>
    </button>
  );
}

export default function HomePage() {
  const preferReducedMotion = useReducedMotion();
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.1, preload: true, interrupt: true });

  const handleGlobalClick = () => {
    playClick();
  };

  const sections = useMemo(
    () => [
      { id: "top", label: "Ana Sayfa" },
      { id: "services", label: "Hizmetler" },
      { id: "process", label: "Süreç" },
      { id: "contact", label: "İletişim" },
    ],
    [],
  );

  const active = useScrollSpy(sections.map((s) => s.id));

  return (
    <div className="min-h-screen bg-background text-foreground" onClick={handleGlobalClick}>
      <InteractiveGradient />
      <WhatsAppButton />
      <BrandsPopup />
      <a
        href="#contact"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow-soft"
        data-testid="link-skip-contact"
      >
        İletişime geçe atla
      </a>

      {/* Arka plan InteractiveGradient içinde yönetiliyor */}
      
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 md:px-6">
          <HeaderLogo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Ana menü">
            {sections.slice(1).map((s) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToId(s.id)}
                  className={
                    "rounded-2xl px-3 py-2 text-sm transition " +
                    (isActive
                      ? "bg-card shadow-soft"
                      : "text-muted-foreground hover:bg-card")
                  }
                  data-testid={`button-nav-${s.id}`}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <MagneticButton
              variant="secondary"
              className="hidden rounded-2xl md:inline-flex"
              onClick={() => scrollToId("contact")}
              data-testid="button-cta-quote"
            >
              Teklif iste
            </MagneticButton>
            <MagneticButton
              className="rounded-2xl"
              onClick={() => scrollToId("contact")}
              data-testid="button-cta-contact"
            >
              İletişim
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </MagneticButton>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-10 md:px-6 md:pb-16 md:pt-16">
          <div className="grid items-start gap-8 md:grid-cols-[1.35fr_.65fr] md:gap-10">
            <motion.div
              initial={preferReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={preferReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge
                className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground shadow-soft"
                data-testid="badge-hero"
              >
                Elektronik sürücü tamiri · Endüstriyel servis
              </Badge>

              <h1
                className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-6xl"
                style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                data-testid="text-hero-title"
              >
                Sürücünüz arızalandıysa,
                <span className="block text-muted-foreground">
                  doğru teşhisle hızlıca ayağa kaldıralım.
                </span>
              </h1>

              <p
                className="mt-4 max-w-xl text-pretty text-base text-muted-foreground md:text-lg"
                data-testid="text-hero-subtitle"
              >
                Inductra Electronik; inverter, servo sürücü ve endüstriyel elektronik
                kartlarda arıza tespiti, onarım ve test sürecini net ve güvenilir
                şekilde yönetir.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <MagneticButton
                  className="h-11 rounded-2xl"
                  onClick={() => scrollToId("contact")}
                  data-testid="button-hero-contact"
                >
                  Hemen iletişime geç
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </MagneticButton>

                <MagneticButton
                  variant="secondary"
                  className="h-11 rounded-2xl"
                  onClick={() => scrollToId("services")}
                  data-testid="button-hero-services"
                >
                  Hizmetleri gör
                </MagneticButton>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["Hızlı dönüş", "Testli teslim", "Şeffaf rapor"].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2 text-sm shadow-soft"
                    data-testid={`pill-${t}`}
                  >
                    <CheckCircle2
                      className="h-4 w-4"
                      style={{ color: "hsl(var(--accent))" }}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={preferReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={preferReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="overflow-hidden rounded-3xl border bg-card shadow-elevated">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-sm text-muted-foreground"
                        data-testid="text-hero-card-eyebrow"
                      >
                        Servis özeti
                      </p>
                      <p
                        className="mt-1 text-lg font-semibold tracking-tight"
                        style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                        data-testid="text-hero-card-title"
                      >
                        Sürücü · Kart · Güç elektroniği
                      </p>
                    </div>
                    <span
                      className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                      data-testid="badge-hero-card"
                    >
                      TR
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div
                      className="rounded-2xl border bg-background px-4 py-3"
                      data-testid="card-kpi-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Ortalama işlem</span>
                        <span className="text-sm font-semibold">24–72 saat</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Parça durumuna göre değişir.
                      </div>
                    </div>

                    <div
                      className="rounded-2xl border bg-background px-4 py-3"
                      data-testid="card-kpi-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Test</span>
                        <span className="text-sm font-semibold">Yük altında</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Stabilite kontrolü yapılır.
                      </div>
                    </div>

                    <div
                      className="rounded-2xl border bg-background px-4 py-3"
                      data-testid="card-kpi-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Raporlama</span>
                        <span className="text-sm font-semibold">Şeffaf</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Yapılan işlemler net paylaşılır.
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {["Inverter", "Servo", "SMPS"].map((k) => (
                      <div
                        key={k}
                        className="rounded-2xl border bg-background px-3 py-2 text-center text-xs text-muted-foreground"
                        data-testid={`chip-${k}`}
                      >
                        {k}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground" data-testid="text-hero-card-note">
                      Cihaz bilgisi ile hızlı fiyat/termin.
                    </p>
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => scrollToId("contact")}
                      data-testid="button-hero-card-action"
                    >
                      Teklif al
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        <section
          id="services"
          className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-16"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground" data-testid="text-services-eyebrow">
                Neler yapıyoruz
              </p>
              <h2
                className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl"
                style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                data-testid="text-services-title"
              >
                Hizmetler
              </h2>
            </div>
            <Badge
              variant="secondary"
              className="rounded-full"
              data-testid="badge-services"
            >
              Endüstriyel odak
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {SERVICES.map((s) => (
              <Card
                key={s.title}
                className="group relative overflow-hidden rounded-3xl border bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-elevated hover:border-primary/50 charge-up impulse-shock energy-sweep thunder-border"
                data-testid={`card-service-${s.title}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-11 w-11 place-items-center rounded-2xl border bg-background"
                    data-testid={`icon-service-${s.title}`}
                  >
                    <s.icon
                      className="h-5 w-5"
                      style={{ color: "hsl(var(--primary))" }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p
                      className="text-base font-semibold tracking-tight"
                      style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                      data-testid={`text-service-title-${s.title}`}
                    >
                      {s.title}
                    </p>
                    <p
                      className="mt-1 text-sm text-muted-foreground"
                      data-testid={`text-service-desc-${s.title}`}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="process"
          className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-16"
        >
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-start">
            <div>
              <p className="text-sm text-muted-foreground" data-testid="text-process-eyebrow">
                Nasıl çalışıyoruz
              </p>
              <h2
                className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl"
                style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                data-testid="text-process-title"
              >
                Süreç
              </h2>
              <p
                className="mt-3 max-w-prose text-sm text-muted-foreground"
                data-testid="text-process-subtitle"
              >
                Cihaz geldiğinde önce arızayı doğruluyor, ardından onarım ve yük altında
                test ile güvenli teslim ediyoruz.
              </p>
            </div>

            <div className="grid gap-3">
              {STEPS.map((st) => (
                <Card
                  key={st.title}
                  className="rounded-3xl border bg-card p-5 shadow-soft"
                  data-testid={`card-step-${st.title}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="relative mt-0.5 rounded-2xl border bg-background p-2 text-primary overflow-hidden"
                      data-testid={`icon-step-${st.title}`}
                    >
                      {st.title === "Arıza Tespiti" ? (
                        <div className="relative h-5 w-5 flex items-center justify-center">
                          <Microscope className="h-4 w-4 relative z-10" />
                          <div className="absolute inset-[-4px] border border-primary/30 rounded-full animate-scan" />
                          <div className="absolute inset-[-8px] border border-primary/10 rounded-full animate-scan [animation-delay:0.5s]" />
                        </div>
                      ) : st.title === "Onarım + Parça İşçiligi" ? (
                        <div className="relative h-5 w-5 flex items-center justify-center">
                          <img 
                            src="/assets/soldering-iron.png" 
                            alt="Soldering Iron" 
                            className="h-5 w-5 object-contain brightness-0 invert" 
                            style={{ filter: 'invert(16%) sepia(89%) saturate(4854%) hue-rotate(224deg) brightness(96%) contrast(101%)' }}
                          />
                          <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-primary/20 animate-ping" />
                        </div>
                      ) : st.title === "Test + Teslim" ? (
                        <div className="relative h-5 w-5 flex items-center justify-center text-green-600">
                          <PackageCheck className="h-4 w-4 relative z-10" />
                        </div>
                      ) : (
                        st.icon && <st.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p
                        className="text-base font-semibold tracking-tight"
                        style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                        data-testid={`text-step-title-${st.title}`}
                      >
                        {st.title}
                      </p>
                      <p
                        className="mt-1 text-sm text-muted-foreground"
                        data-testid={`text-step-desc-${st.title}`}
                      >
                        {st.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6"
        >
          <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border bg-card p-6 shadow-elevated">
              <p className="text-sm text-muted-foreground" data-testid="text-contact-eyebrow">
                İletişim
              </p>
              <h2
                className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl"
                style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                data-testid="text-contact-title"
              >
                Teklif & arıza bildirimi
              </h2>
              <p
                className="mt-3 text-sm text-muted-foreground"
                data-testid="text-contact-subtitle"
              >
                Cihazın marka/modeli ve arıza belirtisini yazın; hızlıca dönüş yapalım.
              </p>

              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => e.preventDefault()}
                data-testid="form-contact"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="sr-only" htmlFor="name">
                      Ad Soyad
                    </label>
                    <Input
                      id="name"
                      placeholder="Ad Soyad"
                      className="h-11 rounded-2xl"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="phone">
                      Telefon
                    </label>
                    <Input
                      id="phone"
                      placeholder="Telefon"
                      className="h-11 rounded-2xl"
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="sr-only" htmlFor="email">
                    E-posta
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-posta"
                    className="h-11 rounded-2xl"
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="message">
                    Mesaj
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Cihaz marka/model, arıza belirtisi, varsa hata kodu..."
                    className="min-h-[120px] rounded-2xl"
                    data-testid="input-message"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-2xl"
                  data-testid="button-submit"
                >
                  Gönder
                </Button>

                <p className="text-xs text-muted-foreground" data-testid="text-contact-note">
                  Not: Bu prototipte form gönderimi demo amaçlıdır.
                </p>
              </form>
            </Card>

            <div className="grid gap-4">
              <Card className="rounded-3xl border bg-card p-6 shadow-soft">
                <p
                  className="text-sm font-semibold tracking-tight"
                  style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                  data-testid="text-contact-direct-title"
                >
                  Doğrudan iletişim
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  <div
                    className="flex items-start gap-3 rounded-2xl border bg-background px-4 py-3"
                    data-testid="row-contact-phone"
                  >
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefon</p>
                      <p className="font-medium" data-testid="text-phone">
                        +90 (5xx) xxx xx xx
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start gap-3 rounded-2xl border bg-background px-4 py-3"
                    data-testid="row-contact-mail"
                  >
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-muted-foreground">E-posta</p>
                      <p className="font-medium" data-testid="text-email">
                        info@inductra.com
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start gap-3 rounded-2xl border bg-background px-4 py-3"
                    data-testid="row-contact-location"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-muted-foreground">Lokasyon</p>
                      <p className="font-medium" data-testid="text-location">
                        İstanbul / Türkiye
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border bg-background p-4">
                  <p className="text-xs text-muted-foreground" data-testid="text-contact-hint">
                    Cihaz üzerinde yazan etiket fotoğrafı ve hata kodu, teşhisi hızlandırır.
                  </p>
                </div>
              </Card>

              <Card className="rounded-3xl border bg-card p-6 shadow-soft">
                <p
                  className="text-sm font-semibold tracking-tight"
                  style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                  data-testid="text-guarantee-title"
                >
                  Prensiplerimiz
                </p>

                <div className="mt-4 grid gap-3">
                  {["Güvenilir parça & işçilik", "Net termin & maliyet", "Test ile teslim"].map(
                    (t, idx) => (
                      <div
                        key={t}
                        className="flex items-center gap-2 rounded-2xl border bg-background px-4 py-3 text-sm"
                        data-testid={`row-principle-${idx}`}
                      >
                        <CheckCircle2
                          className="h-4 w-4"
                          style={{ color: "hsl(var(--primary))" }}
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground">{t}</span>
                      </div>
                    ),
                  )}
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p data-testid="text-footer-left">
            © {new Date().getFullYear()} Inductra Electronik
          </p>
          <p data-testid="text-footer-right">Elektronik sürücü tamiri · Endüstriyel servis</p>
        </div>
      </footer>
    </div>
  );
}
