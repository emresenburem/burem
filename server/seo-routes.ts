import { storage } from "./storage";
import type { Product } from "@shared/schema";
import { DEFAULT_OG_IMAGE, HOME_CANONICAL_URL, HOME_PAGE_DESCRIPTION, HOME_PAGE_TITLE, SITE_IDENTITY_JSONLD, SITE_ORIGIN } from "@shared/site-seo";
import { productSeoDescription, productSeoPath, productSeoTitle, productStructuredData, slugifyProductPart } from "@shared/product-seo";

type SeoProduct = Product;
type PageMeta = {
  title: string; description: string; canonical?: string; noindex?: boolean;
  status?: number;
  h1?: string; intro?: string; image?: string; stock?: string;
  links?: Array<{ href: string; label: string }>;
  jsonLd?: Record<string, unknown>;
  siteJsonLd?: Record<string, unknown>;
};

const publicStaticPages: Record<string, { title: string; description: string }> = {
  "/bursa-surucu-tamiri": { title: "Bursa Sürücü Tamiri | Burem Elektronik", description: "Bursa'da endüstriyel sürücü arıza tespiti, onarım ve test hizmetleri." },
  "/servo-surucu-tamiri": { title: "Servo Sürücü Tamiri | Burem Elektronik", description: "Endüstriyel servo sürücüler için arıza tespiti ve onarım hizmeti." },
  "/inverter-tamiri": { title: "İnverter Tamiri | Burem Elektronik", description: "Endüstriyel inverter ve frekans konvertörü tamir hizmetleri." },
  "/plc-tamiri": { title: "PLC Tamiri | Burem Elektronik", description: "Endüstriyel PLC arıza tespiti ve onarım hizmeti." },
  "/hmi-operator-panel-tamiri": { title: "HMI Operatör Paneli Tamiri | Burem Elektronik", description: "Endüstriyel HMI ve operatör panelleri için teknik servis." },
  "/endustriyel-elektronik-kart-tamiri": { title: "Endüstriyel Elektronik Kart Tamiri | Burem Elektronik", description: "Endüstriyel elektronik kart arıza tespiti ve onarımı." },
  "/siemens-surucu-tamiri": { title: "Siemens Sürücü Tamiri | Burem Elektronik", description: "Siemens endüstriyel sürücüler için tamir ve test hizmeti." },
  "/fanuc-servo-surucu-tamiri": { title: "Fanuc Servo Sürücü Tamiri | Burem Elektronik", description: "Fanuc servo sürücüler için arıza tespiti ve onarım." },
  "/abb-surucu-tamiri": { title: "ABB Sürücü Tamiri | Burem Elektronik", description: "ABB endüstriyel sürücüler için teknik servis." },
  "/lenze-surucu-tamiri": { title: "Lenze Sürücü Tamiri | Burem Elektronik", description: "Lenze endüstriyel sürücüler için tamir ve test hizmeti." },
  "/mitsubishi-servo-surucu-tamiri": { title: "Mitsubishi Servo Sürücü Tamiri | Burem Elektronik", description: "Mitsubishi servo sürücüler için arıza tespiti ve onarım." },
  "/takip": { title: "Servis Takip | Burem Elektronik", description: "Burem Elektronik servis kaydınızın durumunu takip edin." },
};

const abs = (path: string) => new URL(path, `${SITE_ORIGIN}/`).toString();
const published = (p: SeoProduct) => p.isPublished !== false;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const itemUrl = (p: SeoProduct) => abs(productSeoPath(p));
const serviceLinks = Object.entries(publicStaticPages)
  .filter(([href]) => href !== "/takip")
  .map(([href, page]) => ({ href, label: page.title.split("|")[0].trim() }));

