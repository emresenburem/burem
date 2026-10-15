---
name: Inventory source of truth
description: Ownership boundaries for products synchronized from Burem İş Takip Cihaz Envanteri.
---

For products published from Burem İş Takip Cihaz Envanteri, İş Takip is the source of truth for core product details, stock status, and publication status. Keep those website fields read-only and do not hard-delete synchronized products as a substitute for unpublishing them.

**Why:** The user defined website publication as a synchronization from the tracker inventory; tracker updates must remain authoritative and idempotent.

**How to apply:** When changing the inventory sync contract or admin UI, preserve the source inventory ID as the stable key, update or unpublish through the tracker, and keep manual website products unaffected.
