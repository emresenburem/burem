---
name: Public npm lockfiles
description: Avoid Replit-only package URLs in lockfiles intended for external deployment platforms.
---

When regenerating a lockfile for external deployment, remove both the root lockfile and the installed dependency tree before installing from the public npm registry. Ensure registry-resolved fields are not omitted.

**Why:** Replit's hidden npm lock metadata can preserve a private package-firewall URL even when the root lockfile is deleted and npm receives an explicit public registry flag. Package-lock-only regeneration may also omit resolved URLs instead of replacing them.

**How to apply:** For Render or another external builder, perform a clean install using `https://registry.npmjs.org/`, retain explicit public resolved URLs, and verify the final lockfile contains no `replit.local` references.