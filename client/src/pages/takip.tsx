import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, ArrowLeft } from "lucide-react";
import BuremFooter from "@/components/ui/footer";
import { SEO } from "@/components/seo";
import { Link } from "wouter";
import { TrackerCard } from "@/components/ui/tracker-card";

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

export default function TakipPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const searchRecord = async (searchQuery: string) => {
    const q = searchQuery.trim();
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchRecord(query);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const takipParam = params.get("takip");
    if (takipParam) {
      const normalized = takipParam.trim().toUpperCase();
      setQuery(normalized);
      searchRecord(normalized);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45"
          style={{ backgroundImage: "url('/service-tracking-bg.png')" }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/65" />

        <div className="relative flex min-h-screen flex-col">
          {/* Nav */}
          <header className="border-b border-border bg-white/75 backdrop-blur-md">
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
              Takip numaranızı (BRM-XXXX) veya kayıtlı telefon numaranızı girin
            </p>
          </div>

          {/* Arama formu */}
          <form onSubmit={handleSearch} className="mx-auto mb-10 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="BRM-XXXX veya 05xxxxxxxxx"
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
                <TrackerCard
                  trackingNo={result.trackingNo}
                  status={result.status}
                  deviceModel={result.deviceModel}
                  customerName={result.customerName}
                  updatedDate={updatedDate}
                  technicianNote={result.technicianNote}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </main>

          <BuremFooter />
        </div>
      </div>
    </>
  );
}
