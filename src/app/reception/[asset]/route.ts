import { assetVersion, contentTypes, readAsset, serveFile } from "@/lib/reception/assets";
import { privateHeaders } from "@/lib/reception/auth";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ asset: string }> };
export async function GET(request: Request, { params }: Context) {
  const { asset } = await params;
  if (!Object.hasOwn(contentTypes, asset)) return new Response("Not found", { status: 404, headers: privateHeaders });
  if (asset === "sw.js") {
    const [script, version] = await Promise.all([readAsset("sw.js"), assetVersion()]);
    return new Response(request.method === "HEAD" ? null : script.replace("__RECEPTION_VERSION__", version), { headers: {
      ...privateHeaders, "content-type": contentTypes[asset], "service-worker-allowed": "/reception",
    } });
  }
  return serveFile(request, asset, contentTypes[asset]);
}
export const HEAD = GET;
