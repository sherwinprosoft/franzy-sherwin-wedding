import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { privateHeaders } from "./auth";

export const assetRoot = path.join(process.cwd(), "reception-assets");
export async function readAsset(name: string) { return readFile(path.join(assetRoot, name), "utf8"); }
export const contentTypes: Record<string, string> = {
  "desk.js": "application/javascript; charset=utf-8", "desk.css": "text/css; charset=utf-8",
  "brand.css": "text/css; charset=utf-8",
  "sw.js": "application/javascript; charset=utf-8", "manifest.webmanifest": "application/manifest+json",
  "icon.svg": "image/svg+xml", "icon-192.png": "image/png", "icon-512.png": "image/png",
  "logo-dark.svg": "image/svg+xml", "logo-light.svg": "image/svg+xml", "logo-date.svg": "image/svg+xml",
  "inter-latin.woff2": "font/woff2", "cormorant-garamond-latin.woff2": "font/woff2",
  "cormorant-garamond-italic-latin.woff2": "font/woff2", "great-vibes-latin.woff2": "font/woff2",
};
export async function assetVersion() {
  const names = ["shell.html", ...Object.keys(contentTypes)].sort();
  const files = await Promise.all(names.map(name => readFile(path.join(assetRoot, name))));
  const hash = createHash("sha256");
  names.forEach((name, index) => hash.update(name).update(files[index]));
  return hash.digest("hex").slice(0, 16);
}
export const library: Record<string, string> = {
  "harana-v6-rehearsal.mp4": "video/mp4", "harana-v6-audio.mp3": "audio/mpeg",
  "harana-formation.png": "image/png", "forevermore-reference-sample.mp4": "video/mp4",
};
export async function serveFile(request: Request, name: string, type: string) {
  const filename = path.join(assetRoot, name);
  const meta = await stat(filename);
  const headers = new Headers({ ...privateHeaders, "content-type": type, "accept-ranges": "bytes", "content-length": String(meta.size) });
  const range = request.headers.get("range");
  let start = 0, end = meta.size - 1, status = 200;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { ...privateHeaders, "content-range": `bytes */${meta.size}` } });
    start = match[1] ? Number(match[1]) : Math.max(0, meta.size - Number(match[2]));
    end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= meta.size) return new Response(null, { status: 416, headers: { ...privateHeaders, "content-range": `bytes */${meta.size}` } });
    status = 206; headers.set("content-range", `bytes ${start}-${end}/${meta.size}`); headers.set("content-length", String(end - start + 1));
  }
  const body = request.method === "HEAD" ? null : Readable.toWeb(createReadStream(filename, { start, end })) as ReadableStream;
  return new Response(body, { status, headers });
}
