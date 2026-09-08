# Self-hosted font assets

Downloaded from the live Google Fonts stylesheet using a current Chrome user agent. Both font files are the Latin subsets, normal style, variable weight 400–700. They are unmodified downloads.

CSS request:
https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Space+Grotesk:wght@400..700&display=swap

The complete CSS response is preserved as `google-fonts.css` for provenance. Do not load that response directly on the site; write local `@font-face` declarations pointing to the downloaded WOFF2 files.

## DM Sans

- File: `dm-sans-latin-400-700.woff2`
- Size: 36,980 bytes
- Font source: https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K6z9mXg.woff2
- Original licence: `dm-sans-OFL.txt`
- Licence source: https://raw.githubusercontent.com/google/fonts/refs/heads/main/ofl/dmsans/OFL.txt

## Space Grotesk

- File: `space-grotesk-latin-400-700.woff2`
- Size: 22,320 bytes
- Font source: https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2
- Original licence: `space-grotesk-OFL.txt`
- Licence source: https://raw.githubusercontent.com/google/fonts/refs/heads/main/ofl/spacegrotesk/OFL.txt

## CSS descriptors

Use `font-style: normal`, `font-weight: 400 700`, and `font-display: swap` for both faces.

Google Fonts' Latin unicode range for both assets:

```css
unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
```

Preserve each original licence when distributing the corresponding font.
