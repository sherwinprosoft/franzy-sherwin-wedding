import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const derive = (password: string, salt: string) => new Promise<Buffer>((resolve, reject) => {
  scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
    if (error) reject(error); else resolve(key);
  });
});
const COOKIE = "reception_session";
const LIFETIME = 30 * 24 * 60 * 60;
export type ReceptionRole = "host" | "coordinator";
export type ReceptionSession = { role: ReceptionRole; exp: number; credential: string };
const roles: ReceptionRole[] = ["host", "coordinator"];
export const privateHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "referrer-policy": "same-origin",
};
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: privateHeaders });
}
export function roleLabel(role: ReceptionRole) {
  return role === "host" ? "Host" : "Coordinator";
}
function passwordHash(role: ReceptionRole) {
  return process.env[role === "host" ? "RECEPTION_HOST_PASSWORD_HASH" : "RECEPTION_COORDINATOR_PASSWORD_HASH"] || "";
}
function signingSecret() {
  const secret = process.env.RECEPTION_SESSION_SECRET || "";
  return secret.length >= 32 ? secret : "";
}
export function accessConfigured() {
  return !!signingSecret() && roles.every(role => /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash(role)));
}
function fingerprint(role: ReceptionRole) {
  return createHash("sha256").update(passwordHash(role)).digest("hex");
}
function same(a: string, b: string) {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export async function verifyPassword(role: string, password: string): Promise<ReceptionRole | null> {
  if (!accessConfigured() || !roles.includes(role as ReceptionRole) || password.length > 1024) return null;
  const validRole = role as ReceptionRole;
  const [, salt, expected] = passwordHash(validRole).split(":");
  const actual = await derive(password, salt);
  return same(actual.toString("hex"), expected) ? validRole : null;
}
export function readSession(request: Request): ReceptionSession | null {
  if (!accessConfigured()) return null;
  try {
    const value = (request.headers.get("cookie") || "").split(";").map(part => part.trim()).find(part => part.startsWith(COOKIE + "="))?.slice(COOKIE.length + 1);
    if (!value || value.length > 1000) return null;
    const [body, signature, extra] = value.split(".");
    if (!body || !signature || extra) return null;
    const expected = createHmac("sha256", signingSecret()).update(body).digest("base64url");
    if (!same(signature, expected)) return null;
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ReceptionSession;
    if (!roles.includes(session.role) || !Number.isSafeInteger(session.exp) || session.exp <= Date.now() || !same(session.credential || "", fingerprint(session.role))) return null;
    return session;
  } catch { return null; }
}
export function sessionCookie(response: NextResponse, request: Request, role: ReceptionRole | null) {
  const body = role ? Buffer.from(JSON.stringify({ role, exp: Date.now() + LIFETIME * 1000, credential: fingerprint(role), nonce: randomBytes(16).toString("hex") })).toString("base64url") : "";
  const token = role ? body + "." + createHmac("sha256", signingSecret()).update(body).digest("base64url") : "";
  response.cookies.set(COOKIE, token, { httpOnly: true, secure: requestOrigin(request).startsWith("https:"), sameSite: "strict", path: "/", maxAge: role ? LIFETIME : 0 });
  return response;
}
// Next may construct request.url with an internal host behind a reverse proxy.
// Validate the browser origin against the actual request host and scheme.
export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const protocol = (request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1)).split(",")[0].trim();
  const host = request.headers.get("host") || url.host;
  return new URL(`${protocol}://${host}`).origin;
}
export function writeAllowed(request: Request) {
  return request.headers.get("x-reception-request") === "1" && request.headers.get("origin") === requestOrigin(request);
}
export function loginOriginAllowed(request: Request) {
  return request.headers.get("origin") === requestOrigin(request);
}
export function attemptKey(request: Request, role: string) {
  const ip = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "local";
  return createHmac("sha256", signingSecret()).update(role + ":" + ip.split(",")[0].trim()).digest("hex");
}
export function requireSession(request: Request) {
  const session = readSession(request);
  return session ? { session, error: null } : { session: null, error: json({ error: "Please sign in to Reception Desk." }, 401) };
}

export function receptionReturnPath(value: string | null) {
  const requested = value || "/reception";
  return ["/reception", "/reception/church-checklist", "/reception/reception-checklist", "/reception/photo-video"].includes(requested) ? requested : "/reception";
}
