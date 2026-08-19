## Learned User Preferences

- Prefer marketing copy, tone, and typography aligned with https://eshop.ekcos.eu (Shopify content pages should match eshop text sizing, not smaller marketing-site type)
- Bathroom hotspot clicks should open a standalone Flora-style product detail page at `/{locale}/products/[slug]` (not overlay-only); show key info, product colors, all photos, interactive hover on the image, a lowercase localized color/scent label in the image top-left (e.g. `yellow / citrus`, `blue / fresh`), auto color rotation about every 4s, and a clear CTA to the eshop—detail lightbox/gallery should show only shots for the currently selected color and must work on mobile; pause auto color rotation while the lightbox is open; avoid continuous pulse, spotlight, canvas particles, and glow behind the image
- Product detail layout: long description above key benefits (omit short intro); aim for 7 key benefits per product; link Eco-One / recyclable-biodegradable key-benefit copy to the Eco-One page
- Bathroom map should keep correct aspect ratio, stretch edge-to-edge, show the full scene without horizontal scrolling (including on mobile), stay stable on window resize with hotspots aligned to products, and avoid instructional UI chrome
- Collapse the site header into the mobile menu earlier (around `lg`) so nav does not overflow
- Header eshop CTA should read "Shop" (and localized equivalents), not longer shop URLs or labels
- Locale switcher should show country flags; in the open menu use language names without locale-code abbreviations
- Treat assets under `public/technical/` (e.g. `eco-one.pdf`, `ekcos-biodegradable-products.docx`) as the source of truth for Eco-One page content, including bold/emphasis and callout styling from those docs
- Prefer scannable long-form pages and Sanity articles with clear heading hierarchy; larger body text blocks should use `text-justify`
- Articles index should show only title and intro image; detail pages omit a large hero image, end with an eshop CTA, and link product mentions to the eshop
- Soft blue top-of-page gradient and blue accent headings/text should appear on marketing pages (articles, Eco-One, and Private Label); product link hovers should preview the blue 3B product image from `public/products/`
- User typically communicates in Czech

## Learned Workspace Facts

- ekcos is a Next.js App Router marketing site for ëkcos sanitary products; purchases go to the external Shopify shop at https://eshop.ekcos.eu
- Bathroom hotspots link to standalone product detail pages at `/{locale}/products/[slug]`; there is still no full in-app shop catalog or configurator—main nav is Articles + Eco-One + Private Label, with Shop linking out to the eshop
- Product detail text/price/variants come from `public/products/products.csv`; marketing copy/labels are localized in `dictionaries/*.json`; product images come from local `public/products/*/PhotoStock/` (main/variants) and `public/products/*/Detail/` (color-filtered detail shots)—not Shopify CDN; `lib/products.ts` holds product metadata; `lib/bathroom-hotspots.ts` holds desktop/mobile hotspot positions; Sanity is used for articles
- Articles live at `/{locale}/articles`; Sanity Studio is at `/studio`
- i18n uses next-intl with locales `en`, `es`, `fr`, `de`, `it`, `cs` and copy in `dictionaries/*.json`
- Homepage is an interactive bathroom map with hotspots (`components/home/bathroom-map.tsx`; desktop `public/home/bathroom-map.jpg` typically 2:1, mobile `public/home/bathroom-map-mobile.jpg`), followed by a homepage-only intro video (`components/layout/hero-intro-video.tsx`, `public/videos/ekcos-hero.mp4`) with no overlay gradient or text
- Brand primary blue is `#0F68B2`; package manager is bun
- Interactive bathroom UX is patterned after flora-interactive (pan/hotspots plus standalone product detail pages with rich media and image motion)
- Standalone contact page was removed; site no longer exposes a Contact nav item
- Site footer includes copyright and appears on all pages including the homepage
- Custom Branding, B2B & VAT Guide, and FAQ live on Shopify (`shopify/` → `https://eshop.ekcos.eu/pages/custom-branding`, `https://eshop.ekcos.eu/pages/b2b-vat-guide`, FAQ); Next.js `/{locale}/custom-branding` redirects there; Custom Branding inquiry form targets `support@ekcos.eu` with per-product quantities and blue 3B thumbnails; do not publish MOQ/pricing/quantity tables (keep Commercial terms and Good to know); B2B reverse-charge 0% VAT applies to all EU countries except Czech Republic (Czech VAT ID); Shopify content pages should be localized for all shop languages
- Private Label lives on the Next.js marketing site at `/{locale}/private-label`; inquiry form posts to `/api/private-label` and sends email via Resend (`RESEND` / `RESEND_API_KEY`, optional `RESEND_FROM_EMAIL`, `PRIVATE_LABEL_TO_EMAIL`)
