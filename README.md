# MadeReal Showcase rebuild

The new website lives entirely in this folder. The former marketing site is not part of this build. Real portfolio projects are in the owner's requested order. No fabricated reviews, client outcomes or excluded projects are used.

## Development

Requires Node 22 or newer.

```sh
npm ci
npm run build
npm run verify
npm run dev
```

Local preview: http://127.0.0.1:4321/ . Forms intentionally return an error locally; test them on the Netlify draft, where the receiving service is available.

## Content and CMS integration

- `content/site.json`: business identity and offer facts.
- `content/projects.json`: ordered real portfolio records, screenshots and descriptions. The original 11 remain in order, followed by the latest live full websites: 1664 Gas Services, Matt’s Travel, Vertex Roofing and Complete Roofing (checked 8 October 2026). Carousel and portfolio counts derive from this list.
- `content/portfolio-additions.json`: additional projects for `/work/` and their design walkthroughs. Checked 25 October 2026: six recent websites and nine public online menus. The public additions lead the work page, followed by the original 15 in their established order; the homepage carousel remains unchanged. Trawden Arms appears last and is explicitly labelled as a preview while its booking features are in testing. Only add owner-approved projects, and capture genuine desktop/mobile previews with `scripts/capture-portfolio.mjs` (requires Playwright and Sharp).
- `content/hospitality.json`: five real online-menu projects, separate from the main 11-project hero order. Public menus and screenshots checked on 10 September 2026; owner menu editing is confirmed by Dom, not by accessing client logins.
- `content/posts/*.md`: Markdown articles with YAML metadata; `draft: true` excludes a draft.
- `content/redirects.json`: explicit old-to-new URL migration map.
- `src/components.mjs`: shared semantic layout and UI components.
- `src/pages.mjs`, `src/services.mjs`, `src/information.mjs`: page composition.
- `public/styles.css`: responsive brand system; `public/app.js`: progressive enhancement.
- The homepage carousel shows landscape desktop screenshots on every screen, follows horizontal pointer drags, coasts after a flick and stops on touch. Vertical gestures remain page scrolls. Previous/next buttons and arrow keys work without a swipe; reduced-motion mode disables automatic playback and coasting. New projects need both `-desktop.webp` (1440 × 900) and `-mobile.webp` (390 × 844) captures; project detail pages still use responsive previews.
- `src/home-motion.mjs` and `public/light-field.js`: six plain-language benefit sections, with one persistent particle field flowing around stationary, flat UI icons with an expanded starfield between them. Inset white panels reveal the ambient stars along both sides. Icons are decorative; headings and offer details remain real HTML. Motion can be paused and respects reduced-motion preferences. Real client enquiries use the normal preview form.

This content layer can be connected to a Git-based CMS or replaced with a build-time content export from a headless CMS. No CMS account, OAuth app or editorial login has been silently provisioned. The existing `/admin` remains the separate Firebase client-preview manager, not an editor for this marketing website.

### New article metadata

```yaml
title: "A useful customer question"
meta_description: "Unique, accurate search description."
date: "2026-09-08"
slug: "useful-customer-question"
author: "Dom at MadeReal"
category: "Website advice"
cover: "Short cover words."
excerpt: "What the reader will learn."
draft: true
```

Start article headings at H2: the layout supplies its H1. Link to genuinely related articles, service pages or real projects. Remove `draft: true` only after facts and claims have been checked. The build adds published articles to the journal, sitemap and RSS feed automatically.

## Offer boundaries

Free homepage preview, then £35/month if approved. Cancel anytime; the website goes offline when the plan ends. A £197 one-off build remains a separate alternative. Domain, mailbox and specialist system costs must be agreed before purchase; the site does not claim they are automatically included. No guaranteed rankings or enquiry volumes.

The monthly plan starts with eight useful pages for genuine service areas, with more available on request, plus a contact form and tap-to-call number. Basic eligible Google Business Profile setup and accuracy help is included; larger or ongoing profile management is discussed separately.

