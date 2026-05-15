# MadeReal Style Guide

This guide defines the direction for the main MadeReal website. Use it when redesigning existing pages or creating new commercial, service, location and blog pages.

## Positioning

MadeReal should feel trustworthy, local, easy and surprisingly good value. The visitor should quickly understand:

- MadeReal builds proper local business websites.
- The first preview is free.
- The full build is 197 GBP if approved.
- There are no MadeReal monthly fees.
- The client owns the finished site.
- The site includes useful local SEO structure, not just a homepage.

The emotional sell is confidence first, features second.

## Reference Feel

The target feel is closer to Google Business Profile than to a loud agency landing page:

- spacious
- calm
- clean
- plain language
- one idea per section
- strong but not shouty CTA buttons
- simple product visuals
- easy mobile reading

## Page Flow For High-Intent Pages

Use this order unless there is a strong reason not to:

1. Trust-led headline.
2. One-field lead capture or clear preview CTA.
3. Immediate proof or reassurance.
4. What happens next.
5. What is included.
6. Real examples or local proof.
7. FAQ / objection handling.
8. Final CTA.

Do not lead with every feature at once. Let the page breathe.

## Copy Rules

Write like a calm expert talking to a local business owner.

Good:

- "Get a proper business website for 197 GBP."
- "See the first version before paying anything."
- "No MadeReal monthly fee."
- "You own the finished site."

Avoid:

- jargon
- exaggerated hype
- long paragraphs
- aggressive scarcity
- overexplaining the build process

Use short paragraphs. Most sections should have a headline, one supporting paragraph and one clear action or visual.

## Trust Signals

Use trust signals early and often:

- real portfolio screenshots
- named client sites
- local towns served
- clear ownership promise
- no monthly fee promise
- "free preview first"
- simple explanation of why the price is low
- contact details
- Google Business setup included

Avoid fake client examples. Portfolio work must be real.

## Urgency

Use honest urgency only.

Good:

- "Most previews are sent within 24 hours."
- "We only build a small number of previews each week."
- "197 GBP while we are still building local case studies."

Avoid fake countdowns, fake stock warnings or manipulative pressure.

## Lead Capture Pattern

The preferred homepage lead capture is one field:

- mobile number or email

After submit, redirect to:

```text
/get-started.html?lead=...
```

The second step should feel optional and helpful:

- search Google Business Profile
- or manually enter business details
- optional Facebook/website link

The first form captures the lead even if the user does not finish the second step.

## Visual Style

Base:

- white backgrounds
- very light grey sections: `#F5F5F7`
- dark text: slate/near-black
- blue CTA buttons for primary conversion
- MadeReal teal as a brand accent

Layout:

- use centered sections for big messages
- max width around `max-w-4xl` or `max-w-6xl` for readable blocks
- avoid dense grids above the fold
- keep mobile stacks simple

Cards:

- use cards for proof, portfolio, forms and repeated items
- prefer soft borders and soft shadows
- avoid heavy black borders unless matching an existing intentionally bold section

Buttons:

- primary: blue filled rounded pill
- secondary: white rounded pill with light border
- keep text short

## Animation

Animations should add energy without feeling cheesy.

Use:

- subtle fade and vertical slide on scroll
- hover lift on cards
- gentle focus rings on forms
- reversible scroll reveals so sections animate in again when scrolling back

Avoid:

- spinning elements
- bouncing CTAs
- excessive parallax
- long delays
- animations that move text while the user is trying to read

Keep animation fast and quiet. If in doubt, remove it.

## Images

Use real screenshots for:

- portfolio
- proof
- client work
- live site previews

Generated images may be used for:

- soft product mockups
- abstract UI illustrations
- non-client explanatory visuals

Do not use generated images as fake portfolio work.

## SEO Structure

Every indexable page needs:

- unique `<title>`
- unique meta description
- one clear H1
- relevant internal links
- natural local/service keywords
- CTA to `/get-started.html`

The site should interlink:

- blog posts to service and location pages
- service pages to related blogs and location pages
- location pages to relevant services and preview CTA

## Forms

Forms should feel easy.

For first-touch lead capture, ask for one thing only.

For second-step preview forms, ask for the minimum needed:

- name
- best contact
- business name or Google profile
- optional Facebook/website link

Use Netlify Forms and include the hidden `form-name` field.

