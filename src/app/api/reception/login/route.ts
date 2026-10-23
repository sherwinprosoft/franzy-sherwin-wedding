import { NextResponse } from "next/server";
import { accessConfigured, attemptKey, json, loginOriginAllowed, privateHeaders, requestOrigin, sessionCookie, verifyPassword } from "@/lib/reception/auth";
import { backendRequest } from "@/lib/reception/backend";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!loginOriginAllowed(request)) return json({ error: "Please open the reception sign-in page." }, 403);
  const redirect = (error: string) => NextResponse.redirect(new URL("/reception/login?error=" + error, requestOrigin(request)), { status: 303, headers: privateHeaders });
  if (!accessConfigured()) return redirect("unavailable");
  const text = await request.text(); if (text.length > 5000) return json({ error: "Invalid sign-in" }, 413);
  const data = new URLSearchParams(text), role = data.get("role") || "", password = data.get("password") || "";
  const key = attemptKey(request, ["host", "coordinator"].includes(role) ? role : "host");
  try {
    const attempt = await backendRequest("/auth/attempt", { method: "POST", body: JSON.stringify({ key }) });
    if (attempt.status === 429) return redirect("retry");
    if (!attempt.ok) return redirect("unavailable");
    const validRole = await verifyPassword(role, password);
    if (!validRole) return redirect("invalid");
    await backendRequest("/auth/clear", { method: "POST", body: JSON.stringify({ key }) });
    return sessionCookie(NextResponse.redirect(new URL("/reception", requestOrigin(request)), { status: 303, headers: privateHeaders }), request, validRole);
  } catch { return redirect("unavailable"); }
}
