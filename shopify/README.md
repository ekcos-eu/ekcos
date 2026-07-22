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
- commercial terms + MOQ tabulky ze stávajícího webu  
- produkční podmínky (MX → CZ, 6–10 týdnů, 100 % předem)

Texty v hero a formuláři jde upravit v Theme Editoru. Ceník a MOQ jsou v Liquid.

## Marketing web

Next.js `/{locale}/custom-branding` je odstraněná a přesměrovaná na:

`https://eshop.ekcos.eu/pages/custom-branding`
