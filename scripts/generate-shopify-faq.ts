/**
 * Generate Shopify FAQ section + per-locale snippets from content/faq/eshop.
 * Skips Slovenian (not enabled on the eshop).
 *
 *   bun scripts/generate-shopify-faq.ts
 *   bun scripts/generate-shopify-faq.ts --push
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const FAQ_DIR = join(ROOT, 'content/faq/eshop')
const OUT_SECTION = join(ROOT, 'shopify/sections/faq.liquid')
const OUT_SNIPPETS = join(ROOT, 'shopify/snippets')
const MCP = join(ROOT, '.cursor/mcp.json')
const THEME_ID = 'gid://shopify/OnlineStoreTheme/196215472471'
const API = '2025-01'

/** Shop locales we generate (slovinština vždy vynechaná). pt maps to Shopify pt-PT in liquid. */
const LOCALES = [
  'en',
  'cs',
  'sk',
  'de',
  'pl',
  'fr',
  'es',
  'it',
  'nl',
  'pt',
  'sv',
  'da',
  'fi',
  'el',
  'hu',
  'ro',
  'bg',
  'hr',
  'et',
  'lv',
  'lt',
] as const

const SKIP_LOCALES = new Set(['sl'])

type FaqBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | {
      type: 'chart'
      variant: 'biodegradation'
      rows: { label: string; value: number; display: string }[]
      caption: string
    }

type FaqItem = { id: string; question: string; answer: FaqBlock[] }
type FaqCategory = { id: string; title: string; items: FaqItem[] }
type FaqContent = {
  hero: { title: string; tagline: string; intro: string }
  metrics: { value: string; label: string }[]
  categories: FaqCategory[]
  contact: { title: string; body: string }
  footnote?: string
}

const PRODUCT_LINKS: { pattern: RegExp; href: string }[] = [
  {
    pattern: /xcr[eë]n\s+HD(?:\s*60\+)?/gi,
    href: '/products/xcren-hd-blue-fresh',
  },
  {
    pattern: /xcr[eë]n\s+[Pp]uck/gi,
    href: '/products/xcren-puck-blue-fresh',
  },
  {
    pattern: /[eë]kcoscreen(?:\s*60\+)?/gi,
    href: '/products/ekcoscreen-blue-fresh',
  },
  {
    pattern: /pow[eë]r\s+screen/gi,
    href: '/products/power-screen-blue-fresh',
  },
  {
    pattern: /basic\s+scr[eë]en/gi,
    href: '/collections/basic-screen',
  },
  {
    pattern: /[uü]ro\s+lite/gi,
    href: '/products/uro-lite-blue-fresh',
  },
  {
    pattern: /[eë]kco\s+(?:clip|loop)/gi,
    href: '/products/ekco-clip-blue-fresh',
  },
  {
    pattern: /fr[eë]sh\s+drop/gi,
    href: '/products/fresh-drop-blue-fresh',
  },
  {
    pattern: /[eë]z\s+trap/gi,
    href: '/products/ez-trap-with-removal-tool',
  },
  {
    pattern: /[eë]kco\s+mat/gi,
    href: '/products/ekco-mat-black',
  },
]

/** Shopify content pages mentioned in FAQ answers */
const PAGE_LINKS: { pattern: RegExp; href: string }[] = [
  {
    pattern:
      /Custom Branding(?:-sida|-side| -sivultamme| pagina| page)?|Branding personalizzato|branding personalizat/gi,
    href: '/pages/custom-branding',
  },
  {
    // Longer phrases first via alternation order
    pattern: new RegExp(
      [
        'B2B és 0%-os áfával kapcsolatos útmutatónkban',
        'B2B- und 0%-Mehrwertsteuer-Leitfaden',
        'B2B & 0% ALV -oppaassamme',
        'B2B ja 0% käibemaksu juhendist',
        'Vodiču za B2B i 0% PDV-a',
        'ръководство за B2B и 0% ДДС',
        'Przewodniku B2B i 0% VAT',
        'B2B un 0% PVN ceļvedī',
        'B2B ir 0% PVM vadove',
        'Guide B2B et TVA 0%',
        'Guía B2B y 0% IVA',
        'Guida B2B e IVA 0%',
        'Guia B2B e 0% de IVA',
        'Ghidul nostru B2B și 0% TVA',
        'B2B & 0% VAT Guide',
        'B2B & 0% BTW Gids',
        'B2B & 0% momsguide',
        'B2B & 0% ΦΠΑ',
        'B2B & 0% DPH',
        'B2B a 0% DPH',
        'B2B i 0% PDV-a',
        'B2B și 0% TVA',
        'B2B и 0% ДДС',
        'B2B in 0 % DDV',
      ]
        .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
      'gi',
    ),
    href: '/pages/b2b-vat-guide',
  },
]

