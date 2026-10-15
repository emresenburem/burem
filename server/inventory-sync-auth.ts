import { timingSafeEqual } from "node:crypto";

export function isValidInventorySyncAuthorization(
  authorizationHeader: string | undefined,
  configuredSecret: string | undefined,
): boolean {
  if (!configuredSecret) return false;

  const match = authorizationHeader?.match(/^Bearer ([^\s]+)$/i);
  if (!match) return false;

  const expected = Buffer.from(configuredSecret, "utf8");
  const provided = Buffer.from(match[1], "utf8");
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}
