# MadeReal Meta Lead Form Playbook

Use this if Meta ads are switched on to support the organic funnel. The aim is enquiries, not website traffic for its own sake.

## Funnel

1. Facebook or Instagram video ad.
2. Meta instant lead form captures the contact before the visitor leaves the app.
3. Thank-you screen opens Messenger, WhatsApp or the MadeReal website.
4. MadeReal follows up by text, WhatsApp or email with the free preview promise.
5. If the lead wants more detail, send them to `/get-started.html` with UTM tags.

The website remains the proof and SEO asset. The ad form is the fastest capture layer.

## Core Offer

Use the same promise as the website:

- Free website preview first.
- Proper local business website.
- 197 GBP one-off if they approve it.
- No MadeReal monthly fee.
- No call needed.

Avoid saying "free website" without context. Say "free preview" so the offer stays clear.

## Ad Angle To Test First

Primary text:

> We are building free website previews for local UK businesses this month.
>
> We build the first version. You see it. You decide.
>
> No call needed. No payment upfront. If you like it, the full site is 197 GBP one-off.

Headline:

> Get a free website preview

Description:

> Text or email follow-up. No monthly MadeReal fee.

CTA:

> Get offer

## Instant Form Fields

Keep the form short:

- First name
- Phone number
- Email
- Business name
- Town
- What do you do? optional short answer

Privacy text should say MadeReal will use the details to send the free website preview and follow up about the request.

## Thank-You Screen

Message:

> Thanks, we have your details. We will check your business and send the first preview by text or email.

Buttons:

- Send message: opens Messenger or WhatsApp.
- View website: `https://madereal.uk/get-started.html?utm_source=meta&utm_medium=paid_social&utm_campaign=free_preview&utm_content=lead_form_thank_you`

## UTM Naming

Use consistent campaign tags:

- `utm_source=meta`
- `utm_medium=paid_social`
- `utm_campaign=free_preview`
- `utm_content=video_hook_1`, `video_hook_2`, etc.

The website now stores UTM, referrer, `gclid` and `fbclid` in every Netlify lead form, so paid social, GBP and organic enquiries can be compared inside the SEO dashboard.

## Follow-Up SLA

Reply fast. The funnel only works if the lead feels the preview is actually coming.

- Under 15 minutes during working hours: text or WhatsApp.
- Same day for evening leads.
- Next morning for overnight leads.

First message:

> Hi {{first_name}}, it is Dom from MadeReal. I saw you asked for a free website preview. I can build the first version from your public business info and send it over by text. What is the best business name and town to use?

## Monitoring

Track weekly:

- Meta leads
- Cost per lead
- Lead-to-preview rate
- Preview-to-sale rate
- Netlify form submissions with `utm_source=meta`
- GA4 `generate_lead` events with `utm_source=meta`

Compare these with organic leads, Google Business Profile website clicks and phone/WhatsApp clicks in `seo/dashboard.md`.
