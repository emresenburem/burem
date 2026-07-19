import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
}

const BASE_URL = "https://www.buremelektronik.com";
const DEFAULT_TITLE = "Burem Elektronik | Endüstriyel Sürücü Tamiri";

function setMetaTag(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function SEO({ title, description, canonical, ogTitle, ogDescription, ogType = "website" }: SEOProps) {
  useEffect(() => {
    document.title = title;

    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", ogTitle ?? title);
    setMetaTag("property", "og:description", ogDescription ?? description);
    setMetaTag("property", "og:url", `${BASE_URL}${canonical}`);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("name", "twitter:title", ogTitle ?? title);
    setMetaTag("name", "twitter:description", ogDescription ?? description);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${BASE_URL}${canonical}`);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogType]);

  return null;
}
