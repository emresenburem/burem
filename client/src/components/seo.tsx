import { useEffect } from "react";
import { SITE_URL } from "@/lib/site-contact";

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_TITLE = "Burem Elektronik | Endüstriyel Sürücü Tamiri";

function absoluteUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `${SITE_URL}${value}`;
}

function setMetaTag(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogType = "website",
  ogImage,
  ogImageAlt,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const canonicalUrl = absoluteUrl(canonical);
    const imageUrl = ogImage ? absoluteUrl(ogImage) : "";

    document.title = title;

    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", ogTitle ?? title);
    setMetaTag("property", "og:description", ogDescription ?? description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("name", "twitter:title", ogTitle ?? title);
    setMetaTag("name", "twitter:description", ogDescription ?? description);
    setMetaTag("name", "twitter:card", ogImage ? "summary_large_image" : "summary");
    setMetaTag("property", "og:image", imageUrl);
    setMetaTag("property", "og:image:alt", ogImageAlt ?? "");
    setMetaTag("name", "twitter:image", imageUrl);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalUrl);

    const existingJsonLd = document.getElementById("burem-product-jsonld");
    existingJsonLd?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = "burem-product-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      document.getElementById("burem-product-jsonld")?.remove();
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogType, ogImage, ogImageAlt, jsonLd]);

  return null;
}
