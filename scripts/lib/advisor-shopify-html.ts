/**
 * Rich HTML body for the Shopify advisor article (mirrors marketing-site visuals).
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {ADVISOR_SKIP_BLOCK_KEYS} from '../../lib/advisor-article'

const ROOT = join(import.meta.dir, '../..')
const IMG = 'https://www.ekcos.eu/products'

export const PRODUCT_HREF: Record<string, string> = {
  ekcoscreen: '/products/ekcoscreen-blue-fresh',
  'xcren-hd': '/products/xcren-hd-blue-fresh',
  powerscreen: '/products/power-screen-blue-fresh',
  urolite: '/products/uro-lite-blue-fresh',
  'basic-screen': '/collections/basic-screen',
  'xcren-puck': '/products/xcren-puck-blue-fresh',
  'ekco-clip': '/products/ekco-clip-blue-fresh',
  'fresh-drop': '/products/fresh-drop-blue-fresh',
  'ekco-mat': '/products/ekco-mat-black',
  'ez-trap': '/products/ez-trap-with-removal-tool',
}

const PRODUCT_IMG: Record<string, string> = {
  ekcoscreen: `${IMG}/Ekcoscreen/PhotoStock/EKS-3B-V0.png`,
  'xcren-hd': `${IMG}/Xcren%20HD/PhotoStock/XHD-3B-V0%20.png`,
  powerscreen: `${IMG}/Powerscreen/PhotoStock/PWR-3B-V0.png`,
  urolite: `${IMG}/Urolite/PhotoStock/ULT-3B-V0.png`,
  'basic-screen': `${IMG}/Basic%20Screen/PhotoStock/BS-3B-V0.png`,
  'xcren-puck': `${IMG}/Xcren%20Puck/PhotoStock/XPU-1P-V0.png`,
  'ekco-clip': `${IMG}/Ekcoclip/PhotoStock/TBC-3B-V0.png`,
  'fresh-drop': `${IMG}/Freshdrop/PhotoStock/FDI-3B-V0.png`,
  'ekco-mat': `${IMG}/Ekcomat/PhotoStock/UFM-1P-V0.png`,
  'ez-trap': `${IMG}/EzTrap/PhotoStock/EZT-1P-V0.png`,
}

/** Scent swatches in intensity order (ëkcoscreen PhotoStock). */
const SCENT_SWATCHES: {id: string; file: string; labelKey: string}[] = [
  {id: '7bk', file: 'EKS-7BK-V0.png', labelKey: 'x7bk'},
  {id: '3b', file: 'EKS-3B-V0.png', labelKey: 'x3b'},
  {id: '9g', file: 'EKS-9G-V0.png', labelKey: 'x9g'},
  {id: '12p', file: 'EKS-12P-V0.png', labelKey: 'x12p'},
  {id: '13c', file: 'EKS-13C-V0.png', labelKey: 'x13c'},
  {id: '1p', file: 'EKS-1P-V0 .png', labelKey: 'x1p'},
  {id: '10r', file: 'EKS-10R-V0.png', labelKey: 'x10r'},
  {id: '4o', file: 'EKS-4O-V0.png', labelKey: 'x4o'},
  {id: '6c', file: 'EKS-6C-V0.png', labelKey: 'x6c'},
  {id: '8bm', file: 'EKS-8BM-V0.png', labelKey: 'x8bm'},
  {id: '2g', file: 'EKS-2G-V0.png', labelKey: 'x2g'},
]

