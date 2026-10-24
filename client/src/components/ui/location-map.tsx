import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import type { Map as MapLibreMap } from "maplibre-gl";

const BUREM_COORDINATES: [number, number] = [28.9292879, 40.210269];
const BUSINESS_ADDRESS =
  "Alaaddinbey, 626. Sk. SAM 1 Plaza B Blok No: 22, İç Kapı No: B14, 16210 Nilüfer/Bursa";
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=40.210269%2C28.9292879";
const PLACE_URL =
  "https://www.google.com/maps/search/?api=1&query=40.210269%2C28.9292879";
const MAP_ATTRIBUTION =
  '<a href="https://maplibre.org/" target="_blank" rel="noopener">MapLibre</a>';
const MAP_LOAD_TIMEOUT_MS = 20_000;

type MapStatus = "idle" | "loading" | "loaded" | "error";

function createMarkerElement() {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Burem Elektronik konum bilgilerini göster");
  button.title = "Burem Elektronik";
  Object.assign(button.style, {
    alignItems: "flex-end",
    background: "transparent",
    border: "0",
    cursor: "pointer",
    display: "flex",
    height: "56px",
    justifyContent: "center",
    padding: "0",
    width: "56px",
  });

  const logo = document.createElement("img");
  logo.src = "/logo.png";
  logo.alt = "";
  logo.draggable = false;
  Object.assign(logo.style, {
    filter: "drop-shadow(0 2px 3px rgba(15, 23, 42, .45))",
    height: "52px",
    maxWidth: "56px",
    objectFit: "contain",
    width: "auto",
  });
  button.appendChild(logo);
  return button;
}

function createPopupContent() {
  const content = document.createElement("div");
  content.style.cssText =
    "color:#1e293b;font:14px/1.45 system-ui,sans-serif;max-width:250px;padding:2px 4px";

  const name = document.createElement("strong");
  name.textContent = "Burem Elektronik";
  name.style.display = "block";

  const address = document.createElement("p");
  address.textContent = BUSINESS_ADDRESS;
  address.style.margin = "4px 0 8px";

  const directions = document.createElement("a");
  directions.href = DIRECTIONS_URL;
  directions.target = "_blank";
  directions.rel = "noopener noreferrer";
  directions.textContent = "Yol tarifi al";
  directions.style.cssText = "color:#1d4ed8;font-weight:600";

  content.append(name, address, directions);
  return content;
}

export function LocationMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>("idle");

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    let active = true;
    let started = false;
    let styleLoaded = false;
    let mapLoaded = false;
    let failed = false;
    let map: MapLibreMap | undefined;
    let timeoutId: number | undefined;
    let resizeFrameId: number | undefined;
    let observer: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let compactViewport = container.clientWidth < 640;

    const clearLoadTimeout = () => {
      if (timeoutId === undefined) return;
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    };

    const fail = () => {
      if (!active || mapLoaded || failed) return;
      failed = true;
      clearLoadTimeout();
      setMapStatus("error");
    };

    const resizeMap = () => {
      if (!active || !map) return;
      if (resizeFrameId !== undefined) window.cancelAnimationFrame(resizeFrameId);
      resizeFrameId = window.requestAnimationFrame(() => {
        resizeFrameId = undefined;
        if (!active || !map) return;
        map.resize();
        const nextCompactViewport = container.clientWidth < 640;
        if (nextCompactViewport !== compactViewport) {
          compactViewport = nextCompactViewport;
          map.setPadding(compactViewport ? { right: 44, bottom: 44 } : { bottom: 44 });
          map.setZoom(compactViewport ? 15.5 : 16);
        }
      });
    };

    const emphasizeStreetLabels = () => {
      if (!map) return;
      for (const layerId of ["highway-name-major", "highway-name-minor"]) {
        if (!map.getLayer(layerId)) continue;
        map.setLayoutProperty(layerId, "text-size", 14);
        map.setPaintProperty(layerId, "text-color", "#334155");
        map.setPaintProperty(layerId, "text-halo-color", "#ffffff");
        map.setPaintProperty(layerId, "text-halo-width", 1.25);
      }
    };

    const handleMapLoad = () => {
      if (!active) return;
      mapLoaded = true;
      failed = false;
      clearLoadTimeout();
      map?.off("error", handleMapError);
      setMapStatus("loaded");
      resizeMap();
    };

    const handleStyleLoad = () => {
      styleLoaded = true;
      emphasizeStreetLabels();
      resizeMap();
    };

    const handleMapError = () => {
      // A style failure is terminal; individual tile errors are given the full
      // timeout window in case the map can still render useful content.
      if (!styleLoaded && !mapLoaded) fail();
    };

    const initializeMap = async () => {
      try {
        const [maplibre, mapWorker] = await Promise.all([
          import("maplibre-gl"),
          import("maplibre-gl/dist/maplibre-gl-worker.mjs?url"),
          import("maplibre-gl/dist/maplibre-gl.css"),
        ]);
        if (!active || (failed && !map)) return;

        maplibre.setWorkerUrl(mapWorker.default);
        map = new maplibre.Map({
          container,
          style: OPENFREEMAP_STYLE,
          center: BUREM_COORDINATES,
          zoom: compactViewport ? 15.5 : 16,
          scrollZoom: false,
          attributionControl: false,
        });
        map.setPadding(compactViewport ? { right: 44, bottom: 44 } : { bottom: 44 });
        map.on("style.load", handleStyleLoad);
        map.on("error", handleMapError);
        map.once("load", handleMapLoad);

        map.addControl(
          new maplibre.AttributionControl({
            compact: true,
            customAttribution: MAP_ATTRIBUTION,
          }),
          "bottom-right",
        );
        new maplibre.Marker({
          element: createMarkerElement(),
          anchor: "bottom",
        })
          .setLngLat(BUREM_COORDINATES)
          .setPopup(
            new maplibre.Popup({
              offset: 28,
              closeButton: true,
              closeOnClick: true,
              maxWidth: "280px",
            }).setDOMContent(createPopupContent()),
          )
          .addTo(map);
        resizeMap();
      } catch {
        fail();
      }
    };

    const startLoading = () => {
      if (!active || started) return;
      started = true;
      setMapStatus("loading");
      timeoutId = window.setTimeout(fail, MAP_LOAD_TIMEOUT_MS);
      void initializeMap();
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        startLoading();
      }, { rootMargin: "200px" });
      observer.observe(container);
    } else {
      startLoading();
    }

    window.addEventListener("resize", resizeMap, { passive: true });
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(resizeMap);
      resizeObserver.observe(container);
    }

    return () => {
      active = false;
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeMap);
      clearLoadTimeout();
      if (resizeFrameId !== undefined) window.cancelAnimationFrame(resizeFrameId);
      map?.remove();
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
        role="region"
        aria-label="Burem Elektronik OpenFreeMap haritası"
      >
        {mapStatus === "loading" && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center gap-3 bg-slate-100 text-sm font-medium text-slate-600"
            role="status"
            aria-live="polite"
          >
            <span
              className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
              aria-hidden="true"
            />
            Harita yükleniyor
          </div>
        )}
        {mapStatus === "error" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
            <p className="text-sm text-slate-600">
              Harita yüklenemedi. Adres ve yol tarifi bağlantısı kullanılabilir.
            </p>
            <a
              href={PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Haritada aç
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
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
          href={DIRECTIONS_URL}
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
