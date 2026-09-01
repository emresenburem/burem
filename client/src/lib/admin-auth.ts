let csrfToken: string | null = null;

export async function ensureAdminCsrfToken() {
  if (csrfToken) return csrfToken;

  const response = await fetch("/api/admin/csrf", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Güvenlik doğrulaması başlatılamadı");

  const payload = await response.json() as { csrfToken?: string };
  if (!payload.csrfToken) throw new Error("Güvenlik doğrulaması başlatılamadı");
  csrfToken = payload.csrfToken;
  return csrfToken;
}

export function resetAdminCsrfToken() {
  csrfToken = null;
}

export async function adminRequest(method: string, url: string, body?: unknown) {
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (isMutation) headers["X-CSRF-Token"] = await ensureAdminCsrfToken();

  const response = await fetch(url, {
    method,
    headers,
    credentials: "same-origin",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401) throw new Error("__UNAUTHORIZED__");
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? response.statusText);
  }

  if (url === "/api/admin/login") resetAdminCsrfToken();
  if (url === "/api/admin/logout") resetAdminCsrfToken();
  return response.status === 204 ? null : response.json();
}