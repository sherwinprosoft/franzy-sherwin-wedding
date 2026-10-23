import { json, requireSession, roleLabel, writeAllowed } from "@/lib/reception/auth";
import { proxyJSON } from "@/lib/reception/backend";
export async function POST(request: Request) {
  const access = requireSession(request); if (access.error) return access.error;
  if (!writeAllowed(request)) return json({ error: "Please open Reception Desk to make changes." }, 403);
  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > 100000) return json({ error: "Update too large" }, 413);
  return proxyJSON("/media/grant", { method: "POST", body }, roleLabel(access.session.role));
}
