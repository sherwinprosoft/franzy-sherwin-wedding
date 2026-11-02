import { NextResponse } from "next/server";
import { accessConfigured, privateHeaders, requestOrigin, readSession, receptionReturnPath } from "@/lib/reception/auth";
import { backendConfigured } from "@/lib/reception/backend";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  const returnTo = receptionReturnPath(new URL(request.url).searchParams.get("next"));
  if (readSession(request)) return NextResponse.redirect(new URL(returnTo, requestOrigin(request)), { status: 303, headers: privateHeaders });
  const configured = accessConfigured() && backendConfigured();
  const error = new URL(request.url).searchParams.get("error");
  const message = !configured ? "Reception access hasn’t been enabled yet. Please contact Sherwin or Franzy." : error === "retry" ? "Too many attempts. Please wait 15 minutes and try again." : error === "unavailable" ? "Sign-in is temporarily unavailable. Please try again shortly." : error ? "The role or password was incorrect. Please try again." : "For the host and coordinator. Sign in while online to prepare this device for the reception.";
  return new Response(`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#3f2911">
<title>Private reception · Sherwin & Franzy</title><link rel="icon" href="/reception/icon.svg">
<link rel="apple-touch-icon" href="/reception/icon-192.png">
<link rel="stylesheet" href="/reception/desk.css"><link rel="stylesheet" href="/reception/brand.css">
<link rel="preload" href="/reception/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/reception/cormorant-garamond-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/reception/great-vibes-latin.woff2" as="font" type="font/woff2" crossorigin>
</head><body class="login-page"><main class="login-card">
<img class="wedding-logo login-mark" src="/reception/logo-date.svg" alt="Sherwin and Franzy wedding monogram, December 5, 2026" width="1714" height="1148">
<div class="login-couple">Sherwin &amp; Franzy</div>
<div class="eyebrow">The wedding team</div><h1>Reception Desk</h1>
<p role="status" class="${error ? 'error' : ''}">${message}</p>
${configured ? `<form action="/api/reception/login" method="post"><input type="hidden" name="next" value="${returnTo}"><label for="role">Your role</label><select id="role" name="role" autocomplete="username"><option value="host">Host</option><option value="coordinator">Coordinator</option></select><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="1024"><button type="submit">Open reception desk</button></form>` : ''}
<a class="return-link" href="/">Return to the wedding website</a></main></body></html>`, {
    status: configured ? 200 : 503,
    headers: { ...privateHeaders, "content-type": "text/html; charset=utf-8", "content-security-policy": "default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" },
  });
}
