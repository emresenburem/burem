import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";

const BUREM_LOCATION = { latitude: 40.210269, longitude: 28.9292879 };
const BUSINESS_ADDRESS =
  "Alaaddinbey, 626. Sk. SAM 1 Plaza B Blok No: 22, İç Kapı No: B14, 16210 Nilüfer/Bursa";
const GOOGLE_MAPS_EMBED_URL =
  `https://www.google.com/maps?q=${BUREM_LOCATION.latitude},${BUREM_LOCATION.longitude}&z=18&output=embed`;
const GOOGLE_MAPS_PLACE_URL =
  `https://www.google.com/maps/search/?api=1&query=${BUREM_LOCATION.latitude}%2C${BUREM_LOCATION.longitude}`;

export function LocationMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    let timeoutId: number | undefined;
    const startLoadTimeout = () => {
      if (timeoutId !== undefined) return;
      timeoutId = window.setTimeout(() => {
        setMapStatus((status) => (status === "loading" ? "error" : status));
      }, 12000);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          startLoadTimeout();
          observer.disconnect();
        }
      }, { rootMargin: "200px" });
      observer.observe(container);
      return () => {
        observer.disconnect();
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      };
    }

    startLoadTimeout();
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated"
      aria-labelledby="location-map-title"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Burem Elektronik
          </p>
          <h3 id="location-map-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Alaaddinbey, Nilüfer / Bursa
          </h3>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div
        ref={mapContainerRef}
        className="relative h-[300px] overflow-hidden bg-slate-100 md:h-[340px]"
      >
        <iframe
          src={GOOGLE_MAPS_EMBED_URL}
          title="Burem Elektronik'in Alaaddinbey, Nilüfer, Bursa konumu — Google Haritalar"
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onLoad={() => setMapStatus("loaded")}
          onError={() => setMapStatus("error")}
        />
        {mapStatus === "loading" && (
          <div
            className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-100 text-sm font-medium text-slate-600"
            role="status"
            aria-live="polite"
          >
            <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" aria-hidden="true" />
            Google Haritalar yükleniyor
          </div>
        )}
        {mapStatus === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
            <p className="text-sm text-slate-600">Harita şu anda yüklenemedi.</p>
            <a
              href={GOOGLE_MAPS_PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Google Maps’te görüntüle
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        )}
        {mapStatus === "loaded" && (
          <a
            href={GOOGLE_MAPS_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-3 rounded-md bg-white/95 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-black/10 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            Google Maps’te aç
          </a>
        )}
      </div>

      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="max-w-md text-sm leading-relaxed text-slate-600">
          {BUSINESS_ADDRESS}.
          <span className="mt-1 block text-xs text-slate-400">
            Cihazınızı kargo veya elden teslim edebilirsiniz.
          </span>
        </p>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=40.210269%2C28.9292879"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          Yol tarifi al
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
