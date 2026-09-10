# MadeReal Showcase build guide

This is the independent replacement website selected by Dom. Its instructions supersede the old parent site's £197-first positioning within this folder.

- Primary offer: free homepage preview, then £35/month if approved.
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
