import React from "react";
import { Phone, Mail, MapPin, MessageCircle, Linkedin, Instagram } from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";

const BuremFooter: React.FC = () => {
  const year = new Date().getFullYear();

  const services = [
    "Servo Sürücü Tamiri",
    "Frekans Dönüştürücü (İnverter)",
    "PLC Tamiri",
    "UPS & Güç Kaynağı",
    "Kontrol Kartı Tamiri",
  ];

  const links = [
    { label: "Ana Sayfa", href: "#hero" },
    { label: "Hizmetler", href: "#services" },
    { label: "Nasıl Çalışır", href: "#process" },
    { label: "Ürünler", href: "#products" },
    { label: "İletişim", href: "#contact" },
  ];

  const socials = [
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: MessageCircle, href: "https://wa.me/905322664764", label: "WhatsApp" },
  ];

  return (
    <footer className="relative bg-white pt-20 pb-10 overflow-hidden">
      {/* Three.js dalgalı nokta arka planı */}
      <DottedSurface dotColor="#94a3b8" />

      {/* Hafif üst sis — içeriği netleştirir */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/10" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marka */}
          <div>
            <h3
              className="mb-4 text-base font-bold tracking-tight text-gray-900"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Burem Elektronik
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              Endüstriyel elektronik cihazlarınızı orijinal kalitesiyle geri
              kazandırıyoruz. Servo sürücüden PLC'ye, tüm sürücü tamirlerinde
              güvenilir çözüm.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white/90 text-gray-500 shadow-sm transition-all duration-300 hover:border-transparent hover:bg-gradient-to-br hover:from-slate-700 hover:to-slate-900 hover:text-white hover:shadow-md"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Hizmetler */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-400">
              Hizmetler
            </h4>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="group flex items-center gap-2 text-sm text-gray-600 transition-colors duration-300 hover:text-gray-900"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-slate-500 to-slate-700 opacity-0 transition-opacity group-hover:opacity-100" />
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-400">
              Hızlı Linkler
            </h4>
            <ul className="space-y-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group flex items-center gap-2 text-sm text-gray-600 transition-colors duration-300 hover:text-gray-900"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-slate-500 to-slate-700 opacity-0 transition-opacity group-hover:opacity-100" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-400">
              İletişim
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span>Bursa, Türkiye</span>
              </li>
              <li>
                <a
                  href="mailto:info@buremelektronik.com"
                  className="flex items-center gap-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-900"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  info@buremelektronik.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/905322664764"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-900"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  +90 (532) 266 47 64
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt çizgi */}
        <div className="mt-16 border-t border-black/10 pt-7 text-center">
          <p
            className="text-xs font-medium text-gray-400"
            data-testid="text-footer-left"
          >
            © {year} Burem Elektronik. Tüm hakları saklıdır.&nbsp;·&nbsp;Endüstriyel Elektronik Servis
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BuremFooter;
