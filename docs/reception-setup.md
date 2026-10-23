# Private reception desk

The wedding site serves `/reception`. It has separate host and coordinator passwords, a server-verified HTTP-only session cookie, and a Cloudflare Worker that accesses D1. Guest pages and the existing Google Sheets RSVP integration are unchanged. There is no ChatGPT Sites dependency.

The database is `franzysherwindb`, ID `18af1856-bb70-435a-af74-ef043302bd05`. That identifier is not a credential. The application fails closed until its passwords, session secret, and backend connection are configured. No default passwords are provided.

## Configure the owner’s accounts

Run commands from the wedding project. Use Node 22 or newer. Cloudflare commands below use Wrangler; install it as a development dependency if it is not already available. Complete and verify one step before running the next.

1. Run `node scripts/configure-reception.mjs` in your own terminal. Choose the host and coordinator passwords privately. The script preserves existing RSVP environment variables, saves salted password hashes, and generates independent signing and backend secrets. It creates `.env.reception.vercel` for the five reception environment variables and `cloudflare/reception/.dev.vars` for the backend secret. These files are ignored by Git. The Worker URL can be left blank until step 5.
2. Run `npx wrangler login`, and authenticate your own Cloudflare account in the browser.
3. Run `npx wrangler d1 execute franzysherwindb --remote --config cloudflare/reception/wrangler.jsonc --file cloudflare/reception/schema.sql`. This adds three reception tables and an index. There are no drops or destructive changes. The current D1 database already contains the 33-record backed-up plan. A new or recovered database needs a separate private JSON import after the backend is configured: `node scripts/import-reception-plan.mjs /absolute/path/to/Reception-Latest-Plan.json`. The importer creates missing records and preserves existing ones. The program is not embedded in the public source repository.
4. Run `npx wrangler secret put SERVICE_SECRET --config cloudflare/reception/wrangler.jsonc`. Enter the locally generated `RECEPTION_BACKEND_SECRET` value in the terminal. Do not paste it into chat. The secret must match the wedding server’s value.
5. Run `npx wrangler deploy --config cloudflare/reception/wrangler.jsonc`. Record the resulting HTTPS Worker URL. Run the configuration script again and supply that URL if it was blank. Set the five variables from `.env.reception.vercel` in the existing wedding project’s Vercel environment variables. Never prefix them with `NEXT_PUBLIC_`.
6. Run the production build, then deploy the wedding site through its existing Git/Vercel workflow. Verify `/reception` redirects to sign-in, and unauthenticated state, sync, uploads, and media requests are rejected. Sign in with each role before sharing access. Send passwords directly to the intended people using your own trusted channel.

The small proxy Worker is intentional: Cloudflare recommends a Worker API for applications accessing D1 outside Cloudflare Workers, rather than repeatedly querying the administrative REST API. Reference: https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/

## Program and media

The latest 33-record plan is stored in the private D1 database. The authenticated wedding page requests it from the backend and embeds that authorized device copy for offline use. No program or notes are committed to the public GitHub repository.

The four existing media files are private Cloudflare Worker assets: the Harana V6 rehearsal MP4, Harana audio MP3, formation image, and short Forevermore reference. They live locally in `cloudflare/reception/assets/library`, which is ignored by Git. Restore that directory from the private integration backup when setting up another computer. The Worker configuration MUST retain `assets.run_worker_first: true`; every request reaches authentication before any asset can be served. The website grants signed 15-minute downloads to authenticated staff. Direct unsigned asset paths are rejected. Reference: https://developers.cloudflare.com/workers/static-assets/routing/worker-script/

No R2 account or bucket is needed for these four files. To share new uploads, optionally enable your own R2 storage, create the `franzy-sherwin-reception-media` bucket, uncomment its binding in the Wrangler config, and redeploy the Worker. R2 has separate allowances and billing terms; enabling it is an owner decision. Without R2, new uploads remain on the attaching device and the app reports that sharing is waiting. The pending file and any cue that references it stay queued; unrelated edits can still synchronize. Plan JSON does not contain binary files.

New uploads go directly to the Worker using a signed 15-minute upload grant, so they do not pass through Vercel’s function request-body limit. The bucket remains private. Uploaded IDs are immutable; file downloads use short-lived signed grants. Set the Worker’s `ALLOWED_ORIGIN` to the actual wedding origin, including scheme, if using a custom domain. Preview domains cannot upload until explicitly configured.

## Prepare the iPad

1. In Safari, open the live HTTPS `/reception` page, sign in, then Share → Add to Home Screen.
2. Open the installed Home Screen app. Sign in there if prompted; it may have separate browser storage from the Safari tab. Select “Main reception device · the iPad.”
3. In **Offline ready**, choose **Prepare this device for offline**. Keep the app open until the shell and every attached file are saved. Links to external websites are never counted as downloaded files.
4. Turn on airplane mode and fully close/reopen the Home Screen app. Verify the complete program and host scripts, Start/Hold/Complete & next, checklist, and notes. Play and seek the full Harana video and audio. Check the formation image and Forevermore sample. Try the venue’s actual speaker connection.
5. Repeat the download and rehearsal on each backup phone. Offline phones keep independent copies; they do not receive the iPad’s Next commands. Reconnect with the app open to share edits and resolve conflicts.
6. Keep independent copies of critical music and videos in Files, and export the program before the wedding. Do not clear Safari website data or remove the installed app. Prepare again after changing attachments or the program.

The floating media player stays open while switching sections or advancing cues. Playback begins through its manual controls, as required by mobile browsers.

The reception uses the existing wedding site's Coda Continuum logo, cream/brown/gold palette, Great Vibes names, Cormorant Garamond headings and Inter controls. The original vector artwork and four local font files are included in the reception's offline cache. The Home Screen icons use the same wedding artwork. HTML plan exports embed the logos and font files, so their branding also works without a network connection. Font license notices are included under `reception-assets/font-licenses`. After a design update, open the app online and prepare the device again to save the current assets.

The app stores the complete program in localStorage and entire media blobs in IndexedDB. The service worker only caches the reception shell; it does not control the guest site or cache sign-in/API responses. It does not substitute a cached page for an online sign-in redirect or access denial. The downloaded copy intentionally remains usable on an already prepared device without an online session check. Possession of that device provides offline access; use its screen lock. Signing out while online removes that browser’s reception cache, plan, and media. Close other reception tabs first.

Safari can evict website data under storage pressure. The app requests persistent storage, but hardware rehearsal is still required. Reference: https://webkit.org/blog/14403/updates-to-storage-policy/

The 4 PM start and program sequence are drafts. Forevermore is a 23.54-second reference sample, not a complete song. This migration does not create missing final songs or videos.