const LINK_CLASS = 'faq-page__inline-link'
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function linkify(text: string, locale: string): string {
  const ecoHref = `https://www.ekcos.eu/${locale === 'pt' ? 'pt' : locale}/eco-one`
  type Part = { start: number; end: number; html: string }
  const parts: Part[] = []

  for (const m of text.matchAll(/Eco-One™/g)) {
    if (m.index == null) continue
    parts.push({
      start: m.index,
      end: m.index + m[0].length,
      html: `<a class="${LINK_CLASS}" href="${ecoHref}">${escapeHtml(m[0])}</a>`,
    })
  }

  for (const m of text.matchAll(EMAIL_RE)) {
    if (m.index == null) continue
    const email = m[0]
    parts.push({
      start: m.index,
      end: m.index + email.length,
      html: `<a class="${LINK_CLASS}" href="mailto:${email}">${escapeHtml(email)}</a>`,
    })
  }

  for (const entry of PAGE_LINKS) {
    const re = new RegExp(entry.pattern.source, entry.pattern.flags)
    for (const m of text.matchAll(re)) {
      if (m.index == null) continue
      parts.push({
        start: m.index,
        end: m.index + m[0].length,
        html: `<a class="${LINK_CLASS}" href="${entry.href}">${escapeHtml(m[0])}</a>`,
      })
    }
  }

  for (const entry of PRODUCT_LINKS) {
    const re = new RegExp(entry.pattern.source, entry.pattern.flags)
    for (const m of text.matchAll(re)) {
      if (m.index == null) continue
      parts.push({
        start: m.index,
        end: m.index + m[0].length,
        html: `<a class="${LINK_CLASS}" href="${entry.href}">${escapeHtml(m[0])}</a>`,
      })
    }
  }

  parts.sort((a, b) => a.start - b.start || b.end - a.end)
  const chosen: Part[] = []
  let cursor = 0
  for (const p of parts) {
    if (p.start < cursor) continue
    chosen.push(p)
    cursor = p.end
  }

  let out = ''
  let i = 0
  for (const p of chosen) {
    out += escapeHtml(text.slice(i, p.start))
    out += p.html
    i = p.end
  }
  out += escapeHtml(text.slice(i))
  return out
}

function renderChart(block: Extract<FaqBlock, { type: 'chart' }>, locale: string): string {
  const rows = block.rows
    .map((row) => {
      const filled = Math.max(0, Math.min(100, row.value))
      const isZero = filled === 0
      const bar = isZero
        ? `<div class="faq-page__chart-fill faq-page__chart-fill--zero" style="width:0.75rem"></div>`
        : `<div class="faq-page__chart-fill" style="width:${filled}%"></div>`
      const valueClass = isZero
        ? 'faq-page__chart-value faq-page__chart-value--zero'
        : 'faq-page__chart-value'
      return `<div class="faq-page__chart-row">
  <div class="faq-page__chart-meta">
    <span class="faq-page__chart-label">${linkify(row.label, locale)}</span>
    <span class="${valueClass}">${escapeHtml(row.display)}</span>
  </div>
  <div class="faq-page__chart-track">${bar}</div>
</div>`
    })
    .join('')
  return `<figure class="faq-page__chart" aria-label="${escapeHtml(block.caption)}">${rows}<figcaption class="faq-page__chart-caption">${escapeHtml(block.caption)}</figcaption></figure>`
}

function renderBlock(block: FaqBlock, locale: string): string {
  if (block.type === 'paragraph') {
    return `<p>${linkify(block.text, locale)}</p>`
  }
  if (block.type === 'list') {
    const items = block.items
      .map((item) => `<li>${linkify(item, locale)}</li>`)
      .join('')
    return `<ul>${items}</ul>`
  }
  if (block.type === 'chart') {
    return renderChart(block, locale)
  }
  const headers = block.headers
    .map((h) => `<th>${linkify(h, locale)}</th>`)
    .join('')
  const rows = block.rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell, ci) =>
              `<td${ci === 0 ? ' class="faq-page__table-price"' : ''}>${linkify(cell, locale)}</td>`,
          )
          .join('')}</tr>`,
    )
    .join('')
  return `<div class="faq-page__table-wrap"><table class="faq-page__table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`
}

