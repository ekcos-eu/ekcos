## Learned User Preferences

- Prefer marketing copy, tone, and typography aligned with https://eshop.ekcos.eu (Shopify content pages should match eshop text sizing, not smaller marketing-site type)
- Bathroom hotspot clicks should open an on-page overlay (not navigate away); emphasize the blue product variant, briefly mention other colors/scents, and include a clear CTA to the eshop
- Bathroom map should keep correct aspect ratio, cover the full viewport (edge-to-edge, top-to-bottom), stay stable on window resize with hotspots aligned to the image, avoid instructional UI chrome, and not show a vertical scrollbar
- Collapse the site header into the mobile menu earlier (around `lg`) so nav does not overflow
- Header eshop CTA should read "Shop" (and localized equivalents), not longer shop URLs or labels
- Locale switcher should show country flags; in the open menu use language names without locale-code abbreviations
- Treat assets under `public/technical/` (e.g. `eco-one.pdf`, `ekcos-biodegradable-products.docx`) as the source of truth for Eco-One page content, including bold/emphasis and callout styling from those docs
- Prefer scannable long-form pages and Sanity articles with clear heading hierarchy; larger body text blocks should use `text-justify`
- Articles index should show only title and intro image; detail pages omit a large hero image, end with an eshop CTA, and link product mentions to the eshop
- Soft blue top-of-page gradient and blue accent headings/text should appear on marketing pages (articles and Eco-One)
- Product link hovers should preview the blue 3B product image from `public/products/`
- User typically communicates in Czech

## Learned Workspace Facts

- ekcos is a Next.js App Router marketing site for ëkcos sanitary products; purchases go to the external Shopify shop at https://eshop.ekcos.eu
- There is no in-app product configurator or `/products` browsing; main nav is Articles + Eco-One, with Shop linking out to the eshop
- Product data in `lib/products.ts` is for homepage bathroom-map hotspots/overlays, not a local shop catalog; Sanity is used for articles
- Articles live at `/{locale}/articles`; Sanity Studio is at `/studio`
- i18n uses next-intl with locales `en`, `es`, `fr`, `de`, `it`, `cs` and copy in `dictionaries/*.json`
- Homepage is an interactive bathroom map with hotspots and product overlays (`components/home/bathroom-map.tsx`, asset `public/home/bathroom-map.jpg`, typically 2:1)
- Brand primary blue is `#0F68B2`; package manager is bun
- Interactive bathroom UX was patterned after the flora-interactive map approach (pan/hotspots), adapted as an overlay-first experience
- Standalone contact page was removed; site no longer exposes a Contact nav item
- Site footer includes copyright and is omitted on the homepage so the bathroom map can stay full-viewport
- Custom Branding lives on Shopify (`shopify/` → `https://eshop.ekcos.eu/pages/custom-branding`); Next.js `/{locale}/custom-branding` redirects there; inquiry form targets `support@ekcos.eu` with per-product quantities and blue 3B thumbnails; do not publish MOQ/pricing/quantity tables (keep Commercial terms and Good to know); Shopify content pages should be localized for all shop languages
- B2B & VAT Guide lives on Shopify (`shopify/` → `https://eshop.ekcos.eu/pages/b2b-vat-guide`)
