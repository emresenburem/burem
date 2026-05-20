import { useEffect } from "react";

const BRANDS = [
  { name: "Siemens",    logo: "https://www.logo.wine/a/logo/Siemens/Siemens-Logo.wine.svg" },
  { name: "ABB",        logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg" },
  { name: "Schneider",  logo: "https://www.logo.wine/a/logo/Schneider_Electric/Schneider_Electric-Logo.wine.svg" },
  { name: "Fanuc",      logo: "https://www.logo.wine/a/logo/FANUC/FANUC-Logo.wine.svg" },
  { name: "Yaskawa",   logo: "https://www.logo.wine/a/logo/Yaskawa_Electric_Corporation/Yaskawa_Electric_Corporation-Logo.wine.svg" },
  { name: "Omron",      logo: "https://www.logo.wine/a/logo/Omron/Omron-Logo.wine.svg" },
  { name: "Mitsubishi", logo: "https://www.logo.wine/a/logo/Mitsubishi/Mitsubishi-Logo.wine.svg" },
  { name: "Beckhoff",   logo: "https://cdn.worldvectorlogo.com/logos/beckhoff-logo.svg" },
  { name: "Fuji",       logo: "https://www.logo.wine/a/logo/Fuji_Electric/Fuji_Electric-Logo.wine.svg" },
  { name: "Rexroth",    logo: "https://www.logo.wine/a/logo/Bosch_Rexroth/Bosch_Rexroth-Logo.wine.svg" },
  { name: "Lenze",      logo: "https://findlogovector.com/wp-content/uploads/2019/04/lenze-logo-vector.png" },
  { name: "Danfoss",    logo: "https://findlogovector.com/wp-content/uploads/2018/09/danfoss-logo-vector.png" },
];

const ORIGINAL_FAVICON = "/favicon.svg";
const ORIGINAL_TITLE   = "Burem Elektronik | Endüstriyel Sürücü Tamiri";
const INTERVAL_MS      = 900;

const SLIDE_CHARS = 14;

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = href.endsWith(".svg") ? "image/svg+xml" : "image/png";
  link.href = href + (href.includes("?") ? "&" : "?") + "_t=" + Date.now();
}

function restoreFavicon() {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/svg+xml";
  link.href = ORIGINAL_FAVICON;
}

export function useTabFavicon() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let tickerInterval: ReturnType<typeof setInterval> | null = null;
    let idx = 0;

    // Ticker: marquee-style title using the brand name
    function startTicker(brandName: string) {
      if (tickerInterval !== null) clearInterval(tickerInterval);
      const label = `  ·  ${brandName}  ·  Burem Elektronik`;
      let pos = 0;
      tickerInterval = setInterval(() => {
        const visible = (label + label).slice(pos, pos + SLIDE_CHARS);
        document.title = visible + "  ◀";
        pos = (pos + 1) % label.length;
      }, 80);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        idx = 0;
        const brand = BRANDS[idx % BRANDS.length];
        setFavicon(brand.logo);
        startTicker(brand.name);

        intervalId = setInterval(() => {
          idx++;
          const b = BRANDS[idx % BRANDS.length];
          setFavicon(b.logo);
          startTicker(b.name);
        }, INTERVAL_MS);
      } else {
        if (intervalId !== null)   { clearInterval(intervalId);  intervalId = null; }
        if (tickerInterval !== null) { clearInterval(tickerInterval); tickerInterval = null; }
        idx = 0;
        restoreFavicon();
        document.title = ORIGINAL_TITLE;
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (intervalId !== null)    clearInterval(intervalId);
      if (tickerInterval !== null) clearInterval(tickerInterval);
      restoreFavicon();
      document.title = ORIGINAL_TITLE;
    };
  }, []);
}