function loadFaq(locale: string): FaqContent {
  if (SKIP_LOCALES.has(locale)) {
    throw new Error(`Locale ${locale} is excluded from Shopify FAQ`)
  }
  const path = join(FAQ_DIR, `${locale}.json`)
  return JSON.parse(readFileSync(path, 'utf8')) as FaqContent
}

function pageTitle(locale: string): string {
  const titles: Record<string, string> = {
    en: 'FAQ for the e-shop',
    cs: 'FAQ pro e-shop',
    sk: 'FAQ pre e-shop',
    de: 'FAQ für den E-Shop',
    pl: 'FAQ dla e-sklepu',
    fr: 'FAQ e-shop',
    es: 'FAQ de la tienda online',
    it: 'FAQ e-shop',
    nl: 'FAQ voor de webshop',
    pt: 'FAQ da loja online',
    sv: 'FAQ för webbshoppen',
    da: 'FAQ til webshoppen',
    fi: 'FAQ verkkokaupalle',
    el: 'FAQ για το e-shop',
    hu: 'FAQ az e-shophoz',
    ro: 'FAQ pentru e-shop',
    bg: 'FAQ за електронния магазин',
    hr: 'FAQ za e-shop',
    et: 'FAQ e-poe jaoks',
    lv: 'FAQ e-veikalam',
    lt: 'FAQ el. parduotuvei',
  }
  return titles[locale] ?? titles.en
}

function supportButton(locale: string): string {
  const map: Record<string, string> = {
    en: 'Contact support',
    cs: 'Kontaktovat podporu',
    sk: 'Kontaktovať podporu',
    de: 'Support kontaktieren',
    pl: 'Skontaktuj się z pomocą',
    fr: 'Contacter le support',
    es: 'Contactar con soporte',
    it: 'Contatta il supporto',
    nl: 'Contact opnemen',
    pt: 'Contactar o suporte',
    sv: 'Kontakta supporten',
    da: 'Kontakt support',
    fi: 'Ota yhteyttä tukeen',
    el: 'Επικοινωνία με την υποστήριξη',
    hu: 'Kapcsolat a támogatással',
    ro: 'Contactează suportul',
    bg: 'Свържете се с поддръжката',
    hr: 'Kontaktirajte podršku',
    et: 'Võta ühendust toega',
    lv: 'Sazināties ar atbalstu',
    lt: 'Susisiekti su pagalba',
  }
  return map[locale] ?? map.en
}

