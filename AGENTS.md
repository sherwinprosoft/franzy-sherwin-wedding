<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Verification Preference

Do not run `npm run lint`, `npx tsc`, or `npm run build` after every small frontend/content/CSS change. Use the dev server and browser preview while iterating, run targeted checks only when they are likely to catch relevant issues, and run the full production build once before committing, pushing, or deploying.
