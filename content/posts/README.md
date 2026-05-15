# Blog Post Format

Add new blog posts as `.md` files in this folder. Each post needs front matter at the top:

```md
---
title: "Post title"
meta_description: "SEO description shown in search results."
date: "2026-05-15"
slug: "post-url-slug"
author: "MadeReal"
keywords:
  - keyword one
  - keyword two
excerpt: "Short card summary for the blog index."
---

# Post title

Write the post content here.
```

Run `npm run build` to generate:

- `dist/blog.html`
- `dist/blog/post-url-slug.html`
