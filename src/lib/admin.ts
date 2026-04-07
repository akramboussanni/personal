import crypto from "node:crypto";

export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getAdminUsername(): string {
  return process.env.PORTFOLIO_ADMIN_USERNAME || "admin";
}

function getAdminPassword(): string | undefined {
  return process.env.PORTFOLIO_ADMIN_PASSWORD || process.env.PORTFOLIO_ADMIN_TOKEN;
}

function getSessionSecret(): string {
  return process.env.PORTFOLIO_ADMIN_SESSION_SECRET || process.env.PORTFOLIO_ADMIN_TOKEN || "portfolio-dev-secret";
}

function signPayload(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function parseCookies(request: Request): Record<string, string> {
  const raw = request.headers.get("cookie") || "";
  const pairs = raw.split(";").map((item) => item.trim()).filter(Boolean);
  const out: Record<string, string> = {};

  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }

  return out;
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword());
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const requiredPassword = getAdminPassword();
  if (!requiredPassword) return true;
  return username === getAdminUsername() && password === requiredPassword;
}

export function createAdminSession(username: string): string {
  const issuedAt = Date.now().toString();
  const payload = `${username}.${issuedAt}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function isValidAdminSession(sessionToken: string): boolean {
  const parts = sessionToken.split(".");
  if (parts.length !== 3) return false;

  const [username, issuedAtRaw, signature] = parts;
  if (!username || !issuedAtRaw || !signature) return false;
  if (username !== getAdminUsername()) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > SESSION_TTL_MS) return false;

  const payload = `${username}.${issuedAtRaw}`;
  const expected = signPayload(payload);

  if (signature.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function isAdminAuthorized(request: Request): boolean {
  if (!isAdminConfigured()) {
    return true;
  }

  const providedToken = request.headers.get("x-admin-token") || "";
  const fallbackToken = process.env.PORTFOLIO_ADMIN_TOKEN || "";
  if (providedToken && fallbackToken && providedToken === fallbackToken) {
    return true;
  }

  const cookies = parseCookies(request);
  const sessionToken = cookies[ADMIN_SESSION_COOKIE] || "";
  return Boolean(sessionToken) && isValidAdminSession(sessionToken);
}
