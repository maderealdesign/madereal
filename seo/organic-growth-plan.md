# MadeReal Organic Growth Plan

Updated: 2026-06-30

## Goal

Get organic enquiries for MadeReal from local UK business owners who need a website, especially around Colne, Burnley, Nelson, Pendle and wider Lancashire.

## Current Baseline

- Search Console screenshot shows 35 clicks, 1,920 impressions, 1.8% CTR and average position 26.2 over the previous 3 months.
- Page indexing screenshot shows 11 indexed pages and 61 not indexed pages.
- Portfolio backlink audit on 2026-06-30 found 9 verified MadeReal footer credits and 13 missing or unclear credits across custom-domain portfolio sites.
- The public website examples page at `/case-studies.html` turns verified work into a trust and internal-link asset.
- That means the site has started getting impressions, but Google still needs stronger page-level relevance, more indexed useful pages, better CTR and more trust signals.

## Research Direction

Track the keywords in `seo/keyword-watchlist.csv`.

Use `seo/local-competitor-research.md` as the working competitor note. Recheck it monthly because local SERPs can move quickly.

Prioritise:

- `web design + town` terms because they have high local buying intent.
- `website designer + town` variants because buyers do not all use the phrase "web design".
- `website design + town` variants because several local competitors use that wording.
- niche service terms such as `tradesman websites`, `roofer web design` and `electrician web design`.
- offer terms around one-off pricing, because MadeReal has a real differentiator at 197 GBP.
- comparison terms around pay monthly websites, because some visible competitors sell no-upfront/monthly website offers.

Do not create thin pages for every phrase. Google guidance for generative search still points back to normal SEO foundations: useful pages, crawlability, clear structure and helpful content.

## Monitoring Cadence

Every Monday:

- A Codex automation named `MadeReal weekly organic enquiry monitor` now runs this workflow locally on Monday mornings.
- Search Console Performance, last 28 days: export Queries and Pages.
- Check which keywords have impressions but low CTR.
- Check which pages are ranking positions 8-30 and improve titles, intros, internal links and FAQs.
- Search Console Indexing: check new "not indexed" reasons.
- Google Business Profile: record website clicks, calls, direction requests, reviews and photo views.
- GA4: record `generate_lead`, `preview_cta_click`, `phone_call_click`, `whatsapp_click` and `email_click`.
- Netlify Forms: refresh the form snapshot with `npm run seo:netlify-forms` if `NETLIFY_AUTH_TOKEN` is available, or update `seo/exports/netlify-forms-YYYY-MM-DD.csv` manually.
- Lead attribution: check that `seo/dashboard.md` reports all Netlify forms with landing page, referrer, UTM, GCLID and FBCLID fields.
- Run `npm run seo:audit-backlinks` and review `seo/backlink-audit.csv`.
- Add Search Console, GA4 and Google Business Profile exports to `seo/exports/`, then run `npm run seo:weekly`.
- Fill in the generated review note in `seo/reviews/` and choose no more than three actions for the week.

Every month:

- Fill one row in `seo/monthly-monitoring-template.csv`.
- Pick 3 pages to improve based on impressions and commercial value.
- Add one genuinely useful local/business guide, not generic filler.
- Choose new pages from `seo/page-growth-backlog.csv`, then update the status when a page is published.
- Ask recent clients for Google reviews and add proof to the website where appropriate.
- Review `seo/portfolio-opportunities.csv` and turn one real project into either a public case study, a homepage proof update or a confirmed footer credit.

## Page Quality Gate

Every indexable page should be decent enough to deserve being indexed. The build monitor now runs:

```bash
npm run seo:audit-pages
```

This checks built pages for:

- one unique H1
- unique title and meta description
- canonical URL
- sitemap inclusion
- JSON-LD schema
- enough body copy for the page type
- at least 5 internal links
- a lead form on commercial, service, location and blog pages

Do not publish new pages just to increase the page count. If a page cannot pass this gate, improve the source page or keep it unpublished.

## Weekly Page Scaling System

The long-term aim can be hundreds or thousands of useful pages, but the order matters.

Add pages in batches that match real search demand:

1. Core local pages: town + web design / website designer / small business websites.
2. Service-location pages where there is real intent, such as tradesman websites in Burnley or restaurant websites in Skipton.
3. Niche service pages for buyers with clear problems, such as roofer websites, electrician websites and cafe websites.
4. Buyer-question guides that answer cost, ownership, Google Business Profile, missed calls, reviews and local SEO questions.
5. Case studies from real approved work.

Each new page needs:

