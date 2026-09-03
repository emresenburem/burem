export const GA_MEASUREMENT_ID = "G-QF33B1H2GT";

export type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __buremGaInitialized?: boolean;
  }
}

export function currentPagePath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function initAnalytics() {
  if (typeof window === "undefined") return;

  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  if (!document.getElementById("burem-ga4-script")) {
    const script = document.createElement("script");
    script.id = "burem-ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  if (!window.__buremGaInitialized) {
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
    window.__buremGaInitialized = true;
  }
}

export function trackPageView(pagePath = currentPagePath()) {
  if (typeof window === "undefined") return;

  initAnalytics();
  window.gtag?.("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(eventName: string, parameters: AnalyticsParameters = {}) {
  if (typeof window === "undefined") return;

  initAnalytics();
  window.gtag?.("event", eventName, parameters);
}