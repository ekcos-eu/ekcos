## Learned User Preferences

- Prefer marketing copy and tone aligned with https://eshop.ekcos.eu
- Bathroom hotspot clicks should open an on-page overlay (not navigate away); emphasize the blue product variant, briefly mention other colors/scents, and include a clear CTA to the eshop
- Bathroom map should keep correct aspect ratio, fill the viewport width, and avoid instructional UI chrome (e.g. usage hints)
- Collapse the site header into the mobile menu earlier (around `lg`) so nav does not overflow
- In the product configurator: use 1:1 product photos, avoid desktop scrolling in product benefits, default xcrën puck to blue, and omit color-code labels on swatches
- Treat `public/technical/eco-one.pdf` (and related assets under `public/technical/`) as the source of truth for Eco-One page content
- User typically communicates in Czech

## Learned Workspace Facts

- ekcos is a Next.js App Router marketing site for ëkcos sanitary products; purchases go to the external Shopify shop at https://eshop.ekcos.eu
- Product catalog is hardcoded TypeScript (`lib/products.ts` / variants), not Prisma or a local DB; Sanity is used for articles only
- i18n uses next-intl with locales `en`, `es`, `fr`, `de`, `it`, `cs` and copy in `dictionaries/*.json`
- Homepage is an interactive bathroom map with hotspots and product overlays (`components/home/bathroom-map.tsx`, asset `public/home/bathroom-map.jpg`, typically 2:1)
- Brand primary blue is `#0F68B2`; package manager is bun
- Product browsing is a single configurator at `/{locale}/products` (no per-product `/products/[slug]` routes)
- Interactive bathroom UX was patterned after the flora-interactive map approach (pan/hotspots), adapted as an overlay-first experience