const PRODUCT_LINKS: {pattern: RegExp; href: string}[] = [
  {pattern: /xcr[eë]n\s+HD(?:\s*60\+)?/gi, href: PRODUCT_HREF['xcren-hd']},
  {pattern: /xcr[eë]n\s+[Pp]uck/gi, href: PRODUCT_HREF['xcren-puck']},
  {pattern: /[eë]kcoscreen(?:\s*60\+)?/gi, href: PRODUCT_HREF.ekcoscreen},
  {pattern: /pow[eë]r\s+screen/gi, href: PRODUCT_HREF.powerscreen},
  {pattern: /basic\s+scr[eë]en/gi, href: PRODUCT_HREF['basic-screen']},
  {pattern: /[uü]ro\s+lite/gi, href: PRODUCT_HREF.urolite},
  {pattern: /[eë]kco\s+(?:clip|loop)/gi, href: PRODUCT_HREF['ekco-clip']},
  {pattern: /fr[eë]sh\s+drop/gi, href: PRODUCT_HREF['fresh-drop']},
  {pattern: /[eë]z\s+trap/gi, href: PRODUCT_HREF['ez-trap']},
  {pattern: /[eë]kco\s+mat/gi, href: PRODUCT_HREF['ekco-mat']},
]

const ECO_ONE_HREF = 'https://www.ekcos.eu/en/eco-one'
const PRIVATE_LABEL_HREF = '/pages/custom-branding'

type Span = {_type: 'span'; text: string; marks?: string[]}
type Block = {
  _type: string
  _key?: string
  style?: string
  listItem?: string
  children?: Span[]
}

export type LocaleContent = {
  title: string
  excerpt: string
  body: Block[]
}