## Online menus

`/menus/` is a native MadeReal service page. The editorial review version is in `src/menu-editorial.mjs`, with metadata in `src/menus.mjs`, scoped styles in `public/menus-assets/menu-editorial.css` and motion in `menu-editorial.js`. It adapts the large typography, sparse navigation, product objects and bold colour-stage transitions of the supplied La boite à slides reference using MadeReal’s Space Grotesk/DM Sans and lime/near-black/white brand. Four main sections explain Google discovery, individual branding, staff-controlled updates and online/table/print use. The menu is presented as an indexable website. Shared navigation and the hospitality page link to it; `/menu` and `/menu.html` redirect to canonical `/menus/`. The prior white review version (`menu-plain.mjs`) and older thirteen-feature source/assets remain available but are not loaded as page content.

Generated scenes remain as responsive WebP assets in `public/menus-assets/assets/plain-v3/`. The current page uses the Little Italy physical-product mockup with real SVG QR artwork over its table stand and beer mat. Both codes open Little Italy. Physical products and printing are separate from the subscription. The search result is illustrative and does not claim a ranking. Real device screenshots populate a native horizontal gallery, derived from the current online-menu portfolio plus the clearly labelled Trawden preview; previous/next controls, keyboard scrolling and touch scrolling work without automatic playback.

A visible pointer demonstrates editing £8.50 to £9.00, pressing Publish and updating the phone menu with a short line burst. Users can also publish their own example price; manual interaction stops automatic playback. Product objects and curved section boundaries move gently with scroll using an on-demand spring; there is no scroll hijacking or long pinned sequence. Motion pauses offscreen/hidden, can be paused explicitly and respects reduced-motion preferences. The example never modifies a real menu. Legacy anchors `#how-it-works`, `#real-menus`, `#playground`, `#printing` and `#pricing` remain valid. SEO copy, title, description, canonical, Organization/WebPage/Service/Offer and breadcrumb data are server-rendered. Production remains indexable; review builds remain noindex. The offer stays £19 per venue/month with initial setup and an optional £197 one-off full website; website hosting lasts while the menu subscription is active, and domains/email are separate. A4/PDF generation avoids repeat design fees, while paper copies must be reprinted after changes.

The editorial page adds a visible staff login at `https://manage.madereal.uk/`, direct WhatsApp contact and an inline photo/email funnel at `#send-menu`. The funnel is implemented in `src/menu-funnel.mjs` and its scoped CSS/JS. Its separate static multipart Netlify form, `Menu Photo Enquiry`, requires one menu photo/PDF and an email, validates file type/6 MB limit, preserves source/campaign fields, shows an accepted-only confirmation and offers WhatsApp for an immediate conversation. A submission is an enquiry; it does not take payment or create an account. The existing detailed `Menu Setup Request` form is unchanged. Private Sites builds replace the inline form with a link to the live intake.

On 25 October 2026, one labelled internal delivery check on Deploy Preview 12 verified the inline confirmation, stored Netlify submission, accessible menu attachment and notification in the positively verified `maderealdesign@gmail.com` business inbox. The `internal-delivery-check-2026-10-25` campaign and `INTERNAL-DELIVERY-CHECK` filename identify this test; exclude it from customer lead counts. It did not send a WhatsApp message.

Existing Open Graph and Twitter artwork remains `public/menus-assets/assets/madereal-menus-social-v2.jpg` (1200×630); a separate `madereal-menus-social-square-v2.jpg` (1080×1080) is available for posts. Its editable export source is `scripts/social/menus-share.html`, outside the public build.

Menu-specific owner guides at `/menus/pubs/`, `/menus/cafes/` and `/menus/sandwich-shops/` are rendered by `src/menu-audiences.mjs`, integrated into the normal build and sitemap. `/menus/start/` collects setup details and an optional menu PDF/photo through a separate multipart Netlify form, `Menu Setup Request`; `/menus/request-received/` is noindex and excluded from the sitemap. A submission creates an enquiry only. Price/scope/payment arrangements and the initial design are reviewed before launch. Paid checkout, billing-linked provisioning and the initial-design approval queue are not wired to the manager yet.