export function productMeta(product: SeoProduct): PageMeta {
  const canonical = itemUrl(product);
  const title = productSeoTitle(product);
  const description = productSeoDescription(product);
  return {
    title, description, canonical, h1: title.replace(/ \| Burem Elektronik$/, ""),
    intro: description, image: product.imageUrl ?? undefined,
    stock: product.inStock === true ? "Stokta" : "Stokta Yok",
    links: [
      { href: "/magaza", label: "Yedek Parça Kataloğu" },
      { href: `/magaza/kategori/${encodeURIComponent(slugifyProductPart(product.category))}`, label: product.category },
      { href: `/magaza/marka/${encodeURIComponent(slugifyProductPart(product.brand))}`, label: product.brand },
    ],
    jsonLd: productStructuredData(product, canonical),
  };
}

export async function resolvePageMetadata(pathname: string): Promise<PageMeta | null> {
  if (pathname === "/") {
    return {
      title: HOME_PAGE_TITLE,
      description: HOME_PAGE_DESCRIPTION,
      canonical: HOME_CANONICAL_URL,
      h1: HOME_PAGE_TITLE,
      intro: HOME_PAGE_DESCRIPTION,
      links: [...serviceLinks, { href: "/magaza", label: "Yedek Parça Mağazası" }],
      siteJsonLd: SITE_IDENTITY_JSONLD,
    };
  }
  if (pathname === "/magaza" || pathname === "/magaza/") {
    const products = (await storage.getProducts()).filter(published);
    const links = new Map<string, string>();
    for (const p of products) {
      if (p.brand) links.set(`/magaza/marka/${encodeURIComponent(slugifyProductPart(p.brand))}`, `${p.brand} markası`);
      if (p.category) links.set(`/magaza/kategori/${encodeURIComponent(slugifyProductPart(p.category))}`, `${p.category} kategorisi`);
    }
    return { title: "Endüstriyel Yedek Parça Mağazası | Burem Elektronik", description: "Yayındaki endüstriyel yedek parçaları marka, kategori ve model numarasına göre inceleyin.", canonical: abs("/magaza"), h1: "Endüstriyel Yedek Parçalar", intro: "Yayındaki ürünleri marka, kategori ve model numarasına göre inceleyin.", links: Array.from(links, ([href, label]) => ({ href, label })) };
  }
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  if (publicStaticPages[normalizedPath]) {
    const page = publicStaticPages[normalizedPath];
    if (normalizedPath === "/takip") return { ...page, canonical: abs(normalizedPath) };
    return {
      ...page,
      canonical: abs(normalizedPath),
      h1: page.title.split("|")[0].trim(),
      intro: page.description,
      links: [...serviceLinks.filter((link) => link.href !== normalizedPath), { href: "/magaza", label: "Yedek Parça Mağazası" }],
    };
  }
  const brandServicePage = normalizedPath.match(/^\/brand\/([^/]+)$/);
  if (brandServicePage) {
    const name = decodeURIComponent(brandServicePage[1]);
    return { title: `${name} | Burem Elektronik`, description: `${name} endüstriyel ürün ve servis bilgileri.`, canonical: abs(normalizedPath) };
  }
  if (normalizedPath === "/admin" || normalizedPath === "/admin/servis") {
    return { title: "Yönetim | Burem Elektronik", description: "Yönetim paneli.", canonical: abs(normalizedPath), noindex: true };
  }
  const productMatch = pathname.match(/^\/magaza\/urun\/([^/]+)\/([^/]+)\/?$/);
  if (productMatch) {
    let id: string;
    try { id = decodeURIComponent(productMatch[1]); } catch { return null; }
    const product = await storage.getProduct(id);
    if (!product || !published(product)) return { title: "Ürün bulunamadı | Burem Elektronik", description: "Aradığınız ürün yayında değil veya mevcut değil.", noindex: true, status: 404, h1: "Ürün bulunamadı", intro: "Bu ürün herkese açık katalogda bulunmuyor." };
    return productMeta(product);
  }
  const collection = pathname.match(/^\/magaza\/(marka|kategori)\/([^/]+)\/?$/);
  if (collection) {
    let slug: string;
    try { slug = decodeURIComponent(collection[2]); } catch { return null; }
    const isBrand = collection[1] === "marka";
    const products = (await storage.getProducts()).filter(published).filter((p) => slugifyProductPart(isBrand ? p.brand : p.category) === slug);
    if (!products.length) return null;
    const label = isBrand ? products[0].brand : products[0].category;
    const canonical = abs(`/magaza/${isBrand ? "marka" : "kategori"}/${encodeURIComponent(slug)}`);
    const title = isBrand ? `${label} Yedek Parçaları | Burem Elektronik` : `${label} | Endüstriyel Yedek Parçalar | Burem Elektronik`;
    return {
      title, description: `${label} için yayındaki endüstriyel yedek parçalar. Ürünleri model numarası ve stok bilgisiyle inceleyin.`,
      canonical, h1: isBrand ? `${label} Yedek Parçaları` : `${label} Yedek Parçalar`,
      intro: `Yayındaki ${label} ürünlerini model numarası ve stok bilgisiyle inceleyin.`,
      links: products.map((p) => ({ href: productSeoPath(p), label: `${p.name}${p.partNumber ? ` — ${p.partNumber}` : ""}` })),
      jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: canonical,
        mainEntity: { "@type": "ItemList", itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: itemUrl(p), name: p.name })) } },
    };
  }
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return null;
  return null;
}

