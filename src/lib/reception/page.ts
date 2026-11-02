import { NextResponse } from "next/server";
import { privateHeaders, requestOrigin, readSession, receptionReturnPath, roleLabel } from "@/lib/reception/auth";
import { readAsset } from "@/lib/reception/assets";
import { backendRequest } from "@/lib/reception/backend";

export async function receptionPage(request: Request) {
  const session = readSession(request);
  if (!session) {
    const login = new URL("/reception/login", requestOrigin(request));
    const returnTo = receptionReturnPath(new URL(request.url).pathname.replace(/\/+$/, ""));
    if (returnTo !== "/reception") login.searchParams.set("next", returnTo);
    return NextResponse.redirect(login, { status: 303, headers: privateHeaders });
  }
  let plan: { records: Record<string, { data: unknown }>; serverTime: string };
  try {
    const response = await backendRequest("/state", {}, roleLabel(session.role));
    if (!response.ok) throw new Error("Shared plan unavailable");
    plan = await response.json();
    if (!plan.records?.event?.data || !plan.records?.live?.data || !plan.records?.notes?.data) throw new Error("Shared plan not initialized");
  } catch {
    return new Response("The reception plan is temporarily unavailable online. If this device was prepared, reopen its saved reception app offline.", { status: 503, headers: { ...privateHeaders, "content-type": "text/plain; charset=utf-8" } });
  }
  const backend = new URL(process.env.RECEPTION_BACKEND_URL!);
  const localOrigin = !process.env.VERCEL && backend.protocol === "http:" && ["127.0.0.1", "localhost"].includes(backend.hostname) ? " " + backend.origin : "";
  const shellSource = await readAsset("shell.html");
  const photoVideo = new URL(request.url).pathname.replace(/\/+$/, "") === "/reception/photo-video";
  const shell = photoVideo ? shellSource
    .replace("/reception/manifest.webmanifest", "/reception/photo-video.webmanifest")
    .replaceAll("Reception Desk", "Photo & Video Desk")
    .replace("Shared rundown, host cues, and offline media.", "Shoot schedule, shot list, crew checks and offline handovers.")
    .replace("Skip to reception plan", "Skip to the crew plan") : shellSource;
  const seed = { format: "reception-desk", schema: 1, siteId: "sherwin-franzy-reception-v1", createdAt: plan.serverTime, records: Object.fromEntries(Object.entries(plan.records).map(([key, record]) => [key, record.data])) };
  const payload = JSON.stringify({ ...seed, actor: roleLabel(session.role) }).replace(/</g, "\\u003c");
  return new Response(shell.replace("__RECEPTION_SEED__", payload), { headers: {
    ...privateHeaders, "content-type": "text/html; charset=utf-8", "x-reception-shell": "1",
    "content-security-policy": `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; media-src 'self' blob: https:${localOrigin}; connect-src 'self' https:${localOrigin}; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`,
  } });
}
