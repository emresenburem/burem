import assert from "node:assert/strict";
import { test } from "node:test";
import { applyPageMetadata, buildSitemapXml, productMeta, resolvePageMetadata } from "./seo-routes";

const product = {
  id: "p1", name: "8200 Vector", brand: "Lenze", category: "Sürücü",
  partNumber: "E82EV152_4C", description: null, imageUrl: null,
  price: null, currency: "TRY", condition: "used", inStock: true, isPublished: true,
} as any;

test("unpriced product HTML retains page metadata and breadcrumbs without Product JSON-LD", () => {
  const html = applyPageMetadata('<html><head><title>old</title><meta name="description" content="old"><meta property="og:url" content="old"><meta property="og:image" content="old"><meta name="twitter:image" content="old"><link rel="canonical" href="old"></head><body><div id="root"></div></body></html>', productMeta(product));
  assert.match(html, /<title>Lenze E82EV152_4C 8200 Vector Sürücü \| Burem Elektronik<\/title>/);
  assert.match(html, /<meta name="description" content="Lenze E82EV152_4C 8200 Vector Sürücü yedek parçası\./);
  assert.match(html, /og:url" content="https:\/\/www\.buremelektronik\.com\/magaza\/urun\/p1\//);
  assert.match(html, /og:image" content="https:\/\/www\.buremelektronik\.com\/logo\.png"/);
  assert.match(html, /twitter:image" content="https:\/\/www\.buremelektronik\.com\/logo\.png"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.buremelektronik\.com\/magaza\/urun\/p1\//);
  assert.doesNotMatch(html, /"@type":"Product"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /<h1>Lenze E82EV152_4C 8200 Vector Sürücü<\/h1>/);
  assert.match(html, /Stok ve fiyat bilgisi için Burem Elektronik ile iletişime geçin/);
  assert.doesNotMatch(html, /<p>\$1,200\.00<\/p>/);
  assert.match(html, /<a href="\/magaza\/marka\/lenze">Lenze<\/a>/);
  assert.doesNotMatch(html, /\.replit\.dev|localhost/);
});

test("priced product initial HTML embeds the exact currency, price and visible stock state", () => {
  const boschProduct = {
    ...product,
    id: "35155822-96ce-4912-aa5c-49c9e6144898",
    name: "Bosch Oransal Valf Kartı",
    brand: "Bosch",
    category: "Kart",
    partNumber: "0 811 405 061",
    price: "1200.00",
    currency: "USD",
    inStock: true,
  };
  const metadata = productMeta(boschProduct);
  const html = applyPageMetadata(
    '<html><head><title>old</title><meta name="description" content="old"><link rel="canonical" href="old"></head><body><div id="root"></div></body></html>',
    metadata,
  );
  const jsonLdScript = html.match(/<script id="burem-product-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLdScript);
  const jsonLd = JSON.parse(jsonLdScript[1]) as { "@graph": Array<Record<string, any>> };
  const graph = jsonLd["@graph"];
  assert.deepEqual(graph.map((item) => item["@type"]), ["Product", "BreadcrumbList"]);
  assert.deepEqual(graph[0].offers, {
    "@type": "Offer",
    url: metadata.canonical,
    price: "1200.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  });
  assert.equal(metadata.stock, "Stokta");
  assert.equal(metadata.price, "$1,200.00");
  assert.doesNotMatch(metadata.description, /fiyat bilgisi için.*iletişime geçin/i);
  assert.match(html, /<h1>0 811 405 061 Bosch Oransal Valf Kartı<\/h1>/);
  assert.match(html, /<p>\$1,200\.00<\/p>/);
  assert.match(html, /<p>Stokta<\/p>/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.ok(html.includes(`<link rel="canonical" href="${metadata.canonical}" />`));
});

test("sitemap is unique, production-origin-only, and excludes drafts", () => {
  const xml = buildSitemapXml([product, { ...product, id: "draft", isPublished: false }]);
  assert.equal((xml.match(/<loc>/g) ?? []).length, new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])).size);
  assert.match(xml, /https:\/\/www\.buremelektronik\.com\/magaza\/urun\/p1\//);
  assert.doesNotMatch(xml, /\/draft\//);
  assert.doesNotMatch(xml, /\.replit\.dev|localhost|\/api\/internal|\/admin/);
});

test("existing public service pages keep working and appear in the sitemap", async () => {
  const metadata = await resolvePageMetadata("/bursa-surucu-tamiri");
  assert.equal(metadata?.canonical, "https://www.buremelektronik.com/bursa-surucu-tamiri");
  assert.match(buildSitemapXml([product]), /https:\/\/www\.buremelektronik\.com\/bursa-surucu-tamiri/);
});

test("home initial HTML includes existing explanatory copy, crawlable service links, and linked site identity", async () => {
  const metadata = await resolvePageMetadata("/");
  assert.ok(metadata);
  const html = applyPageMetadata('<html><head><title>old</title></head><body><div id="root"></div></body></html>', metadata);
  assert.match(html, /<h1>Bursa Sürücü Tamiri \| Burem Elektronik<\/h1>/);
  assert.match(html, /inverter, servo sürücü, PLC, HMI/);
  assert.match(html, /<a href="\/lenze-surucu-tamiri">Lenze Sürücü Tamiri<\/a>/);
  assert.match(html, /<script id="burem-site-jsonld" type="application\/ld\+json">/);
  assert.match(html, /"@type":"LocalBusiness"/);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /#organization/);
  assert.doesNotMatch(html, /"@type":"Organization"/);
});

test("service initial HTML includes its existing description and crawlable links to existing pages", async () => {
  const metadata = await resolvePageMetadata("/bursa-surucu-tamiri");
  assert.ok(metadata);
  const html = applyPageMetadata('<html><head><title>old</title></head><body><div id="root"></div></body></html>', metadata);
  assert.match(html, /<h1>Bursa Sürücü Tamiri<\/h1>/);
  assert.match(html, /Bursa&#39;da endüstriyel sürücü arıza tespiti/);
  assert.match(html, /<a href="\/servo-surucu-tamiri">Servo Sürücü Tamiri<\/a>/);
  assert.match(html, /<a href="\/magaza">Yedek Parça Mağazası<\/a>/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.buremelektronik\.com\/bursa-surucu-tamiri"/);
});
