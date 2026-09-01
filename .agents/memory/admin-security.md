---
name: Admin security posture
description: Durable constraints for the single-admin authentication and deployment setup.
---

Admin authentication must remain environment-variable-only: never add default
credentials, expose secrets to the client, or generate a 2FA secret
automatically. Production deployment requires a strong `SESSION_SECRET`;
`ADMIN_TOTP_SECRET` is an optional manually provisioned Base32 secret.

**Why:** The admin panel handles service and catalog operations, so convenience
fallbacks would turn a deployment misconfiguration into an accessible account.

**How to apply:** Keep admin routes server-protected with session, CSRF, idle
timeout, and rate-limit checks. Document any required production environment
variables without recording their values.