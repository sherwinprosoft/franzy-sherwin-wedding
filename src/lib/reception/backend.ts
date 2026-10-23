import { json, privateHeaders } from "./auth";

export function backendConfigured() {
  try {
    const url = new URL(process.env.RECEPTION_BACKEND_URL || "");
    const local = !process.env.VERCEL && ["127.0.0.1", "localhost"].includes(url.hostname);
    return (url.protocol === "https:" || local && url.protocol === "http:") && (process.env.RECEPTION_BACKEND_SECRET || "").length >= 32;
  } catch { return false; }
}
export async function backendRequest(path: string, options: RequestInit = {}, actor = "Reception team") {
  if (!backendConfigured()) throw new Error("RECEPTION_BACKEND_NOT_CONFIGURED");
  return fetch(new URL(path, process.env.RECEPTION_BACKEND_URL), {
    ...options,
    cache: "no-store",
    redirect: "error",
    headers: { "authorization": `Bearer ${process.env.RECEPTION_BACKEND_SECRET}`, "x-reception-actor": actor, "content-type": "application/json", ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
}
export async function proxyJSON(path: string, options: RequestInit = {}, actor?: string) {
  try {
    const response = await backendRequest(path, options, actor);
    if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Unexpected backend response");
    const body = await response.text();
    return new Response(body, { status: response.status, headers: { ...privateHeaders, "content-type": "application/json" } });
  } catch {
    return json({ error: "Shared editing is temporarily unavailable. Your saved device copy and downloaded files remain available." }, 503);
  }
}
