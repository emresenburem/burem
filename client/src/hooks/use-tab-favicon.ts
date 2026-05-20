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
  { name: "Lenze",      logo: "https://findlogovector.com/wp-content/uploads/2019/04/lenze-logo-vector.png" },
  { name: "Danfoss",    logo: "https://findlogovector.com/wp-content/uploads/2018/09/danfoss-logo-vector.png" },
  { name: "Rexroth",    logo: "https://www.logo.wine/a/logo/Bosch_Rexroth/Bosch_Rexroth-Logo.wine.svg" },
];

const ORIGINAL_FAVICON = "/favicon.svg";
const ORIGINAL_TITLE   = "Burem Elektronik | Endüstriyel Sürücü Tamiri";
const TICK_MS          = 60;   // ms per character frame
const HOLD_FRAMES      = 18;   // frames to hold full name
const PAD              = 10;   // blank padding width

function setFavicon(href: string) {
  const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    ?? Object.assign(document.createElement("link"), { rel: "icon" });
  if (!link.parentNode) document.head.appendChild(link);
  link.type = href.endsWith(".svg") ? "image/svg+xml" : "image/png";
  link.href = href;
}

function restoreFavicon() {
  setFavicon(ORIGINAL_FAVICON);
}

// Build frame sequence for one brand: slide-in → hold → slide-out
function buildFrames(name: string): string[] {
  const label = `◀ ${name}`;
  const frames: string[] = [];
  const pad = " ".repeat(PAD);

  // slide in: reveal characters left-to-right from right edge
  for (let i = 1; i <= label.length; i++) {
    frames.push(pad.slice(0, label.length - i) + label.slice(0, i));
  }
  // hold
  for (let h = 0; h < HOLD_FRAMES; h++) frames.push(label);
  // slide out: erase characters from left
  for (let i = 1; i <= label.length; i++) {
    frames.push(" ".repeat(i) + label.slice(i));
  }

  return frames;
}

export function useTabFavicon() {
  useEffect(() => {
    let stopped = false;
    let brandIdx = 0;

    async function runAnimation() {
      while (!stopped) {
        const brand = BRANDS[brandIdx % BRANDS.length];

        // Switch favicon + start this brand's slide
        setFavicon(brand.logo);
        const frames = buildFrames(brand.name);

        for (const frame of frames) {
          if (stopped) return;
          document.title = frame;
          await new Promise<void>((r) => setTimeout(r, TICK_MS));
        }

        brandIdx++;
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stopped = false;
        brandIdx = 0;
        runAnimation();
      } else {
        stopped = true;
        restoreFavicon();
        document.title = ORIGINAL_TITLE;
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      restoreFavicon();
      document.title = ORIGINAL_TITLE;
    };
  }, []);
}
