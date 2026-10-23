import { NextResponse } from "next/server";
import { json, privateHeaders, requireSession, sessionCookie, writeAllowed } from "@/lib/reception/auth";
export async function POST(request: Request) {
  if (!writeAllowed(request)) return json({ error: "Please open Reception Desk." }, 403);
  const access = requireSession(request); if (access.error) return access.error;
  return sessionCookie(NextResponse.json({ ok: true }, { headers: privateHeaders }), request, null);
}
