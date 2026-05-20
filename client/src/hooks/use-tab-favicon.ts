import { useEffect } from "react";

const BRAND_LOGOS = [
  "https://www.logo.wine/a/logo/Siemens/Siemens-Logo.wine.svg",
  "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg",
  "https://www.logo.wine/a/logo/Schneider_Electric/Schneider_Electric-Logo.wine.svg",
  "https://www.logo.wine/a/logo/FANUC/FANUC-Logo.wine.svg",
  "https://www.logo.wine/a/logo/Yaskawa_Electric_Corporation/Yaskawa_Electric_Corporation-Logo.wine.svg",
  "https://www.logo.wine/a/logo/Omron/Omron-Logo.wine.svg",
  "https://www.logo.wine/a/logo/Mitsubishi/Mitsubishi-Logo.wine.svg",
  "https://cdn.worldvectorlogo.com/logos/beckhoff-logo.svg",
  "https://www.logo.wine/a/logo/Fuji_Electric/Fuji_Electric-Logo.wine.svg",
  "https://www.logo.wine/a/logo/Bosch_Rexroth/Bosch_Rexroth-Logo.wine.svg",
];

const ORIGINAL_FAVICON = "/favicon.png";
const INTERVAL_MS = 900;

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = href.endsWith(".svg") ? "image/svg+xml" : "image/png";
  link.href = href;
}

export function useTabFavicon() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let idx = 0;

    function onVisibilityChange() {
      if (document.hidden) {
        intervalId = setInterval(() => {
          setFavicon(BRAND_LOGOS[idx % BRAND_LOGOS.length]);
          idx++;
        }, INTERVAL_MS);
      } else {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
        idx = 0;
        setFavicon(ORIGINAL_FAVICON);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (intervalId !== null) clearInterval(intervalId);
      setFavicon(ORIGINAL_FAVICON);
    };
  }, []);
}
