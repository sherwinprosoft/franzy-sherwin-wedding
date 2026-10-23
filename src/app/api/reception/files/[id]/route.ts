import { NextResponse } from "next/server";
import { json, privateHeaders, requireSession, roleLabel } from "@/lib/reception/auth";
import { backendRequest } from "@/lib/reception/backend";
type Context = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: Context) {
  const access = requireSession(request); if (access.error) return access.error;
  const { id } = await params;
  if (!/^[a-zA-Z0-9-]{12,100}$/.test(id)) return json({ error: "File not found" }, 404);
  try {
    const response = await backendRequest("/media/grant", { method: "POST", body: JSON.stringify({ id, method: "GET" }) }, roleLabel(access.session.role));
    if (!response.ok) return json({ error: "The file is temporarily unavailable." }, response.status);
    const grant = await response.json() as { url: string };
    if (new URL(request.url).searchParams.get("download") === "1") return json({ url: grant.url });
    return NextResponse.redirect(grant.url, { status: 307, headers: privateHeaders });
  } catch { return json({ error: "The file is temporarily unavailable. Saved device copies can still play offline." }, 503); }
}
export const HEAD = GET;
