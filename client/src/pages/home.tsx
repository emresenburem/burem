import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import BuremFooter from "@/components/ui/footer";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { motion, useReducedMotion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useLocation } from "wouter";
import { SparklesCore } from "@/components/ui/sparkles-core";
import { HeaderLogo } from "@/components/header-logo";
import { SparkleButton } from "@/components/ui/sparkle-button";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
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
  CircuitBoard,
  Waves,
  PenLine,
  PackageCheck,
  Package,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Cpu,
  Settings,
  Eye,
  FileSearch,
  Truck,
  ScanLine,
  Menu,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/interactive-empty-state";
import { ShowcaseList } from "@/components/ui/project-showcase";
import { ImageAccordion } from "@/components/ui/interactive-image-accordion";
import { InteractiveMenu } from "@/components/ui/modern-mobile-menu";
import { ProductCarousel } from "@/components/ui/product-carousel";

const BRANDS = [
  { name: "Baumüller", color: "#009999", logo: "https://images.seeklogo.com/logo-png/1/1/baumuller-logo-png_seeklogo-17176.png", scale: 2.1 },
  { name: "Siemens", color: "#009999", logo: "https://www.logo.wine/a/logo/Siemens/Siemens-Logo.wine.svg", scale: 1.4 },
  { name: "ABB", color: "#FF0000", logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg", scale: 0.5 },
  { name: "Schneider", color: "#3dcd58", logo: "https://www.logo.wine/a/logo/Schneider_Electric/Schneider_Electric-Logo.wine.svg", scale: 1.4 },
  { name: "Fanuc", color: "#FFD700", logo: "https://www.logo.wine/a/logo/FANUC/FANUC-Logo.wine.svg", scale: 1.4 },
  { name: "Yaskawa", color: "#004098", logo: "https://www.logo.wine/a/logo/Yaskawa_Electric_Corporation/Yaskawa_Electric_Corporation-Logo.wine.svg", scale: 1.4 },
  { name: "Omron", color: "#005EB8", logo: "https://www.logo.wine/a/logo/Omron/Omron-Logo.wine.svg", scale: 1.4 },
  { name: "Lenze", color: "#0046AD", logo: "https://findlogovector.com/wp-content/uploads/2019/04/lenze-logo-vector.png" },
  { name: "Mitsubishi", color: "#E60012", logo: "https://www.logo.wine/a/logo/Mitsubishi/Mitsubishi-Logo.wine.svg" },
  { name: "Danfoss", color: "#E2000F", logo: "https://findlogovector.com/wp-content/uploads/2018/09/danfoss-logo-vector.png", scale: 1.4 },
  { name: "Delta", color: "#003A8C", logo: "https://seekvectorlogo.net/wp-content/uploads/2019/04/delta-electronics-vector-logo.png", scale: 1.4 },
  { name: "Beckhoff", color: "#E30613", logo: "https://cdn.worldvectorlogo.com/logos/beckhoff-logo.svg" },
  { name: "Allen Bradley", color: "#000000", logo: "https://seekvectorlogo.net/wp-content/uploads/2019/02/allen-bradley-vector-logo.png", scale: 1.6 },
  { name: "Fuji", color: "#E60012", logo: "https://www.logo.wine/a/logo/Fuji_Electric/Fuji_Electric-Logo.wine.svg" },
  { name: "HAAS", color: "#E60012", logo: "https://images.seeklogo.com/logo-png/32/1/haas-logo-png_seeklogo-321914.png" },
  { name: "SEW", color: "#003366", logo: "https://images.seeklogo.com/logo-png/23/1/sew-eurodrive-logo-png_seeklogo-236154.png", scale: 1.4 },
  { name: "MAZAK", color: "#E60012", logo: "https://images.seeklogo.com/logo-png/32/1/mazak-logo-png_seeklogo-321946.png", scale: 1.4 },
  { name: "Rexroth", color: "#003366", logo: "https://www.logo.wine/a/logo/Bosch_Rexroth/Bosch_Rexroth-Logo.wine.svg", scale: 1.4 },
  { name: "Panasonic", color: "#003087", logo: "https://cdn.simpleicons.org/panasonic/003087", scale: 2.2 },
  { name: "B&R", color: "#003366", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/B%26R_Logo_Tagline_below_RGB_HD.jpg", scale: 0.65 },
  { name: "Control Techniques", color: "#00A04B", logo: "https://cdn.worldvectorlogo.com/logos/control-techniques.svg", scale: 2.2 },
  { name: "KEB", color: "#E30613", logo: "https://www.keb-automation.com/_assets/d036344bd34e87e82af8c79946af49f4/Images/logo.svg", scale: 0.65 },
  { name: "Mecasonic", color: "#003366", logo: new URL("../assets/logos/mecasonic.png", import.meta.url).href, w: 110 },
  { name: "FIDA", color: "#D81F26", logo: "/fida-logo.png" },
];

function BrandCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % BRANDS.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const visibleBrands = BRANDS.map((brand, index) => {
    let offset = index - activeIndex;
    if (offset > BRANDS.length / 2) offset -= BRANDS.length;
    if (offset < -BRANDS.length / 2) offset += BRANDS.length;
    return { brand, index, offset };
  }).filter(({ offset }) => Math.abs(offset) <= 3);

  return (
    <div
      className="relative w-full overflow-hidden border-y border-border/30 py-5 md:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="brand-carousel"
    >
      <div className="relative mx-auto h-16 w-full max-w-6xl [perspective:900px]">
        {visibleBrands.map(({ brand, index, offset }) => {
          const isFeatured = offset === 0;
          const distance = Math.abs(offset);

          return (
            <div key={brand.name} className="absolute left-1/2 top-1/2">
              <motion.div
                className="absolute"
                animate={{
                  x: offset * 126,
                  y: isFeatured ? -2 : distance * 2,
                  scale: isFeatured ? 1.16 : 0.92 - distance * 0.06,
                  opacity: isFeatured ? 1 : 0.48 - distance * 0.08,
                  rotateY: offset * -18,
                  filter: isFeatured ? "drop-shadow(0 8px 12px rgba(15, 23, 42, 0.18))" : "none",
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 22,
                  mass: 0.8,
                }}
                style={{
                  zIndex: 10 - distance,
                  transformStyle: "preserve-3d",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  title={brand.name}
                  aria-label={`${brand.name} logosunu öne çıkar`}
                  className={`flex h-12 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl px-3 transition-colors md:h-14 md:w-36 ${
                    isFeatured
                      ? "border border-border/60 bg-background/90 shadow-sm"
                      : "border border-transparent bg-background/30"
                  }`}
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-full w-full object-contain"
                    style={(brand as any).scale ? { transform: `scale(${(brand as any).scale})` } : undefined}
                  />
                </button>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



function SlideNav({ items }: { items: { label: string; onClick: () => void }[] }) {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      className="relative flex w-fit rounded-full border-2 border-foreground/30 bg-background p-1"
      onMouseLeave={() => setPosition((p) => ({ ...p, opacity: 0 }))}
    >
      {items.map((item) => (
        <SlideNavTab key={item.label} setPosition={setPosition} onClick={item.onClick}>
          {item.label}
        </SlideNavTab>
      ))}
      <motion.li
        animate={position}
        className="absolute z-0 h-7 rounded-full bg-foreground md:h-9"
      />
    </ul>
  );
}

function SlideNavTab({
  children,
  setPosition,
  onClick,
}: {
  children: React.ReactNode;
  setPosition: React.Dispatch<React.SetStateAction<{ left: number; width: number; opacity: number }>>;
  onClick: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-4 md:py-2 md:text-sm font-semibold"
    >
      {children}
    </li>
  );
}


import { Button } from "@/components/ui/button";
import { FaultReportWizard } from "@/components/fault-report-wizard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function ContactForm() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value?.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value?.trim();

    if (!name || !email || !message) {
      setFormState("error");
      setErrorMsg("Lütfen ad, e-posta ve mesaj alanlarını doldurun.");
      return;
    }

    setFormState("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Mesaj gönderilemedi");
      }

      setFormState("sent");
      form.reset();
    } catch (err: any) {
      setFormState("error");
      setErrorMsg(err.message || "Bir hata oluştu");
    }
  };

  if (formState === "sent") {
    return (
      <div className="mt-5 flex flex-col items-center gap-3 py-8 text-center" data-testid="contact-success">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold">Mesajınız gönderildi!</p>
        <p className="text-sm text-muted-foreground">En kısa sürede size dönüş yapacağız.</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => setFormState("idle")}
          data-testid="button-new-message"
        >
          Yeni Mesaj
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="mt-5 space-y-3"
      onSubmit={handleSubmit}
      data-testid="form-contact"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="sr-only" htmlFor="name">Ad Soyad</label>
          <Input id="name" placeholder="Ad Soyad" className="h-11 rounded-2xl" data-testid="input-name" required />
        </div>
        <div>
          <label className="sr-only" htmlFor="phone">Telefon</label>
          <Input id="phone" placeholder="Telefon" className="h-11 rounded-2xl" data-testid="input-phone" />
        </div>
      </div>
      <div>
        <label className="sr-only" htmlFor="email">E-posta</label>
        <Input id="email" type="email" placeholder="E-posta" className="h-11 rounded-2xl" data-testid="input-email" required />
      </div>
      <div>
        <label className="sr-only" htmlFor="message">Mesaj</label>
        <Textarea id="message" placeholder="Cihaz marka/model, arıza belirtisi, varsa hata kodu..." className="min-h-[120px] rounded-2xl" data-testid="input-message" required />
      </div>
      <SparkleButton type="submit" className="h-11 w-full" disabled={formState === "sending"} data-testid="button-submit">
        {formState === "sending" ? "Gönderiliyor..." : "Gönder"}
      </SparkleButton>
      {formState === "error" && errorMsg && (
        <p className="text-sm text-red-500" data-testid="text-contact-error">{errorMsg}</p>
      )}
    </form>
  );
}

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
  {
    title: "PLC Tamiri",
    desc: "Programlanabilir lojik kontrolörler. Siemens, Mitsubishi, Omron ve diğer markalar.",
    icon: CircuitBoard,
  },
  {
    title: "Ultrasonik Kaynak Tamiri",
    desc: "Ultrasonik kaynak makinası elektroniği, transdüser ve generatör onarımı.",
    icon: Waves,
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
];


function ProcessStepsGrid() {
  return (
    <div className="grid grid-cols-2 gap-8 relative auto-rows-fr">
      {STEPS.map((st, index) => (
            <motion.div
              key={st.title}
              className="relative"
              initial={{ opacity: 0, y: 48, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.10,
              }}
              style={{ willChange: "transform, opacity" }}
            
          
        >
          <Card
            className="step-card-border rounded-3xl border bg-card p-5 h-full shadow-soft relative overflow-visible transition-all duration-300"
            data-testid={`card-step-${st.title}`}
          >
            <div className="flex items-start gap-4 relative z-10">
              <div
                className="relative mt-0.5 h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl border bg-background text-primary overflow-hidden"
              >
                {st.title === "Arıza Tespiti" ? (
                  <div className="relative h-7 w-7 flex items-center justify-center">
                    <Microscope className="h-4 w-4 relative z-10" />
                    <div className="absolute inset-[-4px] border border-primary/30 rounded-full animate-scan" />
                    <div className="absolute inset-[-8px] border border-primary/10 rounded-full animate-scan [animation-delay:0.5s]" />
                  </div>
                ) : st.title === "Onarım + Parça İşçiligi" ? (
                  <div className="relative h-7 w-7 flex items-center justify-center">
                    <img
                      src="/assets/soldering-iron.png"
                      alt="Soldering Iron"
                      className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(10,17,34,0.3)]"
                      style={{
                        filter:
                          "invert(16%) sepia(89%) saturate(4854%) hue-rotate(224deg) brightness(96%) contrast(101%) contrast(1.2) brightness(1.1)",
                      }}
                    />
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
                >
                  {st.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{st.desc}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}


const SERVICE_CARDS = [
  {
    id: 1,
    title: "Sürücü Tamiri",
    description: "AC/DC sürücüler, inverterler, servo sürücüler. Arıza tespiti, onarım ve yük altında test.",
    image: "/services/drive.png",
  },
  {
    id: 2,
    title: "Endüstriyel Elektronik",
    description: "Güç kartları, kontrol kartları, SMPS ve CNC/PLC çevre ekipmanları onarımı.",
    image: "/services/pcb.jpg",
  },
  {
    id: 3,
    title: "Hızlı Arıza Tespiti",
    description: "Ön değerlendirme ve net raporlama. Gereksiz parça değişimi yok.",
    image: "/services/diagnostic.jpg",
  },
  {
    id: 4,
    title: "PLC Tamiri",
    description: "Programlanabilir lojik kontrolörler. Siemens, Mitsubishi, Omron ve diğer markalar.",
    image: "/services/plc.jpg",
  },
  {
    id: 5,
    title: "Ultrasonik Kaynak Tamiri",
    description: "Ultrasonik kaynak makinası elektroniği, transdüser ve generatör onarımı.",
    image: "/services/ultrasonic.jpg",
  },
];

function AnimatedServicesSection() {
  return (
    <section
      id="services"
      className="w-full pb-10 md:pb-20 scroll-mt-24"
      data-testid="section-services"
    >
      <div className="relative w-full overflow-hidden">
        <InfiniteSlider duration={40} durationOnHover={80} gap={20} className="py-2">
          {SERVICE_CARDS.map((card) => (
            <div
              key={card.id}
              data-testid={`card-service-${card.id}`}
              className="relative flex-shrink-0 w-[320px] md:w-[400px] h-[480px] rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
                  {card.title}
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </section>
  );
}

function AnimatedProcessSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((p) => (p + 1) % STEPS.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="process"
      className="w-full pb-14 md:pb-24 scroll-mt-24"
      data-testid="section-process"
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6 flex flex-col items-center text-center gap-4 mb-14">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground" data-testid="text-process-eyebrow">
          Nasıl çalışıyoruz
        </p>
        <h2
          className="text-4xl md:text-6xl font-bold tracking-tight leading-tight"
          style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
          data-testid="text-process-title"
        >
          Adım adım
          <span
            className="relative block overflow-hidden"
            style={{ height: "1.25em" }}
          >
            {STEPS.map((step, i) => (
              <motion.span
                key={i}
                className="absolute inset-x-0 text-primary font-bold"
                initial={{ opacity: 0, y: 80 }}
                animate={
                  current === i
                    ? { y: 0, opacity: 1 }
                    : { y: current > i ? -80 : 80, opacity: 0 }
                }
                transition={{ type: "spring", stiffness: 55, damping: 14 }}
              >
                {step.title}
              </motion.span>
            ))}
          </span>
        </h2>

        <div className="relative h-10 overflow-hidden w-full max-w-lg">
          {STEPS.map((step, i) => (
            <motion.p
              key={i}
              className="absolute inset-x-0 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 24 }}
              animate={
                current === i
                  ? { y: 0, opacity: 1 }
                  : { y: current > i ? -24 : 24, opacity: 0 }
              }
              transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.05 }}
              data-testid={`text-process-step-desc-${i}`}
            >
              {step.desc}
            </motion.p>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
              data-testid={`dot-process-${i}`}
              aria-label={`Adım ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6">
      <ImageAccordion
        defaultActive={0}
        items={[
          {
            id: 1,
            title: "Ön İnceleme",
            description: "Arıza belirtisi ve model bilgisiyle hızlı değerlendirme başlatılır.",
            icon: <ClipboardList strokeWidth={1.2} />,
            particleColor: "#94a3b8",
            gradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            image: "/services/step-inspection.jpg",
          },
          {
            id: 2,
            title: "Arıza Tespiti",
            description: "Komponent düzeyinde detaylı teknik arıza analizi yapılır.",
            icon: <ScanLine strokeWidth={1.2} />,
            particleColor: "#94a3b8",
            gradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            image: "/services/step-diagnostic.jpg",
          },
          {
            id: 3,
            title: "Onarım + Parça",
            description: "Ölçüm, izolasyon kontrolü, komponent değişimi ve temiz işçilik.",
            icon: <Wrench strokeWidth={1.2} />,
            particleColor: "#94a3b8",
            gradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            image: "/services/step-repair.webp",
          },
        ]}
      />
      </div>
    </section>
  );
}

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
  const header = document.querySelector("header");
  const offset = header ? header.getBoundingClientRect().height : 80;
  const top = el.getBoundingClientRect().top + window.scrollY - offset - 16;
  window.scrollTo({ top, behavior: "smooth" });
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
      <SparkleButton className={className} onClick={handleClick} {...props}>
        {children}
      </SparkleButton>
    </motion.div>
  );
}

const WC = "https://upload.wikimedia.org/wikipedia/commons/";
const REFERENCES = [
  { name: "Bursa CNC",      logo: "https://www.bursacncmakina.com/images/29239-logo17.png" },
  { name: "Fisteks",        logo: "https://fisteks.com.tr/images/logo.png" },
  { name: "Kırayteks",      logo: "https://kirayteks.com/wp-content/uploads/2021/05/logo-3.svg" },
  { name: "Batmaz Tekstil", logo: "https://www.batmaztekstil.com.tr/wp-content/uploads/2025/03/batmaz-menu.png", invert: true },
  { name: "Beztaş",         logo: new URL("../assets/logos/beztas.png", import.meta.url).href },
  { name: "Sarı Ankolaj",   logo: "/api/img-proxy?url=" + encodeURIComponent("http://www.sariankolaj.com/wp-content/uploads/2014/07/sari_ankolaj_logo1-300x54.png") },
  { name: "Ermetal",        logo: "https://www.ermetal.com.tr/uploads/gnl/ermetal_logo_beyaz_195_40.png", invert: true },
  { name: "Derhan Tekstil", logo: "/api/img-proxy?url=" + encodeURIComponent("http://derhantekstil.com/wp-content/uploads/2022/02/derhan-logo-golge-small.png") },
  { name: "Birel Tekstil",  logo: "https://static.ticimax.cloud/48912/customcss/ticimax/images/logo.png" },
  { name: "Feka Otomotiv",  logo: "https://fekaautomotive.com/images/feka-logo.png" },
  { name: "Erkalıp",        logo: "https://www.erkalip.com.tr/images/logos/erkalip_logo_renkli.jpg" },
];

function RefCard({ company }: { company: typeof REFERENCES[0] }) {
  const [imgError, setImgError] = useState(false);
  const inv = (company as any).invert;
  const bg = (company as any).bgImg;
  return (
    <div className="flex-shrink-0 flex items-center justify-center rounded-2xl border bg-card px-7 h-[80px] w-[180px] shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-default group">
      {bg ? (
        <div
          className={`w-full h-10 bg-contain bg-center bg-no-repeat opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${inv ? "invert" : ""}`}
          style={{ backgroundImage: `url(${company.logo})` }}
        />
      ) : !imgError ? (
        <img
          src={company.logo}
          alt={company.name}
          className={`w-full h-10 object-contain object-center opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${inv ? "invert" : ""}`}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-xs font-bold tracking-wide text-muted-foreground">{company.name}</span>
      )}
    </div>
  );
}

function DockBrandSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const mx = e.clientX;
    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll<HTMLElement>(".dock-logo");
      const RANGE = 110;
      const MAX_SCALE = 4.5;
      const MID_SCALE = 2.6;
      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const dist = Math.abs(mx - cx);
        let scale = 1;
        if (dist < RANGE) {
          const t = 1 - dist / RANGE;
          scale = 1 + (MAX_SCALE - 1) * Math.pow(t, 1.6);
        } else if (dist < RANGE * 2) {
          const t = 1 - (dist - RANGE) / RANGE;
          scale = 1 + (MID_SCALE - 1) * Math.pow(t, 2);
        }
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.opacity = dist < RANGE * 2 ? "1" : "0.7";
      });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll<HTMLElement>(".dock-logo");
    items.forEach((el) => {
      el.style.transform = "scale(1)";
      el.style.opacity = "0.7";
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full pt-10 pb-10"
      style={{ overflow: "visible" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-14 w-full" style={{ overflow: "visible" }}>
        <InfiniteSlider
          className="flex h-full w-full items-center !overflow-visible"
          duration={35}
          gap={48}
        >
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="dock-logo flex items-center justify-center h-10 flex-shrink-0 opacity-70"
              style={{
                width: (brand as any).w ? `${(brand as any).w}px` : "7rem",
                transition: "transform 0.15s cubic-bezier(0.34,1.4,0.64,1), opacity 0.15s ease",
                transformOrigin: "center bottom",
                willChange: "transform",
              }}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-contain pointer-events-none"
                style={(brand as any).scale && !(brand as any).w ? { transform: `scale(${(brand as any).scale})` } : undefined}
              />
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </div>
  );
}

function ReferencesSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const halfRef = useRef(0);
  const draggingRef = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);
  const rafRef = useRef<number>();
  const SPEED = 1.1;

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) halfRef.current = trackRef.current.scrollWidth / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const tick = () => {
      if (!draggingRef.current && trackRef.current) {
        posRef.current -= SPEED;
        if (halfRef.current > 0 && Math.abs(posRef.current) >= halfRef.current)
          posRef.current += halfRef.current;
        trackRef.current.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, []);

  const startDrag = (clientX: number) => {
    draggingRef.current = true;
    setGrabbing(true);
    dragStartX.current = clientX;
    dragStartPos.current = posRef.current;
  };

  const moveDrag = (clientX: number) => {
    if (!draggingRef.current || !trackRef.current) return;
    let newPos = dragStartPos.current + (clientX - dragStartX.current);
    const half = halfRef.current;
    if (half > 0) {
      while (newPos > 0) newPos -= half;
      while (newPos < -half) newPos += half;
    }
    posRef.current = newPos;
    trackRef.current.style.transform = `translateX(${newPos}px)`;
  };

  const endDrag = () => { draggingRef.current = false; setGrabbing(false); };

  return (
    <section className="w-full py-16 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 md:px-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Referanslarımız
            </p>
            <h2
              className="text-2xl md:text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
            >
              Güvendikleri için teşekkür ederiz.
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs text-right hidden sm:block">
            Türkiye'nin önde gelen sanayi kuruluşlarına servis veriyoruz.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div
          className="py-2 select-none overflow-hidden"
          style={{ cursor: grabbing ? "grabbing" : "grab" }}
          onMouseDown={(e) => startDrag(e.clientX)}
          onMouseMove={(e) => moveDrag(e.clientX)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => startDrag(e.touches[0].clientX)}
          onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
          onTouchEnd={endDrag}
        >
          <div ref={trackRef} className="flex w-max" style={{ gap: "14px" }}>
            {REFERENCES.map((item) => <RefCard key={item.name + "_a"} company={item} />)}
            {REFERENCES.map((item) => <RefCard key={item.name + "_b"} company={item} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductsShowcase() {
  const [, setLocation] = useLocation();
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <section id="products" className="mx-auto w-full max-w-6xl px-4 md:px-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-6 px-4">
          <Package className="h-6 w-6 text-primary" />
          <div className="h-7 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-4 px-4 pb-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-48 flex-shrink-0 rounded-xl border bg-card p-4 animate-pulse">
              <div className="h-32 bg-muted rounded-lg mb-4" />
              <div className="h-3 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="mx-auto w-full max-w-6xl md:px-2 scroll-mt-24" data-testid="products-showcase">
      <ProductCarousel
        title="Yedek Parça Mağazası"
        products={products}
        emptyMessage="Yakında burada ürünlerimizi görebileceksiniz."
        onProductClick={(p) => setLocation(`/brand/${encodeURIComponent(p.brand)}`)}
      />
    </section>
  );
}

function BrandsDropdown() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative self-end -mb-px"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-testid="nav-item-brands"
    >
      {/* Tetikleyici buton */}
      <button
        className={`relative overflow-hidden flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors before:absolute before:inset-0 before:-translate-x-full before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent hover:before:translate-x-full before:transition-transform before:duration-500 before:ease-in-out ${
          open
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Markalar
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>
      
      {/* Dropdown paneli */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="brands-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.97, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
            className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-50"
            style={{ transformOrigin: "top center" }}
          >
            {/* Ok işareti */}
            <div className="flex justify-center mb-[-1px]">
              <div className="w-3 h-3 rotate-45 border-l border-t border-border bg-card" />
            </div>

            <div className="w-[860px] rounded-2xl border bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden">

              <div className="p-6">
                {/* Başlık */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    
                  </p>
                  <span className="text-[10px] text-muted-foreground/60">{BRANDS.length} marka</span>
                </div>

                {/* Logo grid — 5 kolon, büyük kartlar */}
                <div className="grid grid-cols-5 gap-3">
                  {BRANDS.map((brand, i) => (
                    <motion.button
                      key={brand.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.022, type: "spring", stiffness: 400, damping: 28 }}
                      onClick={() => { setLocation(`/brand/${encodeURIComponent(brand.name)}`); setOpen(false); }}
                      title={brand.name}
                      data-testid={`brand-dropdown-${brand.name}`}
                      className="flex items-center justify-center rounded-xl border border-transparent bg-muted/30 p-4 h-[90px] hover:border-primary/30 hover:bg-background hover:shadow-md transition-all duration-200"
                      whileHover={{ scale: 1.07, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                        style={brand.scale ? { transform: `scale(${brand.scale})` } : undefined}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                          const fb = img.nextElementSibling as HTMLElement | null;
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                      <span className="hidden items-center justify-center text-[9px] font-bold" style={{ color: brand.color }}>
                        {brand.name}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Alt not */}
                <div className="mt-4 flex items-center justify-center gap-2 border-t pt-3">
                  <span className="text-[20px] text-muted-foreground">
                    Listemizde olmayan markalar için —
                  </span>
                  <button
                    onClick={() => { scrollToId("contact"); setOpen(false); }}
                    className="text-[20px] font-semibold text-primary hover:underline"
                  >
                    bize danışın →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocalBusinessJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Burem Elektronik",
    "telephone": "+90-532-266-47-64",
    "email": "info@buremelektronik.com",
    "url": "https://www.buremelektronik.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Alaaddinbey Mah. 626. Sk. No:22 SAM 1 Plaza İç Kapı No:B14",
      "addressLocality": "Nilüfer",
      "addressRegion": "Bursa",
      "addressCountry": "TR"
    },
    "description": "Bursa'da inverter, servo sürücü, PLC, HMI ve endüstriyel elektronik kart tamiri.",
    "areaServed": "Bursa",
    "sameAs": ["https://www.instagram.com/buremelektronik"]
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function HomePage() {
  const preferReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
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
    <>
    {/* Açılış beyaz flaş */}
    <motion.div
      className="fixed inset-0 z-[999] bg-white pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    />
    <motion.div 
        className="min-h-screen bg-background text-foreground" 
        onClick={handleGlobalClick}
        initial={isMobile ? { opacity: 0 } : { opacity: 0, filter: "blur(12px)" }}
        animate={isMobile ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: isMobile ? 0.4 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={isMobile ? undefined : { willChange: "opacity, filter" }}
      >
      <LocalBusinessJsonLd />
      {!isMobile && <InteractiveGradient />}
      {/* Arka plan partikülleri — mobilde atlanır */}
      {!isMobile && (
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <SparklesCore
            background="transparent"
            particleColor="#1e293b"
            particleDensity={10}
            minSize={0.4}
            maxSize={1.0}
            speed={0.4}
            className="h-full w-full"
          />
        </div>
      )}

      <a
        href="#contact"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow-soft"
        data-testid="link-skip-contact"
      >
        İletişime geçe atla
      </a>

      {/* Arka plan InteractiveGradient içinde yönetiliyor */}
      
      <header className="relative sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        {/* Atatürk şeridi — tam ortada üstte, absolute */}
        <div
          className="hidden lg:flex absolute top-1.5 left-1/2 -translate-x-1/2 items-center gap-2 group cursor-default"
          style={{ zIndex: 50 }}
        >
          <motion.span
            className="w-8 h-px bg-foreground/60 flex-shrink-0 block"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.p
            className="text-[11px] text-foreground italic tracking-widest font-medium whitespace-nowrap flex"
            aria-label="Hayatta en hakiki mürşit ilimdir."
          >
            {"Hayatta en hakiki mürşit ilimdir.".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.4 + i * 0.028, ease: [0.22, 1, 0.36, 1] }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.p>
          <motion.img
            src="https://upload.wikimedia.org/wikipedia/commons/4/46/Signature_of_Mustafa_Kemal_Atat%C3%BCrk.svg"
            alt="Mustafa Kemal Atatürk imzası"
            className="h-6"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + 34 * 0.028, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="w-8 h-px bg-foreground/60 flex-shrink-0 block"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 0.5, delay: 0.4 + 34 * 0.028 + 0.15, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Silüet — soldan fade-in, bir süre durur, sonra kaybolur */}
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none flex justify-center"
            initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
            animate={{
              clipPath: [
                "inset(0 100% 0 0)",
                "inset(0 0% 0 0)",
                "inset(0 0% 0 0)",
                "inset(0 0% 100% 0)",
              ],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 9,
              delay: 0.4 + 34 * 0.028 + 0.2,
              times: [0, 0.38, 0.82, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <img
              src="https://www.artepera.com/cdn/shop/files/APT828-Ataturk-Metal-Duvar-Tablosu_1.jpg?v=1751374066&width=1080"
              alt="Atatürk silüeti"
              className="h-16 w-auto object-contain drop-shadow-md"
              style={{ filter: "grayscale(1) contrast(1.15)" }}
            />
          </motion.div>
        </div>

        <div className="relative flex w-full items-center justify-between gap-3 px-4 md:px-6">
          {/* Logo — sol */}
          <div className="-ml-25 -mt-12 mb-[-2.5rem] flex-shrink-0">
            <HeaderLogo />
          </div>

          {/* Nav — sayfada ortalı, alt kenara yaslanmış */}
          <nav
            aria-label="Ana menü"
            className="hidden md:flex absolute bottom-0 left-1/2 -translate-x-1/2 gap-0"
          >
            {[
              { label: "Hizmetler", id: "services" },
              { label: "Süreç",     id: "process"  },
              { label: "İletişim",  id: "contact"  },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToId(item.id)}
                data-testid={`nav-item-${item.id}`}
                className="relative overflow-hidden px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors before:absolute before:inset-0 before:-translate-x-full before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent hover:before:translate-x-full before:transition-transform before:duration-500 before:ease-in-out"
              >
                {item.label}
              </button>
            ))}
            <a
              href="/magaza"
              data-testid="nav-item-magaza"
              className="relative overflow-hidden px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors before:absolute before:inset-0 before:-translate-x-full before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent hover:before:translate-x-full before:transition-transform before:duration-500 before:ease-in-out"
            >
              Mağaza
            </a>
            <a
              href="/takip"
              data-testid="nav-item-takip"
              className="relative overflow-hidden px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors before:absolute before:inset-0 before:-translate-x-full before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent hover:before:translate-x-full before:transition-transform before:duration-500 before:ease-in-out"
            >
              Servis Takip
            </a>
            <BrandsDropdown />
          </nav>

          {/* Mobil hamburger butonu */}
          <button
            className="md:hidden ml-auto flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* CTA butonları — sağ, shimmer hover */}
          <div className="hidden md:flex items-center gap-2 self-end pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToId("contact")}
              data-testid="button-cta-contact"
              className="relative overflow-hidden text-sm font-medium before:absolute before:inset-0 before:-translate-x-full before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent hover:before:translate-x-full before:transition-transform before:duration-600 before:ease-in-out"
            >
              İletişim
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Mobil menü drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden md:hidden border-t border-border/40"
              data-testid="mobile-menu-drawer"
            >
              <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobil menü">
                {[
                  { label: "Hizmetler", id: "services" },
                  { label: "Süreç",     id: "process"  },
                  { label: "İletişim",  id: "contact"  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { scrollToId(item.id); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                    data-testid={`mobile-nav-${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
                <a
                  href="/magaza"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  data-testid="mobile-nav-magaza"
                >
                  Mağaza
                </a>
                <a
                  href="/takip"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors font-semibold"
                  data-testid="mobile-nav-takip"
                >
                  Servis Takip
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Öne çıkan markalı 3D carousel */}
      <BrandCarousel />

      <main id="top">
        <AnimatedServicesSection />

        <ProductsShowcase />

        <ReferencesSlider />

        <section
          id="contact"
          className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6 scroll-mt-24"
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
                Arıza bildirimi
              </h2>
              <p
                className="mt-3 text-sm text-muted-foreground"
                data-testid="text-contact-subtitle"
              >
                Birkaç adımda arızanızı tanımlayın; WhatsApp üzerinden hemen iletişime geçelim.
              </p>

              <FaultReportWizard />
            </Card>

            <div className="h-full min-h-[520px]">
              <ImageAccordion
                direction="vertical"
                defaultActive={0}
                className="h-full"
                items={[
                  {
                    id: 1,
                    title: "Telefon",
                    description: "+90 (532) 266 47 64 — Hızlı yanıt için arayabilirsiniz.",
                    icon: <Phone strokeWidth={1.3} />,
                    particleColor: "#94a3b8",
                    gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                  },
                  {
                    id: 2,
                    title: "E-posta",
                    description: "info@buremelektronik.com — Teknik bilgi ve fiyat talebi için.",
                    icon: <Mail strokeWidth={1.3} />,
                    particleColor: "#94a3b8",
                    gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                  },
                  {
                    id: 3,
                    title: "Lokasyon",
                    description: "Bursa / Türkiye — Cihazınızı kargo veya elden teslim edebilirsiniz.",
                    icon: <MapPin strokeWidth={1.3} />,
                    particleColor: "#94a3b8",
                    gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                  },
                  {
                    id: 4,
                    title: "Güvenilir parça & işçilik",
                    description: "Yalnızca kaliteli parça kullanılır, işçilik titizlikle uygulanır.",
                    icon: <ShieldCheck strokeWidth={1.3} />,
                    particleColor: "#94a3b8",
                    gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                  },
                  {
                    id: 5,
                    title: "Detaylı arıza analizi",
                    description: "Komponent düzeyinde inceleme; gereksiz parça değişimi yapılmaz.",
                    icon: <ScanLine strokeWidth={1.3} />,
                    particleColor: "#94a3b8",
                    gradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                  },
                ]}
              />
            </div>
          </div>
        </section>
      </main>

      <BuremFooter />
      </motion.div>
    </>
  );
}
