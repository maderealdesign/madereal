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
- `content/projects.json`: ordered real portfolio records, screenshots and descriptions.
- `content/posts/*.md`: Markdown articles with YAML metadata; `draft: true` excludes a draft.
- `content/redirects.json`: explicit old-to-new URL migration map.
- `src/components.mjs`: shared semantic layout and UI components.
- `src/pages.mjs`, `src/services.mjs`, `src/information.mjs`: page composition.
- `public/styles.css`: responsive brand system; `public/app.js`: progressive enhancement.

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

## Operations preserved

- Netlify form: `Quick Preview Lead`, retaining the established lead-form identity.
- Firebase `/admin` and dynamic `/:slug` client preview function.
- Existing Stripe checkout function is retained, without advertising its unverified legacy price or generating new payment links. Confirm the actual £35 Stripe price before adding a direct checkout journey.
- Legacy payment return URLs lead to a neutral payment-status explanation, not an unverified success claim.
- Existing client sites and subdomains are not modified.

## Publishing

Netlify site ID: `406c26ef-c9cf-473c-a530-74b346695cd4` (`madereal`). Publish `dist`, build `npm run build`. Preview builds use `PREVIEW=1`; production must not.

```sh
PREVIEW=1 npm run build
npx netlify deploy --site 406c26ef-c9cf-473c-a530-74b346695cd4 --dir dist --functions netlify/functions --no-build
```

Run desktop/mobile crawl, accessibility and performance tests against that draft. Deploy production only after review. Preserve the previous production deploy ID for rollback. The rebuild must be committed to the deployment branch so future Git builds cannot restore the old marketing website.

## Measurement

The enquiry form records source page, referrer origin and campaign fields; it does not put personal contact details in URLs. A `generate_lead` data-layer event is emitted only after an accepted form response. No analytics or advertising tracker is installed merely by emitting that event. Use Netlify submissions as the delivery source of truth, and connect consent-aware analytics separately if needed.

Lighthouse is laboratory evidence. Field Core Web Vitals, including INP, need real-user data; do not describe a launch-day lab score as a proven field result. Record the URL, device, date and run count for every performance claim.
