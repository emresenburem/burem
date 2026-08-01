import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Clock, AlertCircle, Package, Wrench, Truck, ChevronRight, ArrowLeft } from "lucide-react";
import BuremFooter from "@/components/ui/footer";
import { SEO } from "@/components/seo";
import { Link } from "wouter";

const STATUS_STEPS = [
  { id: 1, label: "Teslim Alındı",           icon: Package,      color: "text-blue-500",  bg: "bg-blue-500/10",  border: "border-blue-500/30" },
  { id: 2, label: "Arıza Tespiti / İnceleme", icon: Search,       color: "text-purple-500",bg: "bg-purple-500/10",border: "border-purple-500/30" },
  { id: 3, label: "Müşteri Onayı Bekleniyor", icon: Clock,        color: "text-yellow-500",bg: "bg-yellow-500/10",border: "border-yellow-500/30" },
  { id: 4, label: "Parça Bekleniyor",         icon: AlertCircle,  color: "text-orange-500",bg: "bg-orange-500/10",border: "border-orange-500/30" },
  { id: 5, label: "Onarım & Yük Testinde",    icon: Wrench,       color: "text-cyan-500",  bg: "bg-cyan-500/10",  border: "border-cyan-500/30" },
  { id: 6, label: "Teslimata Hazır",          icon: Truck,        color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
];

interface ServiceRecord {
  id: string;
  trackingNo: string;
  customerName: string;
  deviceModel: string;
  status: number;
  technicianNote?: string | null;
  updatedAt: string;
  createdAt: string;
}

function StatusStepper({ status }: { status: number }) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-green-500 z-0 transition-all duration-700"
          style={{ width: `${((status - 1) / 5) * 100}%` }}
        />
        {STATUS_STEPS.map((step) => {
          const Icon = step.icon;
          const done = step.id < status;
          const active = step.id === status;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: active ? 1.15 : 1 }}
                className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                    ? `${step.bg} ${step.border} ${step.color} border-2 shadow-lg`
                    : "bg-background border-border text-muted-foreground/40"
                }`}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </motion.div>
              <span className={`text-[10px] font-medium text-center max-w-[80px] leading-tight ${
                active ? step.color + " font-semibold" : done ? "text-green-600" : "text-muted-foreground/50"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-2 sm:hidden">
        {STATUS_STEPS.map((step) => {
          const Icon = step.icon;
          const done = step.id < status;
          const active = step.id === status;
          return (
            <div key={step.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
              active ? `${step.bg} ${step.border}` : done ? "border-green-500/20 bg-green-500/5" : "border-border bg-muted/20 opacity-40"
            }`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? "bg-green-500 text-white" : active ? `${step.bg} ${step.color}` : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-sm font-medium ${active ? step.color : done ? "text-green-600" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {active && <ChevronRight className={`ml-auto h-4 w-4 ${step.color}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TakipPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    setError("");

    try {
      const res = await fetch(`/api/service/query?q=${encodeURIComponent(q)}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error("Sorgu başarısız");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const activeStep = STATUS_STEPS.find((s) => s.id === result?.status);
  const updatedDate = result?.updatedAt
    ? new Date(result.updatedAt).toLocaleString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <>
      <SEO
        title="Servis Takip | Burem Elektronik"
        description="Cihazınızın servis durumunu takip edin. Takip numarası veya telefon numaranızı girin."
        canonical="https://www.buremelektronik.com/takip"
      />

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Nav */}
        <header className="border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3 md:px-6">
            <Link href="/">
              <img src="/logo.png" alt="Burem Elektronik" className="h-9 w-auto" />
            </Link>
            <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
              <ArrowLeft className="h-4 w-4" /> Ana Sayfa
            </Link>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12 md:px-6">
          {/* Başlık */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-4">
              <Search className="h-3.5 w-3.5" />
              Servis Takip Sistemi
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
              Cihazınızın Durumunu<br />Takip Edin
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Takip numaranızı (BRM-1042) veya kayıtlı telefon numaranızı girin
            </p>
          </div>

          {/* Arama formu */}
          <form onSubmit={handleSearch} className="mx-auto mb-10 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="BRM-1042 veya 05xxxxxxxxx"
                className="w-full rounded-2xl border border-border bg-muted/30 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                data-testid="input-tracking"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-foreground/80 transition-colors disabled:opacity-60"
              data-testid="button-search"
            >
              {loading ? "Aranıyor…" : "Sorgula"}
            </button>
          </form>

          {/* Sonuç */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mx-auto max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 text-center"
              >
                {error}
              </motion.div>
            )}

            {notFound && (
              <motion.div key="notfound" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mx-auto max-w-xl rounded-2xl border border-border bg-muted/30 px-6 py-10 text-center"
              >
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="font-semibold">Kayıt bulunamadı</p>
                <p className="mt-1 text-sm text-muted-foreground">Lütfen takip numaranızı veya kayıtlı telefonunuzu kontrol edin.</p>
              </motion.div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mx-auto max-w-3xl"
              >
                {/* Stepper */}
                <div className="rounded-2xl border border-border bg-card p-6 mb-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Takip No</span>
                      <p className="text-lg font-bold font-mono">{result.trackingNo}</p>
                    </div>
                    {activeStep && (
                      <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${activeStep.bg} ${activeStep.border} ${activeStep.color}`}>
                        <activeStep.icon className="h-3.5 w-3.5" />
                        {activeStep.label}
                      </span>
                    )}
                  </div>
                  <StatusStepper status={result.status} />
                </div>

                {/* Detay kartı */}
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cihaz Bilgileri</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/40 px-4 py-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Müşteri</p>
                      <p className="text-sm font-semibold">{result.customerName}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 px-4 py-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Cihaz</p>
                      <p className="text-sm font-semibold">{result.deviceModel}</p>
                    </div>
                    <div className="sm:col-span-2 rounded-xl bg-muted/40 px-4 py-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Son Güncelleme</p>
                      <p className="text-sm font-semibold">{updatedDate}</p>
                    </div>
                    {result.technicianNote && (
                      <div className="sm:col-span-2 rounded-xl border border-border bg-background px-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">Teknisyen Notu</p>
                        <p className="text-sm leading-relaxed">{result.technicianNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BuremFooter />
      </div>
    </>
  );
}
