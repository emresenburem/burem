import { useEffect, useMemo, useState, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useLocation } from "wouter";
import { HeaderLogo } from "@/components/header-logo";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    let raf = 0;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const shouldOpen = e.clientX < 50;
        const shouldClose = e.clientX > 320;

        setIsOpen((prev) => {
          if (shouldOpen && !prev) return true;
          if (shouldClose && prev) return false;
          return prev;
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Side Tab Indicator */}
      <motion.div
        className="fixed left-0 top-14 h-screen z-[99] cursor-pointer flex items-center"
        initial={{ x: 0 }}
        animate={{ x: isOpen ? -100 : 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsOpen(true)}
        data-testid="brands-tab-indicator"
      >
        <div className="bg-white px-0.5 py-1 rounded-r-xl shadow-lg flex flex-col items-center h-[99vh] max-h-[90vh] my-auto hover:px-2.5 transition-all border-r border-y border-gray-200">
          <ChevronRight className="h-3 w-3 text-primary mb-1" />
          <div className="flex flex-col gap-2 py-1 overflow-hidden">
            {BRANDS.map((brand) => (
              <div key={brand.name} className="w-8 h-6 bg-gray-50 rounded-sm p-0.5 flex items-center justify-center overflow-hidden flex-1">
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="object-contain"
                  style={{ 
                    width: brand.name === "ABB" ? "100%" : "250%",
                    height: brand.name === "ABB" ? "100%" : "250%"
                  }}
                />
              </div>
            ))}
          </div>
          <ChevronRight className="h-3 w-3 text-primary mt-1" />
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed left-0 top-0 z-[100] h-screen w-[300px] border-r bg-card/95 p-6 shadow-2xl backdrop-blur-xl overflow-y-auto"
            data-testid="popup-brands"
          >
          <h3 className="mb-6 font-semibold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
            Tamir Ettiğimiz Markalar
          </h3>
          
          {/* Spotlight Grid */}
          <div className="grid grid-cols-2 gap-3 spotlight-grid">
            {BRANDS.map((brand) => (
              <motion.div
                key={brand.name}
                className="spotlight-item relative flex flex-col items-center justify-center rounded-xl border p-3 text-center bg-white shadow-sm cursor-pointer overflow-hidden electric-glow group"
                whileHover={{ 
                  scale: 1.25, 
                  zIndex: 50,
                  boxShadow: "0 20px 40px rgba(0,32,96,0.3)"
                }}
                transition={{ type: "spring", stiffness: 600, damping: 15 }}
                onClick={() => setLocation(`/brand/${encodeURIComponent(brand.name)}`)}
                data-testid={`brand-item-${brand.name}`}
              >
                {/* Spotlight glow effect */}
                <div className="absolute inset-0 bg-gradient-radial from-blue-100/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Sliding logos animation */}
                <div className="hidden absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <img 
                    src={brand.logo} 
                    alt=""
                    className="absolute h-1/3 w-3/4 object-contain opacity-20 animate-slide-right"
                    style={{ top: '0%', animationDelay: '0ms' }}
                  />
                  <img 
                    src={brand.logo} 
                    alt=""
                    className="absolute h-1/3 w-3/4 object-contain opacity-20 animate-slide-left"
                    style={{ top: '33%', animationDelay: '200ms' }}
                  />
                  <img 
                    src={brand.logo} 
                    alt=""
                    className="absolute h-1/3 w-3/4 object-contain opacity-20 animate-slide-right"
                    style={{ top: '66%', animationDelay: '400ms' }}
                  />
                </div>
                
                <div className="h-12 w-full flex items-center justify-center p-1 relative z-10">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="h-full w-full object-contain transition-all duration-300"
                    style={brand.scale ? { transform: `scale(${brand.scale})` } : undefined}
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
              Ve daha fazlası... Listemizde olmayan markalar için bize danışın.
            </p>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/905322"
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
          className="mt-2 rounded-2xl"
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
      <Button type="submit" className="h-11 w-full rounded-2xl" disabled={formState === "sending"} data-testid="button-submit">
        {formState === "sending" ? "Gönderiliyor..." : "Gönder"}
      </Button>
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

  const featuredProducts = products.slice(0, 6);

  if (isLoading) {
    return (
      <section id="products" className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
            Yedek Parça Mağazası
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl border bg-card p-4 animate-pulse">
              <div className="h-32 bg-muted rounded-xl mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6" data-testid="products-showcase">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
            Yedek Parça Mağazası
          </h2>
        </div>
      </div>

      {featuredProducts.length === 0 ? (
        <Card className="rounded-2xl border bg-card/50 p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Henüz yedek parça eklenmemiş.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Yakında burada ürünlerimizi görebileceksiniz.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="rounded-2xl border bg-card p-4 hover:shadow-lg transition-shadow cursor-pointer h-full"
                onClick={() => setLocation(`/brand/${encodeURIComponent(product.brand)}`)}
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
                  <p className="text-xs text-muted-foreground">{product.brand} · {product.category}</p>
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
            </motion.div>
          ))}
        </div>
      )}
    </section>
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
    <motion.div 
      className="min-h-screen bg-blue-900/10 text-gray-900" 
      onClick={handleGlobalClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
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
      
      <header className="sticky top-0 z-40 border-b bg-blue-900/2 shadow-elevated backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-0 md:px-6">
          <div className="-ml-8 -mt-10 mb-[-2.5rem]">
            <HeaderLogo />
          </div>

          <nav className="hidden items-center gap-1 md:flex -mt-2" aria-label="Ana menü">
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
                className="rounded-full border bg-blue-900/10 px-3 py-1 text-xs font-medium text-foreground shadow-soft"
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
                <span className="block text-foreground">
                  doğru teşhisle hızlıca ayağa kaldıralım.
                </span>

              </h1>

              <p
                className="mt-4 max-w-xl text-pretty text-base text-muted-foreground md:text-lg"
                data-testid="text-hero-subtitle"
              >
                Burem Elektronik; inverter, servo sürücü ve endüstriyel elektronik
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
                    className="flex items-center gap-2 rounded-2xl border bg-blue-100 px-3 py-2 text-sm shadow-soft"
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
              <Card className="overflow-hidden rounded-3xl border bg-blue-900/10 shadow-elevated">
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
                      className="rounded-full border bg-blue-900/10 px-2.5 py-1 text-xs text-muted-foreground"
                      data-testid="badge-hero-card"
                    >
                      TR
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div
                      className="rounded-2xl border bg-blue-900/10 px-4 py-3"
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
                      className="rounded-2xl border bg-blue-900/10 px-4 py-3"
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
                      className="rounded-2xl border bg-blue-900/10 px-4 py-3"
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
                        className="rounded-2xl border bg-blue-900/10 px-3 py-2 text-center text-xs text-muted-foreground"
                        data-testid={`chip-${k}`}
                      >
                        {k}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t bg-blue-900/0 p-4 shadow-elevated">
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
          className="mx-auto w-full max-w-4xl px-4 pb-14 md:px-6 md:pb-20"
        >
          <div className="grid gap-20">
            {/* Sol: Süreç Başlık + Adımlar */}
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
                className="mt-3 max-w-prose text-sm text-muted-foreground mb-6"
                data-testid="text-process-subtitle"
              >
                Cihaz geldiğinde önce arızayı doğruluyor, ardından onarım ve yük altında
                test ile güvenli teslim ediyoruz.
              </p>

              {/* Süreç Adımları - 2x2 Grid */}
              <ProcessStepsGrid />
            </div>

              {/* Sağ: Çalıştığımız Firmalar false */}
              <Card className="hidden rounded-2xl border bg-card p-4 shadow-soft h-fit" data-testid="card-partners">
                <p className="text-xs text-muted-foreground mb-1" data-testid="text-partners-eyebrow">
                  Referanslarımız
                </p>
                <h3
                  className="text-base font-semibold tracking-tight mb-3"
                  style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                  data-testid="text-partners-title"
                >
                  Çalıştığımız Firmalar
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "ermetal", logo: "https://seekvectorlogo.net/wp-content/uploads/2020/01/ermetal-vector-logo.png" },
                    { name: "Valeo", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Valeo_Logo.svg" },
                    { name: "Bosch", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/2560px-Bosch-logo.svg.png" },
                    { name: "Tofaş", logo: "https://images.seeklogo.com/logo-png/42/1/tofas-logo-png_seeklogo-426899.png" },
                    { name: "Sarar", logo: "https://images.seeklogo.com/logo-png/30/1/sarar-logo-png_seeklogo-309235.png" },
                  ].map((company) => (
                    <div
                      key={company.name}
                      className="bg-white rounded-lg p-2 flex items-center justify-center h-12 border shadow-sm"
                      data-testid={`partner-${company.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="max-h-8 max-w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            const span = document.createElement('span');
                            span.className = 'text-sm font-semibold text-gray-700';
                            span.textContent = company.name;
                            target.parentElement.appendChild(span);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
          </div>
        </section>

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
                Teklif & arıza bildirimi
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
            © {new Date().getFullYear()} Burem Elektronik
          </p>
          <p data-testid="text-footer-right">Elektronik sürücü tamiri · Endüstriyel servis</p>
        </div>
      </footer>
    </motion.div>
  );
}