Netlify's existing all-form notifications deliver to the owner's configured business and Gmail inboxes. On 15 October 2026, a clearly labelled internal delivery check verified receipt, package choice, uploaded public menu image, campaign fields and Reply-To in Gmail; exclude that test from customer counts. Campaign parameters are carried from menu landing pages to the intake without cookies or browser storage. After a production deploy, `node scripts/submit-menu-urls.mjs --submit` verifies live indexable URLs/key ownership before notifying IndexNow. An accepted response requests discovery and does not prove indexing. The public key file is site-verification material, not an account credential.

`scripts/prepare-menus.mjs` is a one-time migration utility for the earlier local prototype. It is not part of the production build; edit the native source and assets directly for future changes. Production emits the page title, description, canonical URL, MadeReal Organization/WebPage/Service and breadcrumb data as HTML. Preview builds remain noindex. Search Console discovery/indexing must be checked separately after publishing.

## Operations preserved

- Netlify form: `Quick Preview Lead`, retaining the established lead-form identity.
- A lightweight homepage form sits directly after the hero: business name, email and optional phone number. It uses the existing enquiry handler and form identity; the standalone preview form retains the same registered field set. The larger pricing panel remains on the pricing page, not the homepage.
- Firebase `/admin` and dynamic `/:slug` client preview function.
- Existing Stripe checkout function is retained, without advertising its unverified legacy price or generating new payment links. Confirm the actual £35 Stripe price before adding a direct checkout journey.
- Legacy payment return URLs lead to a neutral payment-status explanation, not an unverified success claim.
- Existing client sites and subdomains are not modified.

## Publishing

Netlify site ID: `406c26ef-c9cf-473c-a530-74b346695cd4` (`madereal`). The production deployment branch is `codex/showcase-rebuild`. Publish `dist`. Preview builds use `PREVIEW=1`; production must not. Netlify production explicitly sets `PREVIEW=0` and `HOSTING_TARGET=netlify`, then runs both the build and production release gate.

```sh
PREVIEW=1 npm run build
npx netlify deploy --site 406c26ef-c9cf-473c-a530-74b346695cd4 --dir dist --functions netlify/functions --no-build
```

Run desktop/mobile crawl, accessibility and performance tests against that draft. Deploy production only after review. Preserve the previous production deploy ID for rollback. The rebuild must be committed to the deployment branch so future Git builds cannot restore the old marketing website.

Before committing a release, run:

```sh
PREVIEW=0 HOSTING_TARGET=netlify npm run build
npm run verify -- --production
git diff --check
```

The production gate rejects blocked crawler access, accidental preview content, missing lead forms and invalid sitemap targets. After publishing, recheck the actual live HTTP responses: `/robots.txt` must allow crawling and declare `https://madereal.uk/sitemap.xml`; every sitemap URL must return an indexable, canonical 200 page. Submit that sitemap URL in the verified Google Search Console property. A successful submission requests discovery; it does not guarantee indexing or rankings.

For the separate owner-private Sites copy, build with `PREVIEW=1 HOSTING_TARGET=sites npm run build`. That static copy links to the live Netlify enquiry form instead of pretending to process submissions itself. Do not set `HOSTING_TARGET=sites` on Netlify.

## Measurement

The enquiry form records source page, referrer origin and campaign fields; it does not put personal contact details in URLs. A `generate_lead` data-layer event is emitted only after an accepted form response. No analytics or advertising tracker is installed merely by emitting that event. Use Netlify submissions as the delivery source of truth, and connect consent-aware analytics separately if needed.

Lighthouse is laboratory evidence. Field Core Web Vitals, including INP, need real-user data; do not describe a launch-day lab score as a proven field result. Record the URL, device, date and run count for every performance claim.