function renderSnippet(locale: string, content: FaqContent): string {
  const metrics =
    content.metrics?.length > 0
      ? `<div class="faq-page__metrics">${content.metrics
          .map(
            (m) =>
              `<div class="faq-page__metric"><p class="faq-page__metric-value">${escapeHtml(m.value)}</p><p class="faq-page__metric-label">${linkify(m.label, locale)}</p></div>`,
          )
          .join('')}</div>`
      : ''

  const toc = `<nav class="faq-page__toc" aria-label="FAQ"><ol>${content.categories
    .map(
      (cat, i) =>
        `<li><a href="#faq-${escapeHtml(cat.id)}"><span class="faq-page__toc-num">${String(i + 1).padStart(2, '0')}</span> ${linkify(cat.title, locale)} <span class="faq-page__toc-count">(${cat.items.length})</span></a></li>`,
    )
    .join('')}</ol></nav>`

  const categories = content.categories
    .map((cat) => {
      const items = cat.items
        .map((item) => {
          const body = item.answer.map((b) => renderBlock(b, locale)).join('')
          return `<div class="faq-page__item"><details class="faq-page__details"><summary class="faq-page__summary"><span>${escapeHtml(item.question)}</span><span class="faq-page__icon" aria-hidden="true">+</span></summary><div class="faq-page__content">${body}</div></details></div>`
        })
        .join('')
      return `<section class="faq-page__category-block" id="faq-${escapeHtml(cat.id)}"><h2 class="faq-page__category">${linkify(cat.title, locale)}</h2>${items}</section>`
    })
    .join('')

  const contact =
    content.contact?.title || content.contact?.body
      ? `<div class="faq-page__support"><h2 class="faq-page__support-title">${escapeHtml(content.contact.title || '')}</h2>${content.contact.body ? `<p class="faq-page__support-body">${linkify(content.contact.body, locale)}</p>` : ''}<a class="faq-page__button" href="mailto:support@ekcos.eu">${escapeHtml(supportButton(locale))}</a></div>`
      : ''

  const footnote = content.footnote
    ? `<p class="faq-page__footnote">${linkify(content.footnote, locale)}</p>`
    : ''

  return `{% comment %} Auto-generated from content/faq/eshop/${locale}.json — do not edit by hand. {% endcomment %}
<div class="faq-page__hero">
  <div class="faq-page__wrap faq-page__hero-inner">
    <h1 class="faq-page__title">${escapeHtml(pageTitle(locale))}</h1>
    <p class="faq-page__lead">${linkify(content.hero.tagline, locale)}</p>
    ${content.hero.intro ? `<p class="faq-page__intro">${linkify(content.hero.intro, locale)}</p>` : ''}
  </div>
</div>
${metrics ? `<div class="faq-page__metrics-band">${metrics}</div>` : ''}
<div class="faq-page__wrap faq-page__section">
  <div class="faq-page__panel">
    ${toc}
    ${categories}
  </div>
  ${contact}
  ${footnote}
</div>
`
}

