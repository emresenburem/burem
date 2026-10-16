import assert from "node:assert/strict";
import { test } from "node:test";
import { applyPageMetadata, buildSitemapXml, productMeta, resolvePageMetadata } from "./seo-routes";

const product = {
  id: "p1", name: "8200 Vector", brand: "Lenze", category: "Sürücü",
  partNumber: "E82EV152_4C", description: null, imageUrl: null,
  price: null, currency: "TRY", condition: "used", inStock: true, isPublished: true,
} as any;

test("server HTML includes production canonical, OG tags and both JSON-LD entities", () => {
  const html = applyPageMetadata('<html><head><title>old</title><meta name="description" content="old"><meta property="og:url" content="old"><meta property="og:image" content="old"><meta name="twitter:image" content="old"><link rel="canonical" href="old"></head><body><div id="root"></div></body></html>', productMeta(product));
  assert.match(html, /<title>Lenze E82EV152_4C 8200 Vector Sürücü \| Burem Elektronik<\/title>/);
  assert.match(html, /og:url" content="https:\/\/www\.buremelektronik\.com\/magaza\/urun\/p1\//);
  assert.match(html, /og:image" content="https:\/\/www\.buremelektronik\.com\/logo\.png"/);
  assert.match(html, /twitter:image" content="https:\/\/www\.buremelektronik\.com\/logo\.png"/);
  assert.match(html, /"@type":"Product"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.doesNotMatch(html, /\.replit\.dev|localhost/);
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