- a clear primary keyword and search intent
- unique local/service angle
- proof, examples, FAQs or practical advice
- links to at least one service page, one relevant location page and `/get-started.html`
- a quick lead form or a clear route to the free preview
- schema and sitemap inclusion through the build

Publishing target:

- Minimum: 1 strong new page per week.
- Good pace: 2-3 strong pages per week once the template system is stable.
- Do not scale to large batches until Search Console shows which clusters are getting impressions and the page quality audit stays green.

Avoid:

- cloned town pages with only the town name changed
- thin "near me" pages
- fake case studies
- pages targeting locations MadeReal cannot reasonably serve
- doorway pages that exist only to funnel visitors to the same generic page

## Channel Priorities

1. Google organic local pages: the highest intent channel.
2. Google Business Profile: update services, photos, reviews and posts weekly.
3. Blog content: answer buyer objections around cost, ownership, local SEO and website vs Facebook.
4. Generative search: keep `llms.txt`, schema, FAQs and entity facts clear. This supports answer engines without pretending there is a magic exploit.
5. Referral links: get real local backlinks from clients, directories, chambers, suppliers and portfolio credits.
6. Meta lead forms: optional paid support for demand capture. Use `seo/meta-lead-form-playbook.md` if paid social is switched on, and compare those leads against organic rather than treating them as separate noise.

## Competitor Positioning

The local SERP is full of WordPress, bespoke agency, free quote and pay-monthly offers. MadeReal should stay simpler and more direct:

- `£197 one-off`
- `free preview first`
- `no MadeReal monthly fee`
- `built around enquiries`
- `text/email/WhatsApp follow-up so missed calls do not waste demand`

## Funnel Positioning

The main funnel is the free preview, not phone calls.

- First conversion: capture a mobile number or email.
- Second step: optional Google Business Profile search or manual business details.
- Follow-up channel: text, WhatsApp or email so missed phone calls do not waste demand.
- Phone calls stay available for high-intent visitors, but the site should not depend on live answering.
- Google Business Profile data is enrichment, not the lead capture itself.
- Every Netlify lead form now stores landing page, referrer, UTM source/medium/campaign/content, `gclid` and `fbclid` so enquiries can be attributed when traffic comes from organic search, GBP, Meta ads, Google Ads, WhatsApp or direct sharing.

## Existing Asset Leverage

The wider `Madereal 2026/Websites` registry contains custom-domain projects that can support MadeReal organic growth. Use them carefully:

- Only claim work that is real and approved to show.
- Only add footer credits on real custom-domain sites where the registry requires it.
- Prioritise case studies for niches that match search demand: trades, roofing, electricians, hospitality, local services and professional services.
- Track the working list in `seo/portfolio-opportunities.csv`.
- Track the live backlink result in `seo/backlink-audit.csv`.
- Track the combined local dashboard in `seo/dashboard.md`.

## Backlink Audit Actions

Verified credits on 2026-06-30:

- Pendle Pods
- Entwistle Paving
- TC Joinery
- Hyn Electrical
- Sprayrite
- Dust-Be-Gone
- Seamless Gutters
- Driveway Visualiser
- Slateworx

Missing or unclear credits to review:

- Trusted Roof Repairs
- Intricate Landscapes
- OCD Supreme
- Agentify Business
- Floorboard
- Colne NearMe
- Chameleon Paint
- NS Plastering
- Jackdaw Investigations
- Coached Ltd
- Image Renamer
- Gift Genius
- Zero Effort

## Next Content Gaps

- "Consultant websites in Lancashire"
- "Web design Padiham"
- "Web design Accrington"
- "Tradesman website example Lancashire" using approved real work only

Recently added:

- `content/posts/website-ownership-vs-monthly-rental.md` targets ownership, monthly rental and pay-monthly comparison searches.
- `content/posts/turn-google-business-profile-visitors-into-enquiries.md` targets GBP visitors, missed-call risk and website enquiry conversion.
- `content/posts/new-trades-business-website-burnley-pendle.md` targets new local trade businesses and links into tradesman/area pages.
- `content/posts/web-design-prices-lancashire.md` targets local price-aware buyers and links into the preview funnel.
- `content/posts/why-website-not-getting-enquiries.md` targets local businesses with traffic, weak conversion and missed-call leakage.

## Sources To Recheck

- Google Business Profile help center: https://support.google.com/business/
- Google Search Console start guide: https://developers.google.com/search/docs/monitor-debug/search-console-start
- Google helpful content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google guide to generative AI search optimisation: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google structured data introduction: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
