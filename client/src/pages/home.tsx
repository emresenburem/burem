import { useEffect, useMemo, useState, useRef } from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { motion, useReducedMotion, AnimatePresence, useScroll, useMotionValueEvent, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  PenLine,
  PackageCheck,
  Package,
  ChevronRight,
  Cpu,
  Settings,
  Eye,
  FileSearch,
  Truck,
  ScanLine,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/interactive-empty-state";
import { ShowcaseList } from "@/components/ui/project-showcase";
import { ImageAccordion } from "@/components/ui/interactive-image-accordion";
import { InteractiveMenu } from "@/components/ui/modern-mobile-menu";
import { ProductCarousel } from "@/components/ui/product-carousel";

const BRANDS = [
  { name: "Baumüller", color: "#009999", logo: "https://images.seeklogo.com/logo-png/1/1/baumuller-logo-png_seeklogo-17176.png", scale: 2  },
  { name: "Siemens", color: "#009999", logo: "https://www.logo.wine/a/logo/Siemens/Siemens-Logo.wine.svg"  },
  { name: "ABB", color: "#FF0000", logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg", scale: 0.45 },
  { name: "Schneider", color: "#3dcd58", logo: "https://www.logo.wine/a/logo/Schneider_Electric/Schneider_Electric-Logo.wine.svg" },
  { name: "Fanuc", color: "#FFD700", logo: "https://www.logo.wine/a/logo/FANUC/FANUC-Logo.wine.svg" },
  { name: "Yaskawa", color: "#004098", logo: "https://www.logo.wine/a/logo/Yaskawa_Electric_Corporation/Yaskawa_Electric_Corporation-Logo.wine.svg" },
  { name: "Omron", color: "#005EB8", logo: "https://www.logo.wine/a/logo/Omron/Omron-Logo.wine.svg" },
  { name: "Lenze", color: "#0046AD", logo: "https://findlogovector.com/wp-content/uploads/2019/04/lenze-logo-vector.png" },
  { name: "Mitsubishi", color: "#E60012", logo: "https://www.logo.wine/a/logo/Mitsubishi/Mitsubishi-Logo.wine.svg" },
  { name: "Danfoss", color: "#E2000F", logo: "https://findlogovector.com/wp-content/uploads/2018/09/danfoss-logo-vector.png" },
  { name: "Delta", color: "#003A8C", logo: "https://seekvectorlogo.net/wp-content/uploads/2019/04/delta-electronics-vector-logo.png" },
  { name: "Beckhoff", color: "#E30613", logo: "https://cdn.worldvectorlogo.com/logos/beckhoff-logo.svg" },
  { name: "Allen Bradley", color: "#000000", logo: "https://seekvectorlogo.net/wp-content/uploads/2019/02/allen-bradley-vector-logo.png", scale: 1.5 },
  { name: "Fuji", color: "#E60012", logo: "https://www.logo.wine/a/logo/Fuji_Electric/Fuji_Electric-Logo.wine.svg" },
  { name: "HAAS", color: "#E60012", logo: "https://images.seeklogo.com/logo-png/32/1/haas-logo-png_seeklogo-321914.png" },
  { name: "SEW", color: "#003366", logo: "https://images.seeklogo.com/logo-png/23/1/sew-eurodrive-logo-png_seeklogo-236154.png" },
  { name: "MAZAK", color: "#E60012", logo: "https://images.seeklogo.com/logo-png/32/1/mazak-logo-png_seeklogo-321946.png" },
  { name: "Rexroth", color: "#003366", logo: "https://www.logo.wine/a/logo/Bosch_Rexroth/Bosch_Rexroth-Logo.wine.svg" },
  { name: "Panasonic", color: "#003366", logo: "https://w7.pngwing.com/pngs/432/765/png-transparent-logo-panasonic-phone-panasonic-service-center-panasonic-india-pvt-ltd-others-blue-text-innovation.png" },
  { name: "B&R", color: "#003366", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/B%26R_Logo_Tagline_below_RGB_HD.jpg" }
  
];

function BrandsPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [, setLocation] = useLocation();
  const [playTick] = useSound("/sounds/tick.mp3", { volume: 0.15, preload: true, interrupt: true });
  const lastOpenState = useRef(false);

  useEffect(() => {
    if (isOpen && !lastOpenState.current) playTick();
    lastOpenState.current = isOpen;
  }, [isOpen, playTick]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[98] bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-1/2 top-20 z-[99] w-[90vw] max-w-3xl -translate-x-1/2 rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-xl overflow-y-auto max-h-[75vh]"
            data-testid="popup-brands"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg tracking-tight">
                Tamir Ettiğimiz Markalar
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none" data-testid="button-brands-close">✕</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {BRANDS.map((brand) => (
                <motion.div
                  key={brand.name}
                  className="relative flex flex-col items-center justify-center rounded-xl border p-3 text-center bg-card shadow-sm cursor-pointer overflow-hidden group hover:border-primary/40 hover:shadow-md transition-all"
                  whileHover={{ scale: 1.08, zIndex: 50 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  onClick={() => { setLocation(`/brand/${encodeURIComponent(brand.name)}`); onClose(); }}
                  data-testid={`brand-item-${brand.name}`}
                >
                  <div className="h-10 w-full flex items-center justify-center p-1">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-full w-full object-contain"
                      style={brand.scale ? { transform: `scale(${brand.scale})` } : undefined}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="font-bold text-xs hidden" style={{ color: brand.color }}>{brand.name}</span>
                  </div>
                  <span className="mt-1 text-[10px] text-muted-foreground truncate w-full text-center">{brand.name}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-dashed p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Ve daha fazlası… Listemizde olmayan markalar için bize danışın.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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

function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/905322664764"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 transition-transform"
      data-testid="button-whatsapp"
    >
      <MessageCircle className="h-7 w-7 fill-white/" />
    </motion.a>
  );
}
import { Button } from "@/components/ui/button";
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

function InverterScrollVideo({ sectionRef }: { sectionRef: React.RefObject<HTMLElement> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const video = videoRef.current;
    if (!video || !readyRef.current) return;
    const dur = video.duration;
    if (!isFinite(dur) || dur === 0) return;
    video.currentTime = Math.min(p * dur, dur);
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const markReady = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      video.pause();
      video.currentTime = 0;
    };
    video.addEventListener("play", markReady, { once: true });
    video.addEventListener("canplay", markReady, { once: true });
    video.load();
    return () => {
      video.removeEventListener("play", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, []);

  return (
    <div className="absolute inset-0" data-testid="container-inverter-video">
      <video
        ref={videoRef}
        src="/inverter-video.mp4"
        className="h-full w-full object-cover"
        style={{ mixBlendMode: "screen" }}
        autoPlay
        muted
        playsInline
        preload="auto"
        loop={false}
        disablePictureInPicture
        data-testid="video-inverter"
      />
    </div>
  );
}

function AnimatedServicesSection() {
  const serviceWords = ["AC/DC Sürücüler", "İnverterler", "Servo Sürücüler", "Güç Kartları"];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((p) => (p + 1) % serviceWords.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="services"
      className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-20"
      data-testid="section-services"
    >
      <div className="flex flex-col items-center text-center gap-4 mb-14">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground" data-testid="text-services-eyebrow">
          Neler yapıyoruz
        </p>
        <h2
          className="text-4xl md:text-6xl font-bold tracking-tight leading-tight"
          style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
          data-testid="text-services-title"
        >
          Tamir ediyoruz
          <span
            className="relative block overflow-hidden"
            style={{ height: "1.25em" }}
          >
            {serviceWords.map((word, i) => (
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
                {word}
              </motion.span>
            ))}
          </span>
        </h2>
        <p className="text-base text-muted-foreground max-w-md" data-testid="text-services-subtitle">
          Endüstriyel sürücü ve elektronik kartlarını fabrikadan çıkmış gibi teslim ediyoruz.
        </p>
      </div>

      <ImageAccordion
        defaultActive={0}
        items={[
          {
            id: 1,
            title: "Sürücü Tamiri",
            description: "AC/DC sürücüler, inverterler, servo sürücüler. Arıza tespiti, onarım ve yük altında test.",
            icon: <Zap strokeWidth={1.2} />,
            particleColor: "#818cf8",
            gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)",
          },
          {
            id: 2,
            title: "Endüstriyel Elektronik",
            description: "Güç kartları, kontrol kartları, SMPS ve CNC/PLC çevre ekipmanları onarımı.",
            icon: <Cpu strokeWidth={1.2} />,
            particleColor: "#34d399",
            gradient: "linear-gradient(135deg, #052e16 0%, #064e3b 60%, #052e16 100%)",
          },
          {
            id: 3,
            title: "Hızlı Arıza Tespiti",
            description: "Ön değerlendirme ve net raporlama. Gereksiz parça değişimi yok.",
            icon: <Search strokeWidth={1.2} />,
            particleColor: "#fb923c",
            gradient: "linear-gradient(135deg, #431407 0%, #7c2d12 60%, #431407 100%)",
          },
        ]}
      />
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
      className="mx-auto w-full max-w-5xl px-4 pb-14 md:px-6 md:pb-24"
      data-testid="section-process"
    >
      <div className="flex flex-col items-center text-center gap-4 mb-14">
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

      <ImageAccordion
        defaultActive={0}
        items={[
          {
            id: 1,
            title: "Ön İnceleme",
            description: "Arıza belirtisi ve model bilgisiyle hızlı değerlendirme başlatılır.",
            icon: <ClipboardList strokeWidth={1.2} />,
            particleColor: "#38bdf8",
            gradient: "linear-gradient(135deg, #0c1a2e 0%, #0c4a6e 60%, #0c1a2e 100%)",
          },
          {
            id: 2,
            title: "Arıza Tespiti",
            description: "Komponent düzeyinde detaylı teknik arıza analizi yapılır.",
            icon: <ScanLine strokeWidth={1.2} />,
            particleColor: "#fbbf24",
            gradient: "linear-gradient(135deg, #1c1400 0%, #451a03 60%, #1c1400 100%)",
          },
          {
            id: 3,
            title: "Onarım + Parça",
            description: "Ölçüm, izolasyon kontrolü, komponent değişimi ve temiz işçilik.",
            icon: <Wrench strokeWidth={1.2} />,
            particleColor: "#f87171",
            gradient: "linear-gradient(135deg, #1a0000 0%, #450a0a 60%, #1a0000 100%)",
          },
          {
            id: 4,
            title: "Test + Teslim",
            description: "Yük altında test, stabilite kontrolü ve teslim öncesi rapor.",
            icon: <PackageCheck strokeWidth={1.2} />,
            particleColor: "#4ade80",
            gradient: "linear-gradient(135deg, #001a0a 0%, #052e16 60%, #001a0a 100%)",
          },
        ]}
      />
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
      <SparkleButton className={className} onClick={handleClick} {...props}>
        {children}
      </SparkleButton>
    </motion.div>
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
      <section id="products" className="mx-auto w-full max-w-6xl px-4 md:px-6">
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
    <section id="products" className="mx-auto w-full max-w-6xl md:px-2" data-testid="products-showcase">
      <ProductCarousel
        title="Yedek Parça Mağazası"
        products={products}
        emptyMessage="Yakında burada ürünlerimizi görebileceksiniz."
        onProductClick={(p) => setLocation(`/brand/${encodeURIComponent(p.brand)}`)}
      />
    </section>
  );
}

export default function HomePage() {
  const preferReducedMotion = useReducedMotion();
  const [brandsOpen, setBrandsOpen] = useState(false);
  const inverterSectionRef = useRef<HTMLElement>(null);
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
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "opacity, filter" }}
      >
      <InteractiveGradient />
      {/* Arka plan partikülleri — düşük yoğunluk, GPU'da çalışır */}
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
      <WhatsAppButton />
      <BrandsPopup isOpen={brandsOpen} onClose={() => setBrandsOpen(false)} />
      <a
        href="#contact"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow-soft"
        data-testid="link-skip-contact"
      >
        İletişime geçe atla
      </a>

      {/* Arka plan InteractiveGradient içinde yönetiliyor */}
      
      <header className="sticky top-0 z-40 border-b bg-background/80 shadow-elevated backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-0 md:px-6">
          <div className="-ml-25 -mt-12 mb-[-2.5rem]">
            <HeaderLogo />
          </div>

          <nav aria-label="Ana menü" className="hidden md:flex">
            <InteractiveMenu
              items={[
                { label: "Hizmetler", icon: Wrench,  onClick: () => scrollToId("services") },
                { label: "Süreç",     icon: Settings, onClick: () => scrollToId("process")  },
                { label: "İletişim",  icon: Phone,    onClick: () => scrollToId("contact")  },
                { label: "Markalar",  icon: Package,  onClick: () => setBrandsOpen((v) => !v) },
              ]}
            />
          </nav>

          <div className="flex items-center gap-2">
            <MagneticButton
              variant="secondary"
              className="hidden md:inline-flex"
              onClick={() => scrollToId("contact")}
              data-testid="button-cta-quote"
            >
              Teklif iste
            </MagneticButton>
            <MagneticButton
              onClick={() => scrollToId("contact")}
              data-testid="button-cta-contact"
            >
              İletişim
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* Marka logoları sonsuz slider */}
        <div className="relative w-full py-8 overflow-hidden border-b">
          <p
            className="text-center text-xl font-bold text-foreground mb-6 tracking-tight"
            style={{ fontFamily: "Nunito, var(--font-sans)" }}
            data-testid="text-brands-title"
          >
            Tamir ettiğimiz markalar
          </p>
          <div className="relative h-16 w-full">
            <InfiniteSlider className="flex h-full w-full items-center" duration={35} gap={48}>
              {BRANDS.map((brand) => (
                <div key={brand.name} className="flex items-center justify-center h-12 w-32 flex-shrink-0 transition-all duration-300 opacity-90 hover:opacity-100 hover:scale-105">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-9 w-auto object-contain"
                    style={{ transform: `scale(${brand.scale ?? 1})` }}
                  />
                </div>
              ))}
            </InfiniteSlider>
            <ProgressiveBlur
              className="pointer-events-none absolute top-0 left-0 h-full w-[150px]"
              direction="left"
              blurIntensity={0.5}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute top-0 right-0 h-full w-[150px]"
              direction="right"
              blurIntensity={0.5}
            />
          </div>
        </div>

      <main id="top">
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-10 md:px-6 md:pb-16 md:pt-16">
          <div className="grid items-start gap-8 md:grid-cols-[1.35fr_.65fr] md:gap-10">
            <div>
              <motion.div
                initial={preferReducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Badge
                  className="rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-foreground shadow-soft"
                  data-testid="badge-hero"
                >
                  Elektronik sürücü tamiri · Endüstriyel servis
                </Badge>
              </motion.div>

              <motion.h1
                className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-6xl"
                style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                data-testid="text-hero-title"
                initial={preferReducedMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                Sürücünüz arızalandıysa,
                <span className="block text-foreground">
                  doğru teşhisle hızlıca ayağa kaldıralım.
                </span>
              </motion.h1>

              <motion.p
                className="mt-4 max-w-xl text-pretty text-base text-muted-foreground md:text-lg"
                data-testid="text-hero-subtitle"
                initial={preferReducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
              >
                Burem Elektronik; inverter, servo sürücü ve endüstriyel elektronik
                kartlarda arıza tespiti, onarım ve test sürecini net ve güvenilir
                şekilde yönetir.
              </motion.p>

              <motion.div
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
                initial={preferReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}
              >
                <MagneticButton
                  className="h-11"
                  onClick={() => scrollToId("contact")}
                  data-testid="button-hero-contact"
                >
                  Hemen iletişime geç
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </MagneticButton>

                <MagneticButton
                  variant="secondary"
                  className="h-11"
                  onClick={() => scrollToId("services")}
                  data-testid="button-hero-services"
                >
                  Hizmetleri gör
                </MagneticButton>
              </motion.div>

              <motion.div
                className="mt-8 grid gap-3 sm:grid-cols-3"
                initial={preferReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.80, ease: [0.22, 1, 0.36, 1] }}
              >
                {["Hızlı dönüş", "Testli teslim", "Kontrollü onarım"].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 rounded-2xl border bg-muted px-3 py-2 text-sm shadow-soft"
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
              </motion.div>
            </div>

            <motion.div
              initial={preferReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={preferReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="overflow-hidden rounded-3xl border bg-card/70 shadow-elevated">
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
                        className="bg-blue-700/2 mt-1 text-lg font-semibold tracking-tight"
                        style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                        data-testid="text-hero-card-title"
                      >
                        Sürücü · Kart · Güç elektroniği
                      </p>
                    </div>
                    <span
                      className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-muted-foreground"
                      data-testid="badge-hero-card"
                    >
                      TR
                    </span>
                  </div>

                  <div className="mt-5 h-[220px]" data-testid="card-kpi-accordion">
                    <ImageAccordion
                      direction="vertical"
                      defaultActive={0}
                      items={[
                        {
                          id: 1,
                          title: "24–72 saat",
                          description: "Ortalama işlem süresi. Parça durumuna göre değişir.",
                          icon: <Timer strokeWidth={1.3} />,
                          particleColor: "#38bdf8",
                          gradient: "linear-gradient(135deg, #0c1a2e 0%, #0c4a6e 100%)",
                        },
                        {
                          id: 2,
                          title: "Yük altında test",
                          description: "Stabilite ve ısı kontrolü teslimden önce yapılır.",
                          icon: <Zap strokeWidth={1.3} />,
                          particleColor: "#fbbf24",
                          gradient: "linear-gradient(135deg, #1c1400 0%, #451a03 100%)",
                        },
                        {
                          id: 3,
                          title: "Şeffaf raporlama",
                          description: "Yapılan tüm işlemler müşteriye net biçimde aktarılır.",
                          icon: <ClipboardList strokeWidth={1.3} />,
                          particleColor: "#4ade80",
                          gradient: "linear-gradient(135deg, #001a0a 0%, #052e16 100%)",
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="border-t bg-transparent p-4 shadow-elevated">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground" data-testid="text-hero-card-note">
                      Cihaz bilgisi ile hızlı fiyat/termin.
                    </p>
                    <Button
                      size="sm"
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

        {/* İnverter Video Bölümü */}
        <section ref={inverterSectionRef} className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6 md:pb-16" data-testid="section-inverter-3d">
          <div className="relative w-full h-[480px] md:h-[560px] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-elevated">
            {/* Video — tam karta dolu */}
            <InverterScrollVideo sectionRef={inverterSectionRef} />

            {/* Gradient overlay — soldan metin okunabilirliği için */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/60 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

            {/* Metin — sol altta */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end px-8 py-10 md:max-w-[52%]">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-3" data-testid="text-inverter-eyebrow">
                Uzmanlık Alanımız
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold leading-tight text-white"
                style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                data-testid="text-inverter-title"
              >
                Frekans İnverteri&nbsp;&amp; Sürücü Tamiri
              </h2>
              <p className="mt-4 text-sm text-zinc-400 max-w-sm leading-relaxed" data-testid="text-inverter-desc">
                ABB, Siemens, Danfoss, Schneider ve daha fazlasının frekans inverterleri — kart seviyesinde onarım, test ve devreye alma.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["AC Sürücü", "DC Sürücü", "Servo", "Güç Kartı"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-300"
                    data-testid={`tag-inverter-${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <AnimatedServicesSection />

        <AnimatedProcessSection />

        <ProductsShowcase />

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
                Arıza bildirimi
              </h2>
              <p
                className="mt-3 text-sm text-muted-foreground"
                data-testid="text-contact-subtitle"
              >
                Cihazın marka/modeli ve arıza belirtisini yazın; hızlıca dönüş yapalım.
              </p>

              <ContactForm />
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
                        +90 (532) 266 47 64
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
                        info@buremelektronik.com
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
                        Bursa / Türkiye
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
                  {["Güvenilir parça & işçilik", "Detaylı arıza analizi", "Test ile teslim"].map(
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
            © {new Date().getFullYear()} Burem Elektronik
          </p>
          <p data-testid="text-footer-right">Elektronik sürücü tamiri · Endüstriyel servis</p>
        </div>
      </footer>
      </motion.div>
    </>
  );
}