export function buildSitemapXml(products: SeoProduct[]): string {
  products = products.filter(published);
  const paths = new Set(["/", "/magaza", ...Object.keys(publicStaticPages)]);
  const brands = new Set<string>();
  const categories = new Set<string>();
  for (const p of products) {
    if (p.brand) brands.add(slugifyProductPart(p.brand));
    if (p.category) categories.add(slugifyProductPart(p.category));
    paths.add(productSeoPath(p));
  }
  brands.forEach((slug) => paths.add(`/magaza/marka/${encodeURIComponent(slug)}`));
  categories.forEach((slug) => paths.add(`/magaza/kategori/${encodeURIComponent(slug)}`));
  const urls = Array.from(paths).map((p) => `<url><loc>${esc(abs(p))}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export async function getSitemapXml(): Promise<string> {
  return buildSitemapXml(await storage.getProducts());
}

export function applyPageMetadata(html: string, meta: PageMeta): string {
  const set = (pattern: RegExp, tag: string) => {
    html = pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `${tag}</head>`);
  };
  const title = esc(meta.title);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  set(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(meta.description)}" />`);
  const tags: Array<[RegExp, string]> = [
    [/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`],
    [/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(meta.description)}" />`],
    [/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${esc(meta.canonical ?? SITE_ORIGIN)}" />`],
    [/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`],
    [/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />`],
    [/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`],
    [/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${esc(meta.description)}" />`],
  ];
  for (const [pattern, tag] of tags) set(pattern, tag);
  const canonical = meta.canonical ? `<link rel="canonical" href="${esc(meta.canonical)}" />` : "";
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html) ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical) : html.replace("</head>", `${canonical}</head>`);
  html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, "");
  if (meta.noindex) set(/<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="noindex,nofollow,noarchive" />`);
  html = html.replace(/<script[^>]+id=["']burem-product-jsonld["'][^>]*>[\s\S]*?<\/script>/i, "");
  if (meta.jsonLd) html = html.replace("</head>", `<script id="burem-product-jsonld" type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script></head>`);
  html = html.replace(/<script[^>]+id=["']burem-site-jsonld["'][^>]*>[\s\S]*?<\/script>/i, "");
  if (meta.siteJsonLd) html = html.replace("</head>", `<script id="burem-site-jsonld" type="application/ld+json">${JSON.stringify(meta.siteJsonLd).replace(/</g, "\\u003c")}</script></head>`);
  if (meta.h1) {
    const nav = (meta.links?.length ? `<nav aria-label="Related pages"><ul>${meta.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join("")}</ul></nav>` : "");
    const initial = `<main><h1>${esc(meta.h1)}</h1><p>${esc(meta.intro ?? "")}</p>${meta.stock ? `<p>${esc(meta.stock)}</p>` : ""}${nav}</main>`;
    html = html.replace('<div id="root"></div>', `<div id="root">${initial}</div>`);
  }
  return html;
}
