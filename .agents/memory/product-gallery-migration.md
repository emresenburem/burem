---
name: Product gallery migration
description: Durable rules for adding multiple product images without breaking legacy catalog records.
---

The product gallery is additive: the existing cover URL remains the compatibility source for records that have no gallery rows, while new gallery rows become the ordered source of truth and keep the cover URL synchronized.

**Why:** Existing catalog records and public consumers may only know the legacy cover field, so replacing it would create broken images or require a risky data rewrite.

**How to apply:** Backfill only missing gallery rows, preserve existing product rows, and keep production schema changes as an explicit manual dry-run/apply operation rather than startup or build behavior.