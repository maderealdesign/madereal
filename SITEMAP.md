# MadeReal Website - Complete Page Sitemap

## Overview

This document maps all pages on the MadeReal website. The site uses a static HTML build system where source files are in the root directory and built output goes to `dist/`.

**Total Pages to Index:** 38 (5 core + 9 services + 8 locations + 26 blog posts)

---

## Root Level Pages (5 pages)

These are the main navigation pages located directly in the project root:

| File | URL | Description |
|------|-----|-------------|
| `index.html` | `/` | Homepage - £197 value proposition, portfolio showcase, lead form |
| `about.html` | `/about` | About page - company story, values, team info |
| `contact.html` | `/contact` | Contact page - contact form, phone number, location |
| `get-started.html` | `/get-started` | Lead capture - free preview request flow |
| `faq.html` | `/faq` | FAQ page - common questions about pricing and process |

---

## Service Pages (9 pages)

### Top-Level Services (2 pages)

Located in root directory:

| File | URL | Description |
|------|-----|-------------|
| `graphic-design.html` | `/graphic-design` | Graphic design services overview |
| `printing.html` | `/printing` | Printing services overview |

### Subdirectory Services (7 pages)

Located in `services/` subfolder:

| File | URL | Description |
|------|-----|-------------|
| `services/tradesman-websites.html` | `/services/tradesman-websites` | General tradesman website packages |
| `services/tradesman-roofing.html` | `/services/tradesman-roofing` | Roofing specialist website packages |
| `services/tradesman-electricians.html` | `/services/tradesman-electricians` | Electrician website packages |
| `services/small-business-websites.html` | `/services/small-business-websites` | Small business website packages |
| `services/hospitality-websites.html` | `/services/hospitality-websites` | Hospitality/restaurant website packages |
| `services/professional-services.html` | `/services/professional-services` | Professional services (lawyers, consultants) websites |
| `services/ecommerce-websites.html` | `/services/ecommerce-websites` | E-commerce online store websites |

---

## Location Landing Pages (8 pages)

These are dedicated local SEO pages for each target town. Each targets "web design [town]" keywords:

| File | URL | Target Town | Local SEO Focus |
|------|-----|-------------|-----------------|
| `web-design-colne.html` | `/web-design-colne` | Colne | Primary target area |
| `web-design-burnley.html` | `/web-design-burnley` | Burnley | Secondary market |
| `web-design-nelson.html` | `/web-design-nelson` | Nelson | Pendle district |
| `web-design-pendle.html` | `/web-design-pendle` | Pendle | District-wide coverage |
| `web-design-skipton.html` | `/web-design-skipton` | Skipton | North expansion area |
| `web-design-barnoldswick.html` | `/web-design-barnoldswick` | Barnoldswick | Local village market |
| `web-design-blackburn.html` | `/web-design-blackburn` | Blackburn | Larger urban market |
| `web-design-clitheroe.html` | `/web-design-clitheroe` | Clitheroe | Rural coverage area |

---

## Blog System (dynamic - 24 posts!)

Blog posts are written in Markdown and auto-generated during build:

**Source Location:** `content/posts/*.md`  
**Output Location:** `dist/blog/[slug].html`  
**Index Page:** `blog.html` → `/blog`

### All Blog Posts (24 total):
1. **Cafe & Restaurant Website Guide** - `cafe-restaurant-website-guide.md`
2. **E-commerce for Small Shops** - `ecommerce-website-small-shops.md`
3. **Electrician Website Guide** - `electrician-website-guide.md`
4. **Flyer Design for Local Business** - `flyer-design-local-business.md`
5. **Google Business Profile & Website** - `google-business-profile-and-website.md`
6. **Graphic Design Brand Consistency** - `graphic-design-brand-consistency.md`
7. **Homepage Checklist Small Business** - `homepage-checklist-small-business.md`
8. **How Much Does a Website Cost UK** - `how-much-does-a-website-cost-uk.md`
9. **Get More Local Enquiries** - `how-to-get-more-local-enquiries.md`
10. **Landing Page vs Full Website** - `landing-page-vs-full-website.md`
11. **Local SEO Checklist Small Business** - `local-seo-checklist-small-business.md`
12. **Mobile First Web Design** - `mobile-first-web-design.md`
13. **One-off Fee vs Monthly Retainer** - `one-off-website-fee-vs-monthly-retainer.md`
14. **Professional Services Website Trust** - `professional-services-website-trust.md`
15. **Roofing Website Guide** - `roofing-website-guide.md`
16. **SEO Friendly Blog Posts** - `seo-friendly-blog-posts-small-business.md`
17. **Service Area Pages Local SEO** - `service-area-pages-local-seo.md`
18. **Tradesman Website Checklist** - `tradesman-website-checklist.md`
19. **Web Design for Burnley Businesses** - `web-design-burnley-businesses.md`
20. **Web Design for Colne Businesses** - `web-design-colne-businesses.md`
21. **Website Content Checklist** - `website-content-checklist.md`
22. **Website Mistakes Small Businesses Make** - `website-mistakes-small-businesses-make.md`
23. **Website vs Facebook Page** - `website-vs-facebook-page.md`
24. **What Makes a Website Look Professional** - `what-makes-a-website-look-professional.md`
25. **Why Reviews Matter on Websites** - `why-reviews-matter-on-websites.md`
26. **Why Your Small Business Needs a Website** - `why-your-small-business-needs-a-website.md`

