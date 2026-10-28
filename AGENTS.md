# MadeReal Showcase build guide

This is the independent replacement website selected by Dom. Its instructions supersede the old parent site's £197-first positioning within this folder.

- Primary offer: free homepage preview, then £35/month if approved.
- Online menus have a separate offer confirmed on 28 October 2026: prominently show “100% completely FREE”, with readable “for the first month” and “Then £19/month per venue” directly beside the offer and request action. The free month starts on menu creation, not enquiry submission or first login. No card is required upfront and no automatic charge occurs. After expiry, staff subscribe to continue editing; the public menu stays online. The optional £197 one-off full website is separate, with website hosting while the £19 menu subscription is active. Domain registration/renewals and business email are separate. Keep this distinct from the general £35 website plan.
- Menu setup requests use `Menu Photo Enquiry` on /menus/ or `Menu Setup Request` at /menus/start/. An enquiry is not proof of payment or a created staff account. The delivery workflow supplies the private welcome package after creation. Do not imply this form itself creates a menu, starts the trial, takes a card or charges a subscription.
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
