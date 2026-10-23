import { requireSession, roleLabel } from "@/lib/reception/auth";
import { proxyJSON } from "@/lib/reception/backend";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const access = requireSession(request); if (access.error) return access.error;
  return proxyJSON("/state", {}, roleLabel(access.session.role));
}
