# MadeReal Showcase build guide

This is the independent replacement website selected by Dom. Its instructions supersede the old parent site's £197-first positioning within this folder.

- Primary offer: free homepage preview, then £35/month if approved.
- Online menus have a separate offer confirmed on 15 October 2026: £19 per venue/month, plus an optional £197 one-off full website build. Website hosting is included while the £19 menu subscription is active; domain registration/renewals and business email are separate. Keep this scoped menu package distinct from the general £35 website plan.
- Menu setup requests currently use the dedicated `Menu Setup Request` Netlify form at /menus/start/. An enquiry is not proof of payment or a created staff account. Initial designs require Dom's review and customer approval before launch. The Windows audit at commit `0d68151` did not find payment-triggered setup or a design approval queue; this is a dated checkout snapshot, not evidence about newer MacBook work. Verify the payment owner's current implementation before making operational claims.
- Cancel anytime; website goes offline when the plan ends.
- Keep the £197 one-off build as a separate secondary choice.
- The £35 plan starts with eight local area pages; more can be added on request for genuine service areas. Contact form and tap-to-call included.
- Basic eligible Google Business Profile setup/accuracy help is included; broader ongoing profile management is agreed separately. Do not promise rankings or enquiries.
- Do not invent domain/email inclusions, unlimited support, rankings, reviews or client outcomes.
- Confirmed business location: 9 Market Street, Colne, Lancashire, BB8 0HY.
- Maintain the exact order in `content/projects.json`. Exclude Chameleon.
- Preserve the chosen Showcase brand: near-black, white, lime, Space Grotesk/DM Sans, real portfolio images, spacious mobile-first layouts.
- Read README.md before edits. Source is in src/, content/ and public/. Never edit dist/.
- Use apply_patch for source edits. Run npm run build and npm run verify before committing.
- Preserve /admin, dynamic client previews and existing payment-function compatibility. Do not modify client domains or subdomains.
- Drafts must be noindex. Production must be indexable with a current sitemap and relevant direct redirects.
- Audit actual desktop/mobile layouts, form delivery, accessibility and Lighthouse. Distinguish lab measurements from field Core Web Vitals.
- The current Netlify site is madereal, ID 406c26ef-c9cf-473c-a530-74b346695cd4. Source deployment branch is codex/showcase-rebuild. Never push old parent files over this rebuild.

## Menu project ownership — confirmed by Dom, 15 October 2026

- The MacBook Pro chat owns payments and the SaaS product: Stripe prices, checkout, webhooks, billing, authentication, staff accounts, tenant provisioning, the menu manager, initial-design approval and onboarding. It is also the nominated production integrator/publisher. Its chat and branch have not yet been identified from Windows; do not assume it has read this handoff.
- This Windows chat owns SEO and customer acquisition. Use `codex/menus-acquisition` for new work. Primary scope: `src/menu-audiences.mjs`, `public/menu-guides.css`, relevant `content/posts/`, indexing tools, search research, campaign material and authorised prospect/reply work.
- Leave `src/menu-intake.mjs`, `public/menu-intake.js`, `public/menu-intake.css`, checkout/confirmation routes, `netlify/functions/`, payment/auth configuration and backend resources to the payment owner. A marketing task does not authorise replacing its payment flow.
- Coordinate changes to shared files, especially `src/menus-body.html`, `src/menus.mjs`, `src/components.mjs`, `src/pages.mjs`, `scripts/build.mjs`, `scripts/verify.mjs`, `netlify.toml`, `package.json` and common offer facts. The payment owner supplies the checkout/onboarding destination; acquisition links to that agreed route.
- Fetch current Git state before new edits. Keep each chat's work on a separate branch and integrate reviewed changes into `codex/showcase-rebuild`. Preserve the other chat's commits and uncommitted work; never force-push, reset or overwrite its checkout.
- This Windows chat must not publish production or push directly to the production branch while this split is active. Stage acquisition changes on its branch for the MacBook owner to integrate. Build and verify from combined current source before publishing; an old `dist` upload can undo the other chat's work even when source files did not overlap.
- Remote access lets chats inspect the other host when connected; it does not merge Git branches or synchronise local files. Reconcile implementation status with current source and the owning chat.
