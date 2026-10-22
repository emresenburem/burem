import assert from "node:assert/strict";
import { test } from "node:test";
import { productSeoDescription, productSeoPath, productSeoSlug, productSeoTitle, productStructuredData } from "./product-seo";

const sample = {
  id: "p1", name: "8200 Vector", brand: "Lenze", category: "Sürücü",
  partNumber: "E82EV152_4C", condition: "used", inStock: true,
  description: null, imageUrl: null, price: null, currency: "TRY",
};

test("product slug and canonical path preserve exact model identifiers", () => {
  assert.equal(productSeoSlug(sample), "lenze-E82EV152_4C-8200-vector");
  assert.equal(productSeoPath(sample), "/magaza/urun/p1/lenze-E82EV152_4C-8200-vector");
});

test("title and description use catalog facts without inventing specifications", () => {
  assert.equal(productSeoTitle(sample), "Lenze E82EV152_4C 8200 Vector Sürücü | Burem Elektronik");
  assert.match(productSeoDescription(sample), /E82EV152_4C/);
  assert.doesNotMatch(productSeoDescription(sample), /400 V|1\.5 kW/);
});

test("priced product description does not claim that customers must contact for its price", () => {
  const description = productSeoDescription({ ...sample, price: "1200.00", currency: "USD" });
  assert.match(description, /yedek parçası\./);
  assert.doesNotMatch(description, /fiyat bilgisi için.*iletişime geçin/i);
});

test("unpriced product JSON-LD keeps breadcrumbs but omits the Product entity", () => {
  const ld = productStructuredData(sample, "https://www.buremelektronik.com/p");
  const graph = ld["@graph"] as Array<Record<string, any>>;
  assert.deepEqual(graph.map((item) => item["@type"]), ["BreadcrumbList"]);
  assert.equal(graph[0].itemListElement.length, 5);
  assert.equal(graph[0].itemListElement[4].item, "https://www.buremelektronik.com/p");
});

test("positive verified price and currency create Product and matching Offer data", () => {
  const ld = productStructuredData(
    { ...sample, price: "1250.50", currency: "TRY", inStock: true },
    "https://www.buremelektronik.com/p",
  );
  const graph = ld["@graph"] as Array<Record<string, any>>;
  assert.deepEqual(graph.map((item) => item["@type"]), ["Product", "BreadcrumbList"]);
  const product = graph[0];
  assert.equal(product.itemCondition, "https://schema.org/UsedCondition");
  assert.equal(product.mpn, "E82EV152_4C");
  assert.deepEqual(product.offers, {
    "@type": "Offer",
    url: "https://www.buremelektronik.com/p",
    price: "1250.50",
    priceCurrency: "TRY",
    availability: "https://schema.org/InStock",
  });
  assert.equal(product.review, undefined);
  assert.equal(product.aggregateRating, undefined);
});

test("Offer availability reflects the visible out-of-stock state", () => {
  const ld = productStructuredData(
    { ...sample, inStock: false, price: "20", currency: "USD" },
    "https://www.buremelektronik.com/p",
  );
  const product = (ld["@graph"] as Array<Record<string, any>>)[0];
  const offer = product.offers;
  assert.equal(offer.availability, "https://schema.org/OutOfStock");
  assert.equal(offer.priceCurrency, "USD");
});

test("zero, invalid, or currency-less prices do not create Product JSON-LD", () => {
  for (const overrides of [
    { price: "0", currency: "TRY" },
    { price: "-1", currency: "TRY" },
    { price: "not-a-price", currency: "TRY" },
    { price: "20", currency: null },
    { price: "20", currency: "EUR" },
  ]) {
    const ld = productStructuredData({ ...sample, ...overrides }, "https://www.buremelektronik.com/p");
    assert.deepEqual(
      (ld["@graph"] as Array<Record<string, unknown>>).map((item) => item["@type"]),
      ["BreadcrumbList"],
    );
  }
});
