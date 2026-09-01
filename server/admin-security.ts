import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextFunction, Request, Response } from "express";

export const ADMIN_SESSION_IDLE_MS = 30 * 60 * 1000;
export const ADMIN_SESSION_MAX_AGE_MS = 30 * 60 * 1000;
export const SESSION_COOKIE_NAME = "connect.sid";

type AdminSession = {
  adminLoggedIn?: boolean;
  adminLastActivity?: number;
  csrfToken?: string;
};

function adminSession(req: Request) {
  return req.session as typeof req.session & AdminSession;
}

export function isStateChangingMethod(method: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

export function getCsrfToken(req: Request) {
  const current = adminSession(req);
  if (!current.csrfToken) {
    current.csrfToken = randomBytes(32).toString("hex");
  }
  return current.csrfToken;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (!isStateChangingMethod(req.method)) return next();

  const expected = adminSession(req).csrfToken;
  const provided = req.get("x-csrf-token") ?? req.body?.csrfToken;
  if (!expected || typeof provided !== "string") {
    return res.status(403).json({ error: "Geçersiz istek" });
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return res.status(403).json({ error: "Geçersiz istek" });
  }

  next();
}

export function touchAdminSession(req: Request) {
  const current = adminSession(req);
  current.adminLastActivity = Date.now();
  req.session.touch();
}

export function hasActiveAdminSession(req: Request) {
  const current = adminSession(req);
  if (!current.adminLoggedIn) return false;
  if (
    !current.adminLastActivity ||
    Date.now() - current.adminLastActivity > ADMIN_SESSION_IDLE_MS
  ) {
    return false;
  }
  return true;
}

function decodeBase32(secret: string) {
  const normalized = secret.toUpperCase().replace(/[\s-]/g, "").replace(/=+$/, "");
  if (!normalized || !/^[A-Z2-7]+$/.test(normalized)) return null;

  let bits = 0;
  let buffer = 0;
  const bytes: number[] = [];
  for (const character of normalized) {
    buffer = (buffer << 5) | "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(character);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

function totpForCounter(secret: Buffer, counter: number) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter >>> 0, 4);
  const digest = createHmac("sha256", secret).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secretValue: string | undefined, token: unknown) {
  if (!secretValue || typeof token !== "string" || !/^\d{6}$/.test(token)) {
    return false;
  }
  const secret = decodeBase32(secretValue);
  if (!secret) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  for (const offset of [-1, 0, 1]) {
    const expected = Buffer.from(totpForCounter(secret, currentCounter + offset));
    const provided = Buffer.from(token);
    if (timingSafeEqual(expected, provided)) return true;
  }
  return false;
}