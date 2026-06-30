# Search Console Exports

Put Google Search Console exports here when doing a weekly review.

Recommended files:

- `queries-YYYY-MM-DD.csv`
- `pages-YYYY-MM-DD.csv`
- `ga4-events-YYYY-MM-DD.csv`
- `gbp-performance-YYYY-MM-DD.csv`
- `netlify-forms-YYYY-MM-DD.csv`

Use Search Console Performance, last 28 days, search type Web. Export both the Queries tab and Pages tab, then run:

```bash
npm run seo:dashboard
```

The dashboard will list available export files so the weekly review has local evidence.
It also includes a Data Export Status table that says which core source is ready and which export still needs adding.

Run the full monitor and refresh the current weekly review with:

```bash
npm run seo:weekly
```

That command updates the evidence sections in `seo/reviews/YYYY-MM-DD.md` while keeping your diagnosis, chosen actions and follow-up notes.

The parser accepts the normal Search Console columns:

- Queries export: `Query`, `Clicks`, `Impressions`, `CTR`, `Position`
- Pages export: `Page`, `Clicks`, `Impressions`, `CTR`, `Position`

It will then show:

- queries with useful impressions but low CTR
- queries ranking around positions 8-30
- pages getting impressions, with whether a lead form is present

For GA4, export an events report with columns like:

- `Event name`
- `Event count`
- `Total users`
- `Key events`

Useful events include `generate_lead`, `preview_cta_click`, `phone_call_click`, `whatsapp_click`, `email_click`, and any `form_submit_*` event.

For Google Business Profile, export or record performance rows with columns like:

- `Metric`
- `Value`

Useful metrics include website clicks, calls, messages, direction requests, profile views, search views and maps views.

For Netlify Forms, record a snapshot with columns like:

- `Form`
- `Submission Count`
- `Last Submission At`
- `Fields`

Useful forms include `Quick Preview Lead`, `Preview Quick Lead`, `Website Request`, town quick leads and service quick leads.

New form submissions should include attribution fields:

- `Landing_Page`
- `Referrer`
- `UTM_Source`
- `UTM_Medium`
- `UTM_Campaign`
- `UTM_Term`
- `UTM_Content`
- `GCLID`
- `FBCLID`

These make it possible to separate organic, Google Business Profile, Meta, Google Ads, WhatsApp and direct enquiries when reviewing form exports.

If `NETLIFY_AUTH_TOKEN` is available, generate the snapshot with:

```bash
npm run seo:netlify-forms
```

The script writes `netlify-forms-YYYY-MM-DD.csv` for the MadeReal Netlify project. You can also pass a downloaded forms JSON file:

```bash
npm run seo:netlify-forms -- --input path/to/forms.json
```
