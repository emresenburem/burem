"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Phone, Mail, MapPin, MessageCircle, ArrowUp } from "lucide-react";
import { PHONE_DISPLAY, PHONE_NUMBER, whatsappLink } from "@/lib/site-contact";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes cf-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.9; }
}
@keyframes cf-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes cf-heartbeat {
  0%, 100% { transform: scale(1); }
  15%, 45% { transform: scale(1.3); }
  30% { transform: scale(1); }
}

.cf-breathe { animation: cf-breathe 8s ease-in-out infinite alternate; }
.cf-marquee  { animation: cf-marquee 36s linear infinite; }
.cf-heartbeat { animation: cf-heartbeat 2s cubic-bezier(0.25,1,0.5,1) infinite; }

.cf-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.cf-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary) 12%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 10%, transparent) 40%,
    transparent 70%
  );
}

.cf-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 0 10px 30px -10px var(--pill-shadow), inset 0 1px 1px var(--pill-highlight), inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}

.cf-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 0 20px 40px -10px var(--pill-shadow-hover), inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

.cf-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.cf-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}
`;

type GsapButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { as?: React.ElementType };

const GsapButton = React.forwardRef<HTMLElement, GsapButtonProps>(
  ({ className, children, as: Tag = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const el = localRef.current;
      if (!el) return;
      const ctx = gsap.context(() => {
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(el, { x: x * 0.35, y: y * 0.35, rotationX: -y * 0.12, rotationY: x * 0.12, scale: 1.05, ease: "power2.out", duration: 0.4 });
        };
        const onLeave = () =>
          gsap.to(el, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: "elastic.out(1,0.3)", duration: 1.2 });
        el.addEventListener("mousemove", onMove as EventListener);
        el.addEventListener("mouseleave", onLeave);
        return () => { el.removeEventListener("mousemove", onMove as EventListener); el.removeEventListener("mouseleave", onLeave); };
      }, el);
      return () => ctx.revert();
    }, []);

    return (
      <Tag
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
GsapButton.displayName = "GsapButton";

const MarqueeItem = () => (
  <div className="flex items-center space-x-10 px-6 text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-muted-foreground">
    <span>Endüstriyel Elektronik Tamiri</span>
    <span className="text-primary/50">✦</span>
    <span>Hızlı Teslimat</span>
    <span className="text-primary/50">✦</span>
    <span>Yük Altında Test</span>
    <span className="text-primary/50">✦</span>
    <span>Orijinal Yedek Parça</span>
    <span className="text-primary/50">✦</span>
    <span>Bursa &amp; Türkiye Geneli</span>
    <span className="text-primary/50">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgTextRef.current,
        { y: "10vh", scale: 0.85, opacity: 0 },
        { y: "0vh", scale: 1, opacity: 1, ease: "power1.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", end: "bottom bottom", scrub: 1 } }
      );
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 40%", end: "bottom bottom", scrub: 1 } }
      );
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground">
          {/* Aurora + Grid */}
          <div className="cf-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 cf-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="cf-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant BG Text */}
          <div ref={bgTextRef} className="cf-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none">
            BUREM
          </div>

          {/* Marquee */}
          <div className="absolute top-10 left-0 w-full overflow-hidden border-y border-border/50 bg-background/60 backdrop-blur-md py-4 z-10 -rotate-1 scale-105 shadow-xl">
            <div className="cf-marquee flex w-max">
              <MarqueeItem /><MarqueeItem />
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-4xl mx-auto">
            <h2 ref={headingRef} className="cf-text-glow text-5xl md:text-8xl font-black tracking-tighter mb-10 text-center">
              Çözüme hazır mısınız?
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-5 w-full">
              {/* İletişim Butonları */}
              <div className="flex flex-wrap justify-center gap-4">
                <GsapButton
                  as="a"
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cf-pill px-8 py-4 rounded-full text-foreground font-bold text-sm flex items-center gap-3 group"
                  data-testid="footer-cta-whatsapp"
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  WhatsApp ile Yaz
                </GsapButton>

                <GsapButton
                  as="a"
                  href={`tel:${PHONE_NUMBER}`}
                  className="cf-pill px-8 py-4 rounded-full text-foreground font-bold text-sm flex items-center gap-3 group"
                  data-testid="footer-cta-phone"
                >
                  <Phone className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  {PHONE_DISPLAY}
                </GsapButton>

                <GsapButton
                  as="a"
                  href="mailto:info@buremelektronik.com"
                  className="cf-pill px-8 py-4 rounded-full text-foreground font-bold text-sm flex items-center gap-3 group"
                  data-testid="footer-cta-email"
                >
                  <Mail className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  info@buremelektronik.com
                </GsapButton>
              </div>

              {/* İkincil linkler */}
              <div className="flex flex-wrap justify-center gap-3 mt-1">
                <GsapButton
                  as="a"
                  href="https://maps.google.com/?q=Bursa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cf-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs flex items-center gap-2 hover:text-foreground"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Bursa, Türkiye
                </GsapButton>
                <GsapButton
                  as="a"
                  href="#services"
                  onClick={(e: React.MouseEvent) => { e.preventDefault(); const el = document.getElementById("services"); if (el) { const h = (document.querySelector("header") as HTMLElement)?.offsetHeight ?? 80; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - h - 16, behavior: "smooth" }); } }}
                  className="cf-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs hover:text-foreground"
                >
                  Hizmetler
                </GsapButton>
                <GsapButton
                  as="a"
                  href="#process"
                  onClick={(e: React.MouseEvent) => { e.preventDefault(); const el = document.getElementById("process"); if (el) { const h = (document.querySelector("header") as HTMLElement)?.offsetHeight ?? 80; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - h - 16, behavior: "smooth" }); } }}
                  className="cf-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs hover:text-foreground"
                >
                  Süreç
                </GsapButton>
                <GsapButton
                  as="a"
                  href="#products"
                  onClick={(e: React.MouseEvent) => { e.preventDefault(); const el = document.getElementById("products"); if (el) { const h = (document.querySelector("header") as HTMLElement)?.offsetHeight ?? 80; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - h - 16, behavior: "smooth" }); } }}
                  className="cf-pill px-5 py-2.5 rounded-full text-muted-foreground font-medium text-xs hover:text-foreground"
                >
                  Yedek Parça
                </GsapButton>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-muted-foreground text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
              © {new Date().getFullYear()} Burem Elektronik. Tüm hakları saklıdır.
            </div>

            <div className="cf-pill px-5 py-2.5 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default">
              <span className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest">Bursa'da tasarlandı</span>
              <span className="cf-heartbeat inline-block text-red-500">❤</span>
            </div>

            <GsapButton
              as="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-11 h-11 rounded-full cf-pill flex items-center justify-center text-muted-foreground hover:text-foreground group order-3"
              data-testid="footer-back-to-top"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
            </GsapButton>
          </div>
        </footer>
      </div>
    </>
  );
}
