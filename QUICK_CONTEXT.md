# Franzy Sherwin Wedding - Quick Context

## What This Project Is For

This is a static-style wedding information website/invitation for Sherwin Ross Ora and Franzy Joyce Caparas. The page presents the wedding date, wedding-day details, map links, entourage list, guest notes, full-screen photo hero, watercolor background treatment, and simple section navigation.

Main event details currently shown:

- Date: December 5, 2026
- Time: 2:00 PM ceremony
- Ceremony: St. John Don Bosco Parish, Baguio
- Reception: Craft 1945, Baguio City

## Tool / Framework Used

This was bootstrapped with `create-next-app` and is built with:

- Next.js `16.2.4`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- Framer Motion for page reveal and menu animations
- Lucide React for icons

Important local note from `AGENTS.md`: this project uses a newer Next.js version with possible breaking API and file-structure changes. Before larger code edits, read the relevant guide under `node_modules/next/dist/docs/`.

## Project Shape

- `src/app/page.tsx` composes the whole page: background, top navigation, hero, wedding day details, entourage, guest notes, and footer.
- `src/app/layout.tsx` sets metadata and Google fonts through `next/font`.
- `src/app/globals.css` defines the refreshed wedding palette, Tailwind theme values, font utilities, hero text shadows, and global page styling.
- `src/data/wedding.ts` centralizes editable wedding details, venue links, navigation, motif/guest-attire colors, notes, countdown target, and entourage data.
- `src/components/Hero.tsx` renders the full-screen El Nido photo hero with a brighter earthy overlay, centered names, wedding status line, dynamic days-to-go countdown, circular date blocks, and primary CTA.
- `src/components/Details.tsx` renders the Wedding Day section with ceremony/reception venue cards and Google Maps links. `Details.module.css` handles the warm invitation-paper section treatment.
- `src/components/Entourage.tsx` renders the wedding party sections from centralized data, with `Entourage.module.css` giving it a distinct soft stone/sage program-page treatment.
- `src/components/Sidebar.tsx` handles the fixed photo-overlay navigation and mobile menu.
- `src/components/GuestNotes.tsx` renders the guest guide: formal attire guidance, required Barong callout, motif/guest-attire swatches, and secondary map links. `GuestNotes.module.css` handles the notes section styling.
- `src/components/Background.tsx` renders the fixed paper-texture background and watercolor image washes.
- `src/components/animations/Reveal.tsx` is the active reusable Framer Motion helper. `Parallax.tsx` still exists but is not currently used.
- `public/images/` contains the invitation references plus supporting image assets. The hero uses `elnido.jpg`; `1.png`, `2.png`, `3.png`, and `image.png` remain visual references, while the cleaner watercolor assets support decorative backgrounds.

Generated/dependency folders already present:

- `.next/`
- `node_modules/`

## Common Commands

Run from this project root:

```sh
npm run dev
npm run build
npm run start
npm run lint
```

The dev server defaults to `http://localhost:3000`.

## Update Notes

- This is not a PHP app even though it lives under `php/src/`; treat it as an independent Next.js frontend.
- The current visual direction uses a brighter earthy wedding palette: deep olive `#53583E`, warm taupe `#AEA38E`, soft stone `#DDDBD7`, and dark walnut `#593B1F`.
- Most visible content should be changed in `src/data/wedding.ts`; also check duplicated metadata/footer text in `src/app/layout.tsx` and `src/app/page.tsx` when changing names or dates.
- If changing names, date, venue, or entourage members, update `src/data/wedding.ts` and check mobile layout because many headings use large script fonts.
- If adding photo sections, start with `public/images/`; existing image files look prepared for portrait-style usage.
- Keep `.next/`, `node_modules/`, build output, private files, and local environment files out of commits.