function renderSection(locales: string[]): string {
  const whenBlocks = locales
    .map(
      (locale) => `  {% when '${locale}' %}
    {% render 'faq-eshop-${locale}' %}`,
    )
    .join('\n')

  return `{% comment %}
  E-shop FAQ page for ëkcos Shopify store.
  Content snippets are generated from content/faq/eshop/*.json
  (bun scripts/generate-shopify-faq.ts). Slovenian omitted.
{% endcomment %}

{% assign faq_lang = localization.language.iso_code | default: request.locale | default: 'en' %}
{% if faq_lang == 'pt-PT' %}
  {% assign faq_lang = 'pt' %}
{% else %}
  {% assign faq_lang = faq_lang | slice: 0, 2 %}
{% endif %}

<section class="faq-page">
{% case faq_lang %}
${whenBlocks}
  {% else %}
    {% render 'faq-eshop-en' %}
{% endcase %}
</section>

<style>
  .faq-page {
    --faq-blue: #0F68B2;
    --faq-ink: #1a1a1a;
    --faq-body: #2c2c2c;
    --faq-muted: #555555;
    --faq-line: #e5e5e5;
    --faq-soft: #f5f8fb;
    --faq-white: #ffffff;
    color: var(--faq-body);
    background: var(--faq-white);
    font-family: var(--font-body-family, inherit);
    font-style: var(--font-body-style, normal);
    font-weight: var(--font-body-weight, 400);
    font-size: 1.6rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .faq-page *,
  .faq-page *::before,
  .faq-page *::after { box-sizing: border-box; }

  .faq-page__wrap {
    width: min(115.2rem, 100%);
    margin-inline: auto;
    padding-inline: 1.6rem;
  }

  .faq-page__hero {
    background:
      radial-gradient(120% 80% at 50% -20%, rgba(15, 104, 178, 0.14), transparent 55%),
      linear-gradient(180deg, #eef5fb 0%, #ffffff 78%);
    padding: 6rem 0 0;
    text-align: left;
  }

  .faq-page__hero-inner { padding-bottom: 3.5rem; }

  .faq-page__title {
    margin: 0;
    font-family: var(--font-heading-family, inherit);
    font-weight: var(--font-heading-weight, 700);
    font-size: 3.6rem;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--faq-ink);
    text-wrap: balance;
  }

  .faq-page__lead {
    margin: 1.6rem 0 0;
    font-family: var(--font-heading-family, inherit);
    font-size: 2.4rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--faq-blue);
    text-wrap: balance;
  }

  .faq-page__intro {
    margin: 1.8rem 0 0;
    font-size: 1.9rem;
    line-height: 1.7;
    color: var(--faq-body);
    text-align: justify;
  }

  .faq-page__metrics-band {
    border-bottom: 0.1rem solid rgba(0,0,0,0.06);
    background: #fcfcfd;
  }

  .faq-page__metrics {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    width: min(115.2rem, 100%);
    margin-inline: auto;
    padding: 3rem 1.6rem;
  }

  .faq-page__metric-value {
    margin: 0;
    font-size: 3.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--faq-blue);
  }

  .faq-page__metric-label {
    margin: 0.8rem 0 0;
    font-size: 1.6rem;
    line-height: 1.55;
    color: var(--faq-muted);
  }

  .faq-page__section { padding: 4rem 0 5.5rem; }

  .faq-page__panel {
    border: 0.1rem solid var(--faq-line);
    border-radius: 1.2rem;
    background: var(--faq-white);
    padding: 1.2rem 2.4rem 2.4rem;
  }

  .faq-page__toc {
    margin: 1.2rem 0 3rem;
    padding-bottom: 2rem;
    border-bottom: 0.1rem solid var(--faq-line);
  }

  .faq-page__toc ol {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .faq-page__toc a {
    color: var(--faq-blue);
    text-decoration: none;
    font-size: 1.7rem;
    font-weight: 600;
  }

  .faq-page__toc a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

  .faq-page__toc-num { color: var(--faq-muted); font-variant-numeric: tabular-nums; }
  .faq-page__toc-count { color: var(--faq-muted); font-weight: 400; font-size: 1.4rem; }

  .faq-page__category {
    margin: 3.2rem 0 0.8rem;
    font-family: var(--font-heading-family, inherit);
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--faq-blue);
  }

  .faq-page__category-block:first-of-type .faq-page__category { margin-top: 1.2rem; }

  .faq-page__item { border-bottom: 0.1rem solid var(--faq-line); }

  .faq-page__summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.6rem;
    padding: 2.2rem 0;
    font-family: var(--font-heading-family, inherit);
    font-size: 1.95rem;
    font-weight: 650;
    color: var(--faq-ink);
    cursor: pointer;
    list-style: none;
    user-select: none;
    transition: color 0.15s ease;
  }

  .faq-page__summary::-webkit-details-marker { display: none; }
  .faq-page__summary:hover { color: var(--faq-blue); }

  .faq-page__icon {
    flex-shrink: 0;
    font-size: 2.4rem;
    font-weight: 300;
    line-height: 1;
    color: var(--faq-blue);
    transition: transform 0.2s ease;
  }

  .faq-page__details[open] .faq-page__icon { transform: rotate(45deg); }

  .faq-page__content {
    padding: 0 0 2rem;
    font-size: 1.85rem;
    line-height: 1.7;
    color: var(--faq-body);
  }

  .faq-page__content p { margin: 0 0 1rem; text-align: justify; }
  .faq-page__content p:last-child { margin-bottom: 0; }

  .faq-page__content ul {
    margin: 0.4rem 0 0;
    padding: 0;
    list-style: none;
  }

  .faq-page__content li {
    position: relative;
    margin-top: 0.8rem;
    padding-left: 1.6rem;
    text-align: justify;
  }

  .faq-page__content li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.7em;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: var(--faq-blue);
  }

  .faq-page__inline-link {
    color: var(--faq-blue);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }

  .faq-page__inline-link:hover { color: #0c5796; }

  .faq-page__table-wrap {
    overflow-x: auto;
    margin: 1.2rem 0;
  }

  .faq-page__table {
    width: 100%;
    min-width: 40rem;
    border-collapse: collapse;
    text-align: left;
    font-size: 1.6rem;
  }

  .faq-page__table th {
    background: var(--faq-blue);
    color: #fff;
    font-weight: 700;
    padding: 1rem 1.2rem;
  }

  .faq-page__table td {
    padding: 1rem 1.2rem;
    border-bottom: 0.1rem solid rgba(0,0,0,0.08);
    color: var(--faq-muted);
    vertical-align: top;
  }

  .faq-page__table tr:last-child td { border-bottom: 0; }

  .faq-page__table-price {
    color: var(--faq-blue);
    font-weight: 700;
    white-space: nowrap;
  }

  .faq-page__chart {
    margin: 1.6rem 0 0;
  }

  .faq-page__chart-row + .faq-page__chart-row { margin-top: 1.4rem; }

  .faq-page__chart-meta {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .faq-page__chart-label {
    color: var(--faq-blue);
    font-weight: 700;
    font-size: 1.5rem;
  }

  .faq-page__chart-value {
    color: var(--faq-blue);
    font-weight: 700;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .faq-page__chart-value--zero { color: #9ca3af; }

  .faq-page__chart-track {
    height: 0.85rem;
    border-radius: 999px;
    background: #e8eef4;
    overflow: hidden;
  }

  .faq-page__chart-fill {
    height: 100%;
    border-radius: 999px;
    background: var(--faq-blue);
  }

  .faq-page__chart-fill--zero { background: #9ca3af; }

  .faq-page__chart-caption {
    margin: 1.2rem 0 0;
    color: #9ca3af;
    font-size: 1.35rem;
    line-height: 1.4;
  }

  .faq-page__support { margin-top: 4rem; max-width: none; }

  .faq-page__support-title {
    margin: 0;
    display: inline-block;
    padding-bottom: 0.5rem;
    border-bottom: 0.3rem solid var(--faq-blue);
    font-family: var(--font-heading-family, inherit);
    font-weight: var(--font-heading-weight, 700);
    font-size: 3rem;
    line-height: 1.2;
    color: var(--faq-ink);
  }

  .faq-page__support-body {
    margin: 1.4rem 0 0;
    font-size: 1.9rem;
    line-height: 1.7;
    color: var(--faq-body);
  }

  .faq-page__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 5rem;
    margin-top: 2rem;
    padding: 1.2rem 2.8rem;
    border: 0.1rem solid transparent;
    background: var(--faq-blue);
    color: #fff;
    font-family: var(--font-button-family, inherit);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .faq-page__button:hover { background: #0c5796; }

  .faq-page__footnote {
    margin: 3rem 0 0;
    font-size: 1.25rem;
    line-height: 1.55;
    color: rgba(87, 87, 86, 0.85);
  }

  @media screen and (min-width: 750px) {
    .faq-page__wrap { padding-inline: 2.4rem; }
    .faq-page__title { font-size: 4.8rem; }
    .faq-page__lead { font-size: 3rem; }
    .faq-page__metrics { grid-template-columns: 1fr 1fr; gap: 2.4rem; padding-inline: 2.4rem; }
    .faq-page__category { font-size: 3rem; }
    .faq-page__panel { padding: 1.6rem 3.2rem 3.2rem; }
    .faq-page__summary { font-size: 2.05rem; }
    .faq-page__content { font-size: 1.95rem; }
  }

  @media screen and (min-width: 990px) {
    .faq-page__wrap { padding-inline: 3.2rem; }
  }

  @media (max-width: 860px) {
    .faq-page__hero { padding-top: 4.5rem; }
    .faq-page__title { font-size: 3.4rem; }
    .faq-page__lead { font-size: 2.3rem; }
    .faq-page__panel { padding: 0.8rem 1.6rem 1.8rem; }
    .faq-page__summary { font-size: 1.75rem; }
    .faq-page__content { font-size: 1.7rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .faq-page__summary, .faq-page__icon, .faq-page__button { transition: none; }
  }
</style>

{% schema %}
{
  "name": "FAQ",
  "tag": "section",
  "class": "section-faq",
  "settings": [],
  "presets": [{ "name": "FAQ" }]
}
{% endschema %}
`
}

