# MadeReal Site Agent Guide

Read this file before changing the MadeReal website. It explains the site structure, build process, SEO workflow and the safest way to add pages.

## Project Goal

MadeReal sells high-quality local business websites for a flat one-off fee of 197 GBP. The site should generate enquiries by making the offer feel clear, trustworthy and easy:

- 5+ page website
- 8 location landing pages
- contact form or booking form
- Google Business Profile setup
- mobile-first design
- basic local SEO
- no MadeReal monthly fee
- free preview first, pay only if the client wants the site

Keep copy simple. The best style reference is the Google Business Profile page: spacious, calm, plain language, one idea at a time, easy to read on mobile.

## Build System

This is a static HTML site with a Node build script.

- Source HTML lives in the repo root and subfolders.
- Built output goes to `dist/`.
- Netlify publishes `dist/`.
- Build command: `npm run build`
- Netlify config: `netlify.toml`
- Build script: `build.js`

Always run:

```bash
npm run build
```

before committing changes.

## Shared Header And Footer

Most pages contain:

```html
[[[INJECT_HEADER]]]
[[[INJECT_FOOTER]]]
```

During build, `build.js` replaces those placeholders with:

- `header_template.html`
- `footer_template.html`

Do not paste the full header or footer into normal pages. Update the templates instead.

Important: `header_template.html` already contains the mobile menu JavaScript. Do not add duplicate `const mobileMenuBtn` scripts to individual pages.

## Design Rules

Use the existing brand, but keep commercial pages calm and spacious:

- White or very light grey backgrounds.
- Short headings.
- One clear idea per section.
- Use generous vertical spacing.
- Use rounded cards only for real repeated items, forms, previews or examples.
- Avoid heavy borders and hard shadows unless a page already depends on that style.
- Keep CTA buttons obvious and consistent.
- Prefer simple product mockups, screenshots and real portfolio previews.
- Do not make the homepage feel like a loud agency landing page.

Primary CTA language:

- `Get my free preview`
- `Start my preview`
- `Get FREE Preview` in the header is acceptable.

Primary CTA target:

```html
/get-started.html
```

## SEO Rules

Every public page should have:

- unique `<title>`
- unique meta description
- one clear `<h1>`
- internal links to relevant service, location, blog and conversion pages
- copy written for local UK business owners

Do not keyword-stuff. Make the page useful first, then naturally include the target phrase.

## Adding A Blog Post

Blog posts are Markdown files in:

```text
content/posts/
```

Use this front matter:

```markdown
---
title: "Example Blog Title"
meta_description: "Short SEO description under about 155 characters."
date: "2026-05-16"
slug: "example-blog-title"
author: "MadeReal"
keywords: ["web design", "local SEO", "small business websites"]
excerpt: "Short summary used on the blog index."
---

# Example Blog Title

Write the post content here.
```

Build output:

```text
dist/blog/example-blog-title.html
```

The blog index is `blog.html`. `build.js` automatically injects blog cards into `[[[BLOG_POSTS]]]`.

After adding a post:

1. Add the `.md` file to `content/posts/`.
2. Link naturally to at least one relevant service page.
3. Link naturally to at least one location page when relevant.
4. Link to `/get-started.html` where the call to action makes sense.
5. Run `npm run build`.
6. Check the generated post in `dist/blog/`.

## Adding A Location Page

Location pages live in the repo root and use the naming pattern:

```text
web-design-town-name.html
```

Existing examples:

- `web-design-colne.html`
- `web-design-burnley.html`
- `web-design-nelson.html`
- `web-design-pendle.html`

When adding a location page:

1. Copy the closest existing location page.
2. Change the title, meta description and H1.
3. Use the town name naturally in headings and body copy.
4. Mention the 197 GBP offer clearly.
5. Link to relevant services and `/get-started.html`.
6. Add the page to the Areas dropdown in `header_template.html` if it should be visible.
7. Add the page to the homepage local areas section if appropriate.
8. Run `npm run build`.

The sitemap is generated automatically from built HTML files.

## Adding A Service Page

Service pages live in:

```text
services/
```

Existing examples:

- `services/tradesman-websites.html`
- `services/tradesman-roofing.html`
- `services/tradesman-electricians.html`
- `services/small-business-websites.html`
- `services/hospitality-websites.html`
- `services/professional-services.html`
- `services/ecommerce-websites.html`

Top-level service pages also exist:

- `graphic-design.html`
- `printing.html`

When adding a service page:

1. Use an existing service page as the structural reference.
2. Give the page a unique layout if creating a set of niche pages.
3. Set a unique title, meta description and H1.
4. Explain what the buyer gets for 197 GBP where relevant.
5. Add links to related service pages, relevant location pages and `/get-started.html`.
6. Add it to the Services dropdown in `header_template.html` if it should be visible.
7. Run `npm run build`.

## Forms

Netlify Forms are used on contact and preview pages.

For a basic form:

```html
<form name="Contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="Contact">
</form>
```

Keep form labels clear and human. The form should feel easy, not like a long application.

## Assets

Static assets live in:

```text
assets/
```

Portfolio screenshots live in:

```text
assets/work/
```

`build.js` copies `assets/` into `dist/assets/`. If you add a new asset folder outside `assets/`, update `copyStaticAssets()` in `build.js`.

Use compressed JPG or WebP for screenshots unless transparency is needed.

## Sitemap And Robots

`build.js` generates:

- `dist/sitemap.xml`
- `dist/robots.txt`

Do not hand-edit those generated files. Change source pages, then rebuild.

## Deployment

Netlify uses:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Before pushing:

```bash
npm run build
git status --short
```

## Common Pitfalls

- Do not edit `dist/` directly. It is generated output.
- Do not duplicate the mobile menu script in pages.
- Do not add fake portfolio work.
- Do not remove internal links without replacing them.
- Do not make every page look identical.
- Do not bury the 197 GBP offer.
- Do not make the site feel aggressive or cluttered.

## Preferred Workflow For AI Agents

1. Read this file.
2. Inspect the relevant source page and templates.
3. Make the smallest useful source change.
4. Run `npm run build`.
5. Browser-check important pages when layout changed.
6. Commit only source files and required assets.

