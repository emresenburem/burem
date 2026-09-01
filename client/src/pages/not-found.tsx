import { Link } from "wouter";
import { SEO } from "@/components/seo";
import { Phone, MessageCircle } from "lucide-react";
import { PHONE_DISPLAY, PHONE_NUMBER, whatsappLink } from "@/lib/site-contact";

export default function NotFound() {
  return (
    <>
      <SEO
        title="Sayfa Bulunamadı | Burem Elektronik"
        description="Aradığınız sayfa bulunamadı. Burem Elektronik ana sayfasına dönün."
        canonical="/404"
      />
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4">
        <p className="text-8xl font-bold text-white/10 select-none">404</p>
        <h1 className="mt-4 text-3xl font-bold text-white">Sayfa Bulunamadı</h1>
        <p className="mt-3 text-zinc-400 text-center max-w-sm">
          Aradığınız sayfa mevcut değil ya da taşınmış olabilir.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium text-white hover:bg-white/20 transition-colors"
          >
            ← Ana Sayfaya Dön
          </Link>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-white hover:bg-[#20ba5a] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="h-4 w-4" />
            {PHONE_DISPLAY}
          </a>
        </div>

        <nav aria-label="Popüler hizmetler" className="mt-12 flex flex-wrap gap-2 justify-center max-w-lg">
          {[
            { label: "İnverter Tamiri", href: "/inverter-tamiri" },
            { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
            { label: "PLC Tamiri", href: "/plc-tamiri" },
            { label: "Siemens Sürücü", href: "/siemens-surucu-tamiri" },
            { label: "ABB Sürücü", href: "/abb-surucu-tamiri" },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