async function pushFiles(files: { filename: string; body: string }[]) {
  const cfg = JSON.parse(readFileSync(MCP, 'utf8')) as {
    mcpServers: { shopify: { args: string[] } }
  }
  const args = cfg.mcpServers.shopify.args
  const after = (f: string) => args[args.indexOf(f) + 1]
  const creds = {
    clientId: after('--clientId'),
    clientSecret: after('--clientSecret'),
    domain: after('--domain'),
  }
  const tokenRes = await fetch(`https://${creds.domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    }),
  })
  const tokenText = await tokenRes.text()
  let tokenData: { access_token?: string }
  try {
    tokenData = JSON.parse(tokenText) as { access_token?: string }
  } catch {
    throw new Error(`Token response ${tokenRes.status}: ${tokenText.slice(0, 500)}`)
  }
  if (!tokenData.access_token) throw new Error(JSON.stringify(tokenData))
  const token = tokenData.access_token
  console.log(`shop ${creds.domain}`)

  // themeFilesUpsert accepts batches; keep chunks small
  const chunkSize = 5
  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize)
    const res = await fetch(`https://${creds.domain}/admin/api/${API}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query: `mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
          themeFilesUpsert(themeId: $themeId, files: $files) {
            upsertedThemeFiles { filename }
            userErrors { field message }
          }
        }`,
        variables: {
          themeId: THEME_ID,
          files: chunk.map((f) => ({
            filename: f.filename,
            body: { type: 'TEXT', value: f.body },
          })),
        },
      }),
    })
    const json = (await res.json()) as {
      data?: {
        themeFilesUpsert: {
          upsertedThemeFiles: { filename: string }[]
          userErrors: { message: string }[]
        }
      }
      errors?: unknown
    }
    if (json.errors) throw new Error(JSON.stringify(json.errors))
    const errs = json.data?.themeFilesUpsert.userErrors ?? []
    if (errs.length) throw new Error(JSON.stringify(errs))
    console.log(
      'Pushed:',
      (json.data?.themeFilesUpsert.upsertedThemeFiles || [])
        .map((f) => f.filename)
        .join(', '),
    )
  }

  // Ensure FAQ page exists with faq template
  await ensureFaqPage(creds.domain, token)
}

async function ensureFaqPage(domain: string, token: string) {
  const find = await fetch(`https://${domain}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({
      query: `{
        pages(first: 20, query: "handle:faq") {
          nodes { id handle title templateSuffix }
        }
      }`,
    }),
  })
  const found = (await find.json()) as {
    data?: { pages: { nodes: { id: string; handle: string; templateSuffix: string | null }[] } }
  }
  const existing = found.data?.pages.nodes.find((p) => p.handle === 'faq')
  if (existing) {
    if (existing.templateSuffix !== 'faq') {
      const upd = await fetch(`https://${domain}/admin/api/${API}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: `mutation pageUpdate($id: ID!, $page: PageUpdateInput!) {
            pageUpdate(id: $id, page: $page) {
              page { id handle templateSuffix }
              userErrors { message }
            }
          }`,
          variables: {
            id: existing.id,
            page: { templateSuffix: 'faq', isPublished: true },
          },
        }),
      })
      console.log('Updated page template:', JSON.stringify(await upd.json()))
    } else {
      console.log('FAQ page already exists:', existing.id)
    }
    return
  }

  const create = await fetch(`https://${domain}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({
      query: `mutation pageCreate($page: PageCreateInput!) {
        pageCreate(page: $page) {
          page { id handle templateSuffix }
          userErrors { field message }
        }
      }`,
      variables: {
        page: {
          title: 'FAQ',
          handle: 'faq',
          templateSuffix: 'faq',
          isPublished: true,
          body: '',
        },
      },
    }),
  })
  console.log('Created FAQ page:', JSON.stringify(await create.json()))
}

