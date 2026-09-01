---
name: Product catalog SEO
description: Rules for structured data on Burem Elektronik spare-part pages.
---

Product detail JSON-LD should contain only verified catalog fields such as name, brand, category, image, and part number. Do not emit fabricated prices, ratings, reviews, or `Offer` data when those values are not stored.

**Why:** The catalog is quote-based through WhatsApp rather than price-based, so invented commerce claims would be inaccurate and could damage search trust.

**How to apply:** When adding product metadata or structured data, prefer omission over placeholders; add commerce fields only after real product fields and their semantics are available.