type AdvisorDict = {
  steps: Record<string, string>
  traffic: Record<string, string>
  splash: Record<string, string>
  callouts: Record<string, string>
  duration: Record<string, string>
  intensity: Record<string, string>
  ecoOne: {title: string; body: string}
  urinal: Record<string, string>
  summary: {
    colNeed: string
    colRec: string
    rows: Record<string, string>
    recs: Record<string, string>
  }
  complete: Record<string, string>
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function linkifyHtml(text: string): string {
  let out = escapeHtml(text)
  const replacements: {re: RegExp; href: string}[] = [
    ...PRODUCT_LINKS.map((p) => ({re: p.pattern, href: p.href})),
    {re: /Eco-One™/g, href: ECO_ONE_HREF},
    {
      re: /Private label|Privátní značka|Private Label/gi,
      href: PRIVATE_LABEL_HREF,
    },
  ]
  for (const {re, href} of replacements) {
    out = out.replace(re, (match) => {
      const external = href.startsWith('http')
      const attrs = external
        ? ` href="${href}" target="_blank" rel="noopener noreferrer"`
        : ` href="${href}"`
      return `<a${attrs}>${match}</a>`
    })
  }
  return out
}

function spansToHtml(children: Span[] | undefined): string {
  if (!children?.length) return ''
  return children
    .map((span) => {
      let html = linkifyHtml(span.text ?? '')
      if (span.marks?.includes('strong')) html = `<strong>${html}</strong>`
      if (span.marks?.includes('em')) html = `<em>${html}</em>`
      return html
    })
    .join('')
}

function loadAdvisor(locale: string): AdvisorDict {
  const dict = JSON.parse(
    readFileSync(join(ROOT, `dictionaries/${locale}.json`), 'utf8'),
  ) as {articles: {advisor: AdvisorDict}}
  return dict.articles.advisor
}

function loadVariantLabels(locale: string): Record<string, string> {
  const dict = JSON.parse(
    readFileSync(join(ROOT, `dictionaries/${locale}.json`), 'utf8'),
  ) as {products: {variantLabels: Record<string, string>}}
  return dict.products.variantLabels
}

function productCard(slug: string, name: string, extra = ''): string {
  const href = PRODUCT_HREF[slug]
  const src = PRODUCT_IMG[slug]
  return `<a class="ea-product" href="${href}">
    <img src="${src}" alt="${escapeHtml(name)}" width="96" height="96" loading="lazy" />
    <span>${escapeHtml(name)}</span>
  </a>${extra}`
}

function fiveSteps(a: AdvisorDict): string {
  const steps = [
    {n: 1, title: a.steps.traffic, hint: a.steps.trafficHint},
    {n: 2, title: a.steps.splash, hint: a.steps.splashHint},
    {n: 3, title: a.steps.fragrance, hint: a.steps.fragranceHint},
    {n: 4, title: a.steps.evidence, hint: a.steps.evidenceHint},
    {n: 5, title: a.steps.urinal, hint: a.steps.urinalHint},
  ]
  return `<ol class="ea-steps">${steps
    .map(
      (s) => `<li>
      <span class="ea-step-n">${s.n}</span>
      <strong>${escapeHtml(s.title)}</strong>
      <span>${escapeHtml(s.hint)}</span>
    </li>`,
    )
    .join('')}</ol>`
}

function trafficCards(a: AdvisorDict): string {
  const cols = [
    {
      title: a.traffic.highTitle,
      places: a.traffic.highPlaces,
      body: a.traffic.highBody,
      products: [
        ['ekcoscreen', 'ëkcoscreen 60+'],
        ['xcren-hd', 'xcrën HD 60+'],
      ] as const,
    },
    {
      title: a.traffic.standardTitle,
      places: a.traffic.standardPlaces,
      body: a.traffic.standardBody,
      products: [['powerscreen', 'powër screen']] as const,
    },
    {
      title: a.traffic.budgetTitle,
      places: a.traffic.budgetPlaces,
      body: a.traffic.budgetBody,
      products: [
        ['urolite', 'üro lite'],
        ['basic-screen', 'basic scrëen'],
      ] as const,
    },
  ]
  return `<div class="ea-grid-3">${cols
    .map(
      (c) => `<div class="ea-card">
      <p class="ea-eyebrow">${escapeHtml(c.title)}</p>
      <p class="ea-muted">${escapeHtml(c.places)}</p>
      <div class="ea-thumbs">${c.products
        .map(([slug, name]) => productCard(slug, name))
        .join('')}</div>
      <p>${linkifyHtml(c.body)}</p>
    </div>`,
    )
    .join('')}</div>`
}

function splashStats(a: AdvisorDict): string {
  return `<div class="ea-stats">
    <a class="ea-stat" href="${PRODUCT_HREF.ekcoscreen}">
      <strong>95%</strong>
      <span>${linkifyHtml(a.splash.eksLabel)}</span>
      <img src="${PRODUCT_IMG.ekcoscreen}" alt="ëkcoscreen 60+" width="88" height="88" loading="lazy" />
    </a>
    <a class="ea-stat" href="${PRODUCT_HREF['xcren-hd']}">
      <strong>92%</strong>
      <span>${linkifyHtml(a.splash.xhdLabel)}</span>
      <img src="${PRODUCT_IMG['xcren-hd']}" alt="xcrën HD 60+" width="88" height="88" loading="lazy" />
    </a>
  </div>`
}

function callout(kind: 'tip' | 'uv' | 'ask', a: AdvisorDict): string {
  const text =
    kind === 'uv' ? a.callouts.uv : kind === 'tip' ? a.callouts.tip : a.callouts.ask
  const icon = kind === 'uv' ? 'ℹ' : '💡'
  return `<aside class="ea-callout"><span aria-hidden="true">${icon}</span><p>${linkifyHtml(text)}</p></aside>`
}

function durationChart(a: AdvisorDict): string {
  return `<div class="ea-duration">
    <div class="ea-duration-axis">
      <span>${escapeHtml(a.duration.day1)}</span>
      <span>${escapeHtml(a.duration.day30)}</span>
      <span>${escapeHtml(a.duration.day60)}</span>
    </div>
    <p class="ea-duration-label">${escapeHtml(a.duration.thirtyLabel)}</p>
    <div class="ea-bars">
      <div class="ea-bar ea-bar-light">${escapeHtml(a.duration.screen1)}</div>
      <div class="ea-bar ea-bar-light">${escapeHtml(a.duration.screen2)}</div>
    </div>
    <p class="ea-duration-label">${linkifyHtml('ëkcoscreen 60+ / xcrën HD 60+')}</p>
    <div class="ea-bar ea-bar-full">${escapeHtml(a.duration.sixtyBar)}</div>
    <p class="ea-note">${linkifyHtml(a.duration.note)}</p>
  </div>`
}

function fragranceVisual(
  a: AdvisorDict,
  variants: Record<string, string>,
): string {
  const levels = [
    {key: 'most', n: 4},
    {key: 'very', n: 3},
    {key: 'medium', n: 2},
    {key: 'subtle', n: 1},
  ] as const
  const intensity = `<div class="ea-intensity">${levels
    .map((l) => {
      const bars = Array.from({length: 4}, (_, i) => {
        const on = i < l.n
        return `<i class="${on ? 'on' : ''}"></i>`
      }).join('')
      return `<div class="ea-intensity-item"><strong>${escapeHtml(a.intensity[l.key])}</strong><span class="ea-bars-signal">${bars}</span></div>`
    })
    .join('')}</div>`

  const scents = `<div class="ea-scents">${SCENT_SWATCHES.map((s) => {
    const label = variants[s.labelKey] ?? s.labelKey
    const fileUrl = `${IMG}/Ekcoscreen/PhotoStock/${s.file.replace(/ /g, '%20')}`
    return `<a class="ea-scent" href="${PRODUCT_HREF.ekcoscreen}">
      <img src="${fileUrl}" alt="${escapeHtml(label)}" width="56" height="56" loading="lazy" />
      <span>${escapeHtml(label)}</span>
    </a>`
  }).join('')}</div>`

  return `${intensity}${scents}<p>${escapeHtml(a.intensity.popular)}</p>`
}

function ecoOne(a: AdvisorDict): string {
  const title = a.ecoOne.title
    .replace(/<\/?ecoOne>/g, '')
    .replace(/Eco-One™/g, 'Eco-One™')
  return `<div class="ea-eco">
    <strong class="ea-eco-pct">93%</strong>
    <div>
      <p class="ea-eco-title"><a href="${ECO_ONE_HREF}" target="_blank" rel="noopener noreferrer">${linkifyHtml(title)}</a></p>
      <p>${linkifyHtml(a.ecoOne.body)}</p>
    </div>
  </div>`
}

function urinalCards(a: AdvisorDict): string {
  const cards = [
    {slug: 'urolite', name: 'üro lite', title: a.urinal.smallTitle, body: a.urinal.smallBody},
    {slug: 'powerscreen', name: 'powër screen', title: a.urinal.mostTitle, body: a.urinal.mostBody},
    {slug: 'ekcoscreen', name: 'ëkcoscreen 60+', title: a.urinal.waterlessTitle, body: a.urinal.waterlessBody},
    {slug: 'ekcoscreen', name: 'ëkcoscreen 60+', title: a.urinal.drainTitle, body: a.urinal.drainBody},
    {slug: 'xcren-hd', name: 'xcrën HD 60+', title: a.urinal.designTitle, body: a.urinal.designBody},
    {slug: 'xcren-puck', name: 'xcrën puck', title: a.urinal.puckTitle, body: a.urinal.puckBody},
  ]
  return `<div class="ea-grid-3">${cards
    .map(
      (c) => `<a class="ea-card ea-card-link" href="${PRODUCT_HREF[c.slug]}">
      <img src="${PRODUCT_IMG[c.slug]}" alt="${escapeHtml(c.name)}" width="72" height="72" loading="lazy" />
      <div>
        <p class="ea-eyebrow">${escapeHtml(c.title)}</p>
        <p class="ea-name">${escapeHtml(c.name)}</p>
        <p>${escapeHtml(c.body)}</p>
      </div>
    </a>`,
    )
    .join('')}</div>`
}

function summaryTable(a: AdvisorDict): string {
  const rows: [string, string][] = [
    [a.summary.rows.high, 'ëkcoscreen 60+, xcrën HD 60+'],
    [a.summary.rows.standard, 'powër screen'],
    [a.summary.rows.budget, a.summary.recs.budget],
    [a.summary.rows.small, 'üro lite'],
    [a.summary.rows.waterless, 'ëkcoscreen 60+, xcrën HD 60+'],
    [a.summary.rows.drain, a.summary.recs.drain],
    [a.summary.rows.design, 'xcrën HD 60+'],
    [a.summary.rows.puck, 'xcrën puck'],
    [a.summary.rows.bio, a.summary.recs.bio],
    [a.summary.rows.logo, a.summary.recs.logo],
  ]
  return `<div class="ea-table-wrap"><table class="ea-table">
    <thead><tr><th>${escapeHtml(a.summary.colNeed)}</th><th>${escapeHtml(a.summary.colRec)}</th></tr></thead>
    <tbody>${rows
      .map(
        ([need, rec], i) =>
          `<tr class="${i === rows.length - 1 ? 'ea-logo' : ''}"><td>${escapeHtml(need)}</td><td>${
            i === rows.length - 1
              ? `<a href="${PRIVATE_LABEL_HREF}">${escapeHtml(rec)}</a>`
              : linkifyHtml(rec)
          }</td></tr>`,
      )
      .join('')}</tbody>
  </table></div>`
}

function completeGrid(a: AdvisorDict): string {
  const items = [
    {slug: 'ekco-clip', name: 'ëkco clip', body: a.complete.clip},
    {slug: 'fresh-drop', name: 'frësh drop', body: a.complete.fresh},
    {slug: 'ekco-mat', name: 'ëkco mat', body: a.complete.mat},
    {slug: 'ez-trap', name: 'ëz trap', body: a.complete.trap},
  ]
  return `<div class="ea-grid-2">${items
    .map(
      (item) => `<a class="ea-card ea-card-link" href="${PRODUCT_HREF[item.slug]}">
      <img src="${PRODUCT_IMG[item.slug]}" alt="${escapeHtml(item.name)}" width="80" height="80" loading="lazy" />
      <div>
        <p class="ea-name">${escapeHtml(item.name)}</p>
        <p>${escapeHtml(item.body)}</p>
      </div>
    </a>`,
    )
    .join('')}</div>`
}

const CSS = `<style>
.article-template:has(.ekcos-advisor) .page-width--inner{max-width:var(--page-width)}
@media screen and (min-width:990px){.article-template:has(.ekcos-advisor) .page-width--inner{padding-left:5rem!important;padding-right:5rem!important}}
.ekcos-advisor{color:#575756;line-height:1.65;font-size:1.05em;max-width:none;width:100%}
.ekcos-advisor h2{color:#0F68B2;margin:1.75em 0 .55em;font-size:1.45em}
.ekcos-advisor h3{color:#0F68B2;margin:1.35em 0 .4em;font-size:1.2em}
.ekcos-advisor p{margin:.75em 0}
.ekcos-advisor ul,.ekcos-advisor ol{margin:.75em 0;padding-left:1.3em}
.ekcos-advisor a{color:#0F68B2;font-weight:600;text-decoration:underline}
.ea-steps{list-style:none;margin:1.25rem 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
@media(min-width:750px){.ea-steps{grid-template-columns:repeat(5,minmax(0,1fr))}}
.ea-steps li{background:rgba(15,104,178,.06);border-radius:12px;padding:.9rem;display:flex;flex-direction:column;gap:.35rem}
.ea-step-n{width:1.85rem;height:1.85rem;border-radius:999px;background:#0F68B2;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem}
.ea-steps strong{color:#0F68B2;font-size:.92rem}
.ea-steps span{font-size:.78rem;color:rgba(87,87,86,.85);line-height:1.35}
.ea-grid-3{display:grid;gap:1rem;margin:1.1rem 0}
.ea-grid-2{display:grid;gap:1rem;margin:1.1rem 0}
@media(min-width:750px){.ea-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.ea-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
.ea-card{border:1px solid rgba(15,104,178,.15);border-radius:12px;padding:1rem;background:#fff}
.ea-card-link{display:flex;gap:.85rem;align-items:flex-start;text-decoration:none;color:inherit;transition:background .15s}
.ea-card-link:hover{background:rgba(15,104,178,.04)}
.ea-card-link img{flex:0 0 auto;object-fit:contain}
.ea-eyebrow{margin:0;font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#0F68B2}
.ea-muted{margin:.25rem 0 .75rem;font-size:.9rem;color:rgba(87,87,86,.8)}
.ea-name{margin:.15rem 0;color:#0F68B2;font-weight:700;text-decoration:underline}
.ea-thumbs{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;margin:.5rem 0 1rem}
.ea-product{display:flex;flex-direction:column;align-items:center;gap:.35rem;text-decoration:none;font-size:.78rem;text-align:center}
.ea-product img{width:80px;height:80px;object-fit:contain}
.ea-product span{color:#0F68B2;text-decoration:underline;font-weight:600}
.ea-stats{display:grid;gap:1rem;margin:1.1rem 0}
@media(min-width:750px){.ea-stats{grid-template-columns:1fr 1fr}}
.ea-stat{display:grid;grid-template-columns:1fr auto;gap:.5rem 1rem;align-items:center;background:rgba(15,104,178,.06);border-radius:12px;padding:1.1rem 1.2rem;text-decoration:none;color:inherit}
.ea-stat strong{grid-column:1;color:#0F68B2;font-size:2.6rem;line-height:1}
.ea-stat span{grid-column:1;font-size:.9rem}
.ea-stat img{grid-row:1/span 2;grid-column:2;width:88px;height:88px;object-fit:contain}
.ea-callout{display:flex;gap:.75rem;background:rgba(15,104,178,.1);border-radius:12px;padding:1rem 1.1rem;margin:1.1rem 0}
.ea-callout p{margin:0}
.ea-duration{border:1px solid rgba(15,104,178,.15);border-radius:12px;padding:1.1rem 1.2rem;margin:1.1rem 0}
.ea-duration-axis{display:flex;justify-content:space-between;font-size:.85rem;color:rgba(87,87,86,.7);margin-bottom:.75rem}
.ea-duration-label{margin:.65rem 0 .35rem;font-weight:600}
.ea-bars{display:flex;gap:.35rem}
.ea-bar{display:flex;align-items:center;justify-content:center;min-height:2.4rem;border-radius:8px;font-size:.8rem;font-weight:600;text-align:center;padding:.35rem}
.ea-bar-light{flex:1;background:rgba(15,104,178,.35);color:#575756}
.ea-bar-full{background:#0F68B2;color:#fff}
.ea-note{margin:.85rem 0 0;font-size:.95rem}
.ea-intensity{display:grid;gap:.65rem;margin:1rem 0;grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:750px){.ea-intensity{grid-template-columns:repeat(4,minmax(0,1fr))}}
.ea-intensity-item{background:rgba(15,104,178,.06);border-radius:10px;padding:.7rem .8rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem}
.ea-intensity-item strong{color:#0F68B2;font-size:.9rem}
.ea-bars-signal{display:inline-flex;align-items:flex-end;gap:2px}
.ea-bars-signal i{display:block;width:3px;border-radius:1px;background:rgba(15,104,178,.25)}
.ea-bars-signal i:nth-child(1){height:6px}.ea-bars-signal i:nth-child(2){height:9px}.ea-bars-signal i:nth-child(3){height:12px}.ea-bars-signal i:nth-child(4){height:15px}
.ea-bars-signal i.on{background:#0F68B2}
.ea-scents{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65rem;margin:1rem 0}
@media(min-width:750px){.ea-scents{grid-template-columns:repeat(6,minmax(0,1fr))}}
@media(min-width:990px){.ea-scents{grid-template-columns:repeat(11,minmax(0,1fr))}}
.ea-scent{display:flex;flex-direction:column;align-items:center;gap:.3rem;text-decoration:none;font-size:.68rem;text-align:center;color:#575756}
.ea-scent img{width:52px;height:52px;object-fit:contain}
.ea-eco{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;background:rgba(15,104,178,.08);border-radius:12px;padding:1.2rem;margin:1.1rem 0}
.ea-eco-pct{color:#0F68B2;font-size:3.2rem;line-height:1;font-weight:700}
.ea-eco-title{margin:0 0 .4rem;font-weight:700;color:#0F68B2}
.ea-table-wrap{overflow-x:auto;margin:1.1rem 0;border-radius:12px;border:1px solid rgba(15,104,178,.15)}
.ea-table{width:100%;border-collapse:collapse;min-width:28rem}
.ea-table th{background:#0F68B2;color:#fff;text-align:left;padding:.75rem 1rem}
.ea-table td{padding:.7rem 1rem;border-bottom:1px solid rgba(15,104,178,.12);vertical-align:top}
.ea-table tr:nth-child(even) td{background:rgba(15,104,178,.05)}
</style>`

export function buildAdvisorHtml(locale: string, content: LocaleContent): string {
  const a = loadAdvisor(locale)
  const variants = loadVariantLabels(locale)
  const parts: string[] = []
  let i = 0
  const blocks = content.body

  while (i < blocks.length) {
    const block = blocks[i]
    const key = block._key

    if (key && ADVISOR_SKIP_BLOCK_KEYS.has(key)) {
      if (key === 'p-traffic-high') parts.push(trafficCards(a))
      else if (key === 'p-splash-stats') parts.push(splashStats(a))
      else if (key === 'p-splash-uv') parts.push(callout('uv', a))
      else if (key === 'p-splash-tip') parts.push(callout('tip', a))
      else if (key === 'p-frag-strong') parts.push(fragranceVisual(a, variants))
      else if (key === 'p-evidence-ask') parts.push(callout('ask', a))
      else if (key === 'b-summary-1') parts.push(summaryTable(a))
      else if (key === 'p-complete-clip') parts.push(completeGrid(a))
      else if (key === 'b-urinal-small') parts.push(urinalCards(a))
      i += 1
      continue
    }

    if (block.listItem === 'bullet' || block.listItem === 'number') {
      const tag = block.listItem === 'number' ? 'ol' : 'ul'
      const items: string[] = []
      while (
        i < blocks.length &&
        blocks[i].listItem === block.listItem &&
        !(blocks[i]._key && ADVISOR_SKIP_BLOCK_KEYS.has(blocks[i]._key!))
      ) {
        items.push(`<li>${spansToHtml(blocks[i].children)}</li>`)
        i += 1
      }
      parts.push(`<${tag}>${items.join('')}</${tag}>`)
      continue
    }

    const inner = spansToHtml(block.children)
    const style = block.style ?? 'normal'
    if (style === 'h2') parts.push(`<h2>${inner}</h2>`)
    else if (style === 'h3') parts.push(`<h3>${inner}</h3>`)
    else if (style === 'h4') parts.push(`<h4>${inner}</h4>`)
    else parts.push(`<p>${inner}</p>`)

    if (key === 'intro') parts.push(fiveSteps(a))
    else if (key === 'p-frag-long') parts.push(durationChart(a))
    else if (key === 'p-evidence-bio') parts.push(ecoOne(a))

    i += 1
  }

  return `${CSS}<div class="ekcos-advisor">${parts.join('\n')}</div>`
}
