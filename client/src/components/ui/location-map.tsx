import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ExternalLink, MapPin } from "lucide-react";

const BUREM_LOCATION: [number, number] = [28.9292879, 40.210269];
const BUSINESS_ADDRESS =
  "Alaaddinbey, 626. Sk. SAM 1 Plaza B Blok No: 22, İç Kapı No: B14, 16210 Nilüfer/Bursa";

export function LocationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        center: BUREM_LOCATION,
        zoom: 16,
        minZoom: 12,
        maxZoom: 19,
        renderWorldCopies: false,
        attributionControl: { compact: true },
      });
    } catch {
      setMapError(true);
      return;
    }

    const markerElement = document.createElement("div");
    markerElement.className = "flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-slate-900 shadow-lg";
    markerElement.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" stroke="white" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="white"/></svg>';
    markerElement.setAttribute("role", "img");
    markerElement.setAttribute("aria-label", `Burem Elektronik: ${BUSINESS_ADDRESS}`);

    new Marker({ element: markerElement, anchor: "bottom" })
      .setLngLat(BUREM_LOCATION)
      .setPopup(
        new Popup({ offset: 28, closeButton: false, maxWidth: "280px" }).setText(BUSINESS_ADDRESS),
      )
      .addTo(map);

    const handleError = () => setMapError(true);
    map.on("error", handleError);

    return () => {
      map.off("error", handleError);
      map.remove();
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

      <div className="relative h-[300px] overflow-hidden bg-slate-100 md:h-[340px]">
        <div ref={containerRef} className="absolute inset-0" aria-label="Bursa haritası" />
        {mapError && (
          <div className="absolute inset-0 overflow-hidden bg-[#edf1ed]">
            <svg
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="Burem Elektronik'in Nilüfer'deki konumunu gösteren şematik harita"
            >
              <rect width="800" height="400" fill="#edf1ed" />
              <path d="M0 285C110 250 145 330 250 295s145-92 250-54 190 65 300 2v157H0Z" fill="#dce9e8" />
              <path d="M45 45 165 90l-25 74-120-20zm250 2 102-25 45 77-84 48-78-36zm300 26 158-35 24 92-124 38-67-40zM140 205l115-23 40 61-97 54-78-31zm338-34 106-24 34 63-92 44-64-34zM320 320l99-38 56 54-40 64-125-8z" fill="#dce9d8" />
              <g fill="none" stroke="#fff" strokeLinecap="round">
                <path d="M-20 105 190 155l170-35 150 55 160-5 160 68" strokeWidth="18" />
                <path d="M65 420 170 280l35-150 150-110M285 420l20-112 90-125 25-165M505 425l-22-115 70-135 140-150M720 420l-66-114 46-112 84-60" strokeWidth="15" />
                <path d="M20 220 160 210l155 45 155-25 118 49 160-28M0 350l190-42 130 34 145-33 178 34 180-15" strokeWidth="10" />
              </g>
              <g fill="none" stroke="#cad3cc" strokeLinecap="round" strokeWidth="2">
                <path d="m65 42 46 63-21 69m87-118-21 69 55 38m-24 72 53 36-24 65m64-211 61 39-28 68m64-104 63 42-30 70m50-167 53 33-22 61m68-7 48 34-29 66m-5 63 60 35-24 69m-70-29 34 65-34 45" />
              </g>
            </svg>
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <MapPin className="h-10 w-10 fill-slate-900 text-white drop-shadow-md" aria-hidden="true" />
              <span className="mt-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 shadow">
                Burem Elektronik · Nilüfer
              </span>
            </div>
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
              Canlı harita bu tarayıcıda görüntülenemiyor
            </div>
          </div>
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
