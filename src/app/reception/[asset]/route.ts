import { createHash } from "node:crypto";
import { contentTypes, readAsset, serveFile } from "@/lib/reception/assets";
import { privateHeaders } from "@/lib/reception/auth";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ asset: string }> };
export async function GET(request: Request, { params }: Context) {
  const { asset } = await params;
  if (!Object.hasOwn(contentTypes, asset)) return new Response("Not found", { status: 404, headers: privateHeaders });
  if (asset === "sw.js") {
    const [script, js, css, shell] = await Promise.all(["sw.js", "desk.js", "desk.css", "shell.html"].map(readAsset));
    const version = createHash("sha256").update(script + js + css + shell).digest("hex").slice(0, 16);
    return new Response(request.method === "HEAD" ? null : script.replace("__RECEPTION_VERSION__", version), { headers: {
      ...privateHeaders, "content-type": contentTypes[asset], "service-worker-allowed": "/reception",
    } });
  }
  return serveFile(request, asset, contentTypes[asset]);
}
export const HEAD = GET;
