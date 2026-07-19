import { Link } from "wouter";
import { SEO } from "@/components/seo";
import { Phone, MessageCircle, ArrowRight, CheckCircle2, AlertTriangle, Wrench, Cpu } from "lucide-react";
import BuremFooter from "@/components/ui/footer";

export interface ServicePageData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  h1: string;
  intro: string;
  commonFaults: string[];
  repairProcess: { step: string; desc: string }[];
  brandsModels: string[];
  relatedServices: { label: string; href: string }[];
}

const PHONE = "+905322664764";
const PHONE_DISPLAY = "+90 532 266 47 64";
const WA_URL = "https://wa.me/905322664764";

export function ServicePageTemplate({ data }: { data: ServicePageData }) {
  return (
    <>
      <SEO
        title={data.metaTitle}
        description={data.metaDescription}
        canonical={data.canonical}
      />

      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Nav */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Burem Elektronik ana sayfa"
            >
              <img src="/logo.png" alt="Burem Elektronik logosu" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${PHONE}`}
                className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
                data-testid="link-phone-nav"
              >
                <Phone className="h-4 w-4" />
                {PHONE_DISPLAY}
              </a>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20ba5a] transition-colors"
                data-testid="link-whatsapp-nav"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="border-b border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-4xl">
              <Link
                href="/"
                className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                ← Ana Sayfa
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
                {data.h1}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-zinc-300 leading-relaxed">
                {data.intro}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white hover:bg-[#20ba5a] transition-colors"
                  data-testid="button-whatsapp-hero"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp ile İletişim
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors"
                  data-testid="button-phone-hero"
                >
                  <Phone className="h-5 w-5" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </section>

          {/* Common Faults */}
          <section className="px-4 py-14 md:px-6 md:py-20">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Sık Görülen Arızalar</h2>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.commonFaults.map((fault, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-400" />
                    <span className="text-zinc-300 text-sm">{fault}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Repair Process */}
          <section className="border-y border-white/10 bg-zinc-900/50 px-4 py-14 md:px-6 md:py-20">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 flex items-center gap-3">
                <Wrench className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Onarım Sürecimiz</h2>
              </div>
              <ol className="space-y-5">
                {data.repairProcess.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{item.step}</p>
                      <p className="mt-1 text-sm text-zinc-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Brands & Models */}
          <section className="px-4 py-14 md:px-6 md:py-20">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 flex items-center gap-3">
                <Cpu className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Hizmet Verilen Marka ve Modeller</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.brandsModels.map((brand, i) => (
                  <span key={i} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-zinc-300">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="border-t border-white/10 bg-zinc-900/60 px-4 py-14 md:px-6 md:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-2xl font-bold text-white md:text-3xl">Arızanızı Değerlendirelim</h2>
              <p className="mt-3 text-zinc-400">
                Cihazınızı bize göndermeden önce fotoğraf ve arıza açıklaması paylaşabilirsiniz.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-white hover:bg-[#20ba5a] transition-colors"
                  data-testid="button-whatsapp-contact"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp ile Yazın
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 font-semibold text-white hover:bg-white/20 transition-colors"
                  data-testid="button-phone-contact"
                >
                  <Phone className="h-5 w-5" />
                  Hemen Ara
                </a>
              </div>
            </div>
          </section>

          {/* Related Services */}
          <section className="px-4 py-12 md:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 text-xl font-bold text-white">İlgili Hizmetler</h2>
              <nav aria-label="İlgili hizmetler" className="flex flex-wrap gap-3">
                {data.relatedServices.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
                  >
                    {s.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </nav>
            </div>
          </section>
        </main>

        <BuremFooter />
      </div>
    </>
  );
}
