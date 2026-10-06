# Custom Branding — Shopify

Hotový landing page pro eshop (Online Store 2.0). Sloučí obsah ze stávající stránky `/{locale}/custom-branding` a dokumentu `Ekcos_Custom_Branding.docx`, včetně poptávkového formuláře.

## Soubory

| Soubor | Kam v tématu |
| --- | --- |
| `sections/custom-branding.liquid` | `sections/custom-branding.liquid` |
| `templates/page.custom-branding.json` | `templates/page.custom-branding.json` |
| `assets/cb-*.png` | `assets/` (náhledy produktů v modré 3B) |

## Instalace

1. V Shopify Admin → **Online Store → Themes → … → Edit code**.
2. Nahraj:
   - `sections/custom-branding.liquid`
   - `templates/page.custom-branding.json`
   - všechny `assets/cb-*.png`
3. **Online Store → Pages → Add page**
   - Title: `Custom Branding`
   - Handle: `custom-branding` (URL: `/pages/custom-branding`)
   - Theme template: **custom-branding**
4. Ulož a otevři náhled.

### Alternativa bez JSON šablony

Pokud theme nepodporuje JSON page templates, přidej sekci přes **Customize → Add section → Custom Branding** na libovolnou page.

## E-mail na support@ekcos.eu

Shopify nativní `{% form 'contact' %}` posílá zprávy na **Customer email** obchodu.

1. **Settings → Notifications** (nebo Store details)
2. Customer email nastav na `support@ekcos.eu`
3. Otestuj odesláním formuláře

## Formulář

- jméno, firma, e-mail, telefon  
- seznam produktů s **modrým (3B) náhledem** a **množstvím u každého produktu**  
- zpráva  

Do e-mailu dorazí mimo jiné:

- Name, Company, Email, Phone  
- `products` — např. `Xcreen HD: 576 pcs; Ekcoscreen: 1200 pcs`  
- `quantity` — součet kusů  
- Message (`body`)  
- skryté pole `form_name` = `Custom Branding inquiry`

## Obsah na stránce

- marketing copy z dokumentu (why / print vs cut-out / packaging / colour & fragrance / good to know)  
- commercial terms (entry fee, branding cost, packaging labels)  
- **bez** veřejných MOQ tabulek — množství ve formuláři je volné, detaily se domluví po poptávce  
- produkční podmínky v Good to know (MX → CZ, 6–10 týdnů, 100 % předem)

Texty v hero a formuláři jde upravit v Theme Editoru. Ceník a MOQ jsou v Liquid.

## Marketing web

Next.js `/{locale}/custom-branding` je odstraněná a přesměrovaná na:

`https://eshop.ekcos.eu/pages/custom-branding`

## B2B & 0% VAT Guide

Pro stránku B2B průvodce jsou připravené i tyto soubory:

- `sections/b2b-vat-guide.liquid`
- `templates/page.b2b-vat-guide.json`
- `assets/vat-guide-step-1.png`
- `assets/vat-guide-step-2.png`
- `assets/vat-guide-step-3.png`

Nasazení:

1. Nahraj liquid, JSON template i 3 screenshoty do Shopify theme.
2. Vytvoř page:
   - Title: `B2B & 0% VAT Guide`
   - Handle: `b2b-vat-guide`
   - Theme template: **b2b-vat-guide**
3. Otevři náhled na `/pages/b2b-vat-guide`.

Stránka je vizuálně sladěná s `Custom Branding`, obsahuje checkout screenshoty ke každému kroku a překládá se podle aktivního jazyka eshopu.

## FAQ

E-shop FAQ (distributors zůstává na marketing webu). Soubory se generují z `content/faq/eshop/*.json` (bez slovinštiny):

```bash
bun scripts/generate-shopify-faq.ts          # jen lokální soubory
bun scripts/generate-shopify-faq.ts --push   # + upload do live theme + page /pages/faq
```

Soubory:

- `sections/faq.liquid` — layout, CSS, locale switch
- `snippets/faq-eshop-{locale}.liquid` — obsah (en/cs/…, bez `sl`)
- `templates/page.faq.json`

Nasazení:

1. Spusť generátor s `--push`, nebo nahraj liquid/snippet/template ručně.
2. Page:
   - Title: `FAQ`
   - Handle: `faq` → `/pages/faq`
   - Theme template: **faq**

Produktové názvy v odpovědích vedou na reprezentativní produkt v eshopu (modrá / fresh). Eco-One™ vede na www.ekcos.eu. E-maily mají `mailto:`.

Kanonický zápis značky v copy: **Eco-One™**.

## Lookbook (washroom) — mobilní obrázek

Eurus Lookbook umí jen jeden obrázek, proto široký washroom na mobilu skoro není vidět. Upravená sekce přidává samostatný portrait obrázek a mobilní pozice hotspotů.

Soubory:

- `sections/lookbook.liquid` — nahraď jím `sections/lookbook.liquid` v tématu
- `assets/bathroom-map-mobile.jpg` — nahraj do Shopify **Files** (Content → Files) a vyber ho v editoru jako Mobile image

Nasazení:

1. **Online Store → Themes → … → Edit code** → přepiš `sections/lookbook.liquid`.
2. **Customize** → homepage Lookbook:
   - **Mobile image** → `bathroom-map-mobile.jpg` (700×1024)
   - u každého hotspotu nastav **Horizontal/Vertical position (mobile)**
   - **xcrën PUCK** zaškrtni **Hide on mobile** (v portrait obrázku není)

Navržené mobilní pozice (stejné jako na marketing webu):

| Produkt | Horizontal | Vertical |
| --- | --- | --- |
| frësh drop | 14 | 18 |
| üro lite | 84 | 9 |
| powër screen | 84 | 21 |
| xcrën HD | 85 | 39 |
| ëkcoscreen | 84 | 52 |
| ëz trap | 80 | 64 |
| ëkco clip | 27 | 63 |
| ëkco mat | 76 | 91 |

Desktop lookbook a existující hotspoty zůstanou beze změny, dokud mobilní pozice necháš na `0`.

## Complementary products — vedle sebe

Eurus skládá complementary produkty pod sebe (horizontální řádky). Pro „Don't forget the base“ (bílá + černá základna) je lepší 2sloupcová mřížka.

Soubor:

- `assets/component-complementary-products.css` — nahraď jím `assets/component-complementary-products.css` v tématu

Nasazení:

1. **Online Store → Themes → … → Edit code** → otevři `assets/component-complementary-products.css`.
2. Přepiš obsah souborem z tohoto repa a ulož.

Dva produkty jdou vedle sebe, jeden zůstane na celou šířku, Add to cart zůstane viditelné i bez hoveru.

Shopify Recommendations API schovává produkty, které už jsou v košíku — proto po přidání základny zmizí z Don't forget the base. Oprava čte complementary produkty z metafield Search & Discovery, takže zůstanou vidět pořád.

Soubor:

- `snippets/complementary-products.liquid` — nahraj jako `snippets/complementary-products.liquid`

Nasazení:

1. **Online Store → Themes → … → Edit code** → **Add a new snippet** → `complementary-products` a vlož obsah souboru.
2. V `sections/main-product.liquid` najdi `{%- when 'complementary' -%}` a **celý ten `when` blok** (až po `{%- when 'line_item_property' -%}`, ten `when` nech) nahraď tímto:

```liquid
{%- when 'complementary' -%}
  {% render 'complementary-products',
    block: block,
    product: product,
    collection: collection
  %}
```

3. Ulož a ověř: přidej bílou základnu do košíku — černá i bílá zůstanou v Don't forget the base.
