import { NextResponse } from "next/server";
import { library } from "@/lib/reception/assets";
import { json, privateHeaders, requireSession, roleLabel } from "@/lib/reception/auth";
import { backendRequest } from "@/lib/reception/backend";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ file: string }> };
export async function GET(request: Request, { params }: Context) {
  const access = requireSession(request); if (access.error) return access.error;
  const { file } = await params;
  if (!Object.hasOwn(library, file)) return new Response("Not found", { status: 404, headers: privateHeaders });
  try {
    const response = await backendRequest("/library/grant", { method: "POST", body: JSON.stringify({ file }) }, roleLabel(access.session.role));
    if (!response.ok) return json({ error: "The file is temporarily unavailable." }, response.status);
    const grant = await response.json() as { url: string };
    if (new URL(request.url).searchParams.get("download") === "1") return json({ url: grant.url });
    return NextResponse.redirect(grant.url, { status: 307, headers: privateHeaders });
  } catch { return json({ error: "The file is temporarily unavailable. Saved device copies can still play offline." }, 503); }
}
export const HEAD = GET;