function main() {
  mkdirSync(OUT_SNIPPETS, { recursive: true })
  const available = new Set(
    readdirSync(FAQ_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, '')),
  )

  const locales = LOCALES.filter(
    (l) => available.has(l) && !SKIP_LOCALES.has(l),
  )
  const files: { filename: string; body: string }[] = []

  for (const locale of locales) {
    const content = loadFaq(locale)
    const body = renderSnippet(locale, content)
    const filename = `snippets/faq-eshop-${locale}.liquid`
    writeFileSync(join(ROOT, 'shopify', filename), body)
    files.push({ filename, body })
    console.log('Wrote', filename, `(${body.length} bytes)`)
  }

  const section = renderSection([...locales])
  writeFileSync(OUT_SECTION, section)
  files.push({ filename: 'sections/faq.liquid', body: section })
  console.log('Wrote sections/faq.liquid', `(${section.length} bytes)`)

  // Keep template
  writeFileSync(
    join(ROOT, 'shopify/templates/page.faq.json'),
    `${JSON.stringify(
      {
        sections: { main: { type: 'faq', settings: {} } },
        order: ['main'],
      },
      null,
      2,
    )}\n`,
  )
  files.push({
    filename: 'templates/page.faq.json',
    body: readFileSync(join(ROOT, 'shopify/templates/page.faq.json'), 'utf8'),
  })

  if (process.argv.includes('--push')) {
    pushFiles(files).catch((err) => {
      console.error(err)
      process.exit(1)
    })
  }
}

main()