Each blog post:
- Auto-generates SEO metadata (title, description)
- Creates breadcrumbs and internal linking
- Links to relevant service pages automatically
- Includes CTA to `/get-started` where appropriate

---

## Template Files (NOT indexed)

These files are used by the build system but should NOT appear in search results:

| File | Purpose |
|------|---------|
| `header_template.html` | Shared header with navigation, mobile menu JS |
| `footer_template.html` | Shared footer with links, contact info |
| `blog_post_template.html` | Template for auto-generating blog post pages |

---

## Build Output (dist/ folder)

**What is the `dist/` folder?**

The `dist/` (distribution) folder contains the **built, production-ready version** of your website. This is what gets deployed to Netlify and served to visitors.

### Why it exists:
- **Build automation:** The `build.js` script processes all source HTML files
- **Header/Footer injection:** Replaces `[[[INJECT_HEADER]]]` and `[[[INJECT_FOOTER]]]` markers with actual content from templates
- **Blog generation:** Converts Markdown posts into full HTML pages
- **Asset copying:** Copies images, fonts, and other static assets
- **SEO generation:** Auto-generates `sitemap.xml` and `robots.txt`

### Contents of dist/:
```
dist/
├── index.html              (built homepage)
├── about.html
├── contact.html
├── get-started.html
├── faq.html
├── graphic-design.html
├── printing.html
├── blog.html
├── blog/                   (auto-generated blog posts)
│   ├── example-post.html
│   └── another-article.html
├── services/               (built service pages)
│   ├── tradesman-websites.html
│   └── ...
├── web-design-colne.html
├── web-design-burnley.html
├── assets/                 (copied images, fonts)
├── sitemap.xml             (auto-generated SEO sitemap)
└── robots.txt              (auto-generated search engine rules)
```

**IMPORTANT:** Never edit files in `dist/` directly. Always make changes to source files and run `npm run build`.

---

## Navigation Structure

### Desktop Header Menu:
1. **Home** (`/`)
2. **About** (`/about`)
3. **Services** (dropdown)
   - Graphic Design
   - Printing
   - Tradesman Websites
     - General Trades
     - Roofing Specialists
     - Electricians
   - Business Websites
     - Small Business
     - Hospitality
     - Professional Services
     - E-commerce
4. **Areas** (dropdown)
   - Colne, Burnley, Nelson, Pendle, Skipton, Barnoldswick, Blackburn, Clitheroe
5. **Blog** (`/blog`)
6. **Contact** (`/contact`)
7. **CTA Button:** "Get FREE Preview" → `/get-started`

### Mobile Menu:
Same structure as desktop but with accordion-style dropdowns for Services and Areas.

---

## SEO & Internal Linking Strategy

### Core Pages (Priority 1.0):
- Homepage (`/`) - strongest internal link signals

### Service Pages (Priority 0.8):
- All service pages should link to:
  - Relevant location pages
  - `/get-started` for conversion
  - Related service pages for topic clusters

### Location Pages (Priority 0.8):
- Each targets specific "web design [town]" keywords
- Should mention the £197 offer clearly
- Link to relevant services and `/get-started`

### Blog Posts (Priority 0.7):
- Internal link to service pages naturally
- Link to location pages when relevant
- CTA to `/get-started` where appropriate

---

## File Conventions

**Standard HTML pages:** Named descriptively, no "template" in filename  
**Service subfolder:** All service-specific pages go in `services/`  
**Location pages:** Pattern is `web-design-[townname].html` (lowercase, hyphenated)  
**Blog posts:** Markdown files with frontmatter in `content/posts/`

---

## Build Verification Checklist

Before deploying changes:
1. ✅ Run `npm run build`
2. ✅ Check `dist/index.html` loads correctly
3. ✅ Verify header/footer injection worked (search for company phone number)
4. ✅ Test mobile menu functionality
5. ✅ Confirm sitemap.xml includes all pages
6. ✅ Check robots.txt allows crawling

---

## Quick Reference

| Task | Command |
|------|---------|
| Build site | `npm run build` |
| View built output | Open `dist/index.html` in browser |
| Add blog post | Create `.md` file in `content/posts/` |
| Add location page | Copy existing `web-design-[town].html`, rename and edit |
| Add service page | Create in `services/` folder, update header template dropdown |

---

*Last updated: May 16, 2026*  
*Sitemap automatically generated from source files*
