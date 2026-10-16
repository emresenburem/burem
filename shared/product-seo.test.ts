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

test("structured data maps condition and stock and omits absent price", () => {
  const ld = productStructuredData(sample, "https://www.buremelektronik.com/p");
  const product = (ld["@graph"] as Array<Record<string, unknown>>)[0];
  assert.equal(product.itemCondition, "https://schema.org/UsedCondition");
  assert.equal(product.mpn, "E82EV152_4C");
  assert.equal(product.offers, undefined);
  const out = productStructuredData({ ...sample, inStock: false, price: "20" }, "https://www.buremelektronik.com/p");
  const offer = ((out["@graph"] as Array<Record<string, any>>)[0].offers);
  assert.equal(offer.availability, "https://schema.org/OutOfStock");
});
