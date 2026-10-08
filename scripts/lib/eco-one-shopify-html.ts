/**
 * Rich HTML body for the Shopify Eco-One™ article (mirrors www.ekcos.eu/{locale}/eco-one).
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'

const ROOT = join(import.meta.dir, '../..')

export const ECO_ONE_ARTICLE_PATH = '/blogs/articles/eco-one'

type EcoOneDict = {
  hero: {title: string; tagline: string; body: string}
  afterUse: {
    heading: string
    title: string
    steps: Record<
      'use' | 'after' | 'landfill' | 'breakdown',
      {title: string; body: string}
    >
  }
  metrics: Record<
    'additive' | 'measured' | 'projected' | 'cardboard',
    {value: string; label: string}
  >
  problem: {
    title: string
    body: string
    chart: {
      withoutLabel: string
      withLabel: string
      withoutValue: string
      withValue: string
      withoutDetail: string
      withDetail: string
      axisLabel: string
      caption: string
    }
  }
  solution: {
    title: string
    body1: string
    body2: string
    calloutTitle: string
    calloutBody: string
  }
  testing: {
    title: string
    body: string
    barChart: {
      yAxis: string
      withLabel: string
      withoutLabel: string
      withDetail: string
      withoutDetail: string
      subtitle: string
    }
    timelineChart: {
      yAxis: string
      xAxis: string
      withLabel: string
      withoutLabel: string
      zeroNote: string
      measured: string
      projected: string
      yearsUnit: string
      projectedNote: string
      caption: string
    }
  }
  closing: {title: string; body: string; shopCta: string}
  footnote: string
}

const STEP_KEYS = ['use', 'after', 'landfill', 'breakdown'] as const
const METRIC_KEYS = ['additive', 'measured', 'projected', 'cardboard'] as const

export function loadEcoOneDict(locale: string): EcoOneDict {
  const path = join(ROOT, 'dictionaries', `${locale}.json`)
  const data = JSON.parse(readFileSync(path, 'utf8')) as {ecoOne: EcoOneDict}
  return data.ecoOne
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Convert dictionary rich markers + plain text to safe HTML. */
function richText(text: string): string {
  const parts = text.split(/(<bold>|<\/bold>)/g)
  let open = false
  let out = ''
  for (const part of parts) {
    if (part === '<bold>') {
      open = true
      out += '<strong>'
      continue
    }
    if (part === '</bold>') {
      open = false
      out += '</strong>'
      continue
    }
    out += escapeHtml(part)
  }
  if (open) out += '</strong>'
  return out
}

function stepsHtml(dict: EcoOneDict): string {
  const items = STEP_KEYS.map((key, index) => {
    const step = dict.afterUse.steps[key]
    const n = String(index + 1).padStart(2, '0')
    const isLast = index === STEP_KEYS.length - 1
    return `<li class="eeo-step${isLast ? ' eeo-step--last' : ''}">
      <span class="eeo-step-n" aria-hidden="true">${n}</span>
      <div class="eeo-step-body">
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.body)}</p>
      </div>
    </li>`
  }).join('')
  return `<section class="eeo-section">
  <h2>${escapeHtml(dict.afterUse.heading)}</h2>
  <ol class="eeo-steps">${items}</ol>
</section>`
}

function metricsHtml(dict: EcoOneDict): string {
  const items = METRIC_KEYS.map((key) => {
    const m = dict.metrics[key]
    return `<div class="eeo-metric">
      <p class="eeo-metric-value">${escapeHtml(m.value)}</p>
      <p class="eeo-metric-label">${escapeHtml(m.label)}</p>
    </div>`
  }).join('')
  return `<section class="eeo-section">
  <h2>${escapeHtml(dict.afterUse.title)}</h2>
  <div class="eeo-metrics">${items}</div>
</section>`
}

function comparisonHtml(dict: EcoOneDict): string {
  const c = dict.problem.chart
  return `<figure class="eeo-chart" aria-label="${escapeHtml(c.axisLabel)}">
  <div class="eeo-bar-row">
    <div class="eeo-bar-meta">
      <p class="eeo-bar-label eeo-muted">${escapeHtml(c.withoutLabel)}</p>
      <p class="eeo-bar-value eeo-muted">${escapeHtml(c.withoutValue)}</p>
    </div>
    <div class="eeo-bar-track"><span class="eeo-bar eeo-bar--muted" style="width:100%"></span></div>
    <p class="eeo-bar-detail">${escapeHtml(c.withoutDetail)}</p>
  </div>
  <div class="eeo-bar-row">
    <div class="eeo-bar-meta">
      <p class="eeo-bar-label eeo-brand">${escapeHtml(c.withLabel)}</p>
      <p class="eeo-bar-value eeo-brand">${escapeHtml(c.withValue)}</p>
    </div>
    <div class="eeo-bar-track"><span class="eeo-bar eeo-bar--brand" style="width:0.5%"></span></div>
    <p class="eeo-bar-detail">${escapeHtml(c.withDetail)}</p>
  </div>
  <figcaption>${escapeHtml(c.caption)}</figcaption>
</figure>`
}

function testingBarsHtml(dict: EcoOneDict): string {
  const b = dict.testing.barChart
  return `<figure class="eeo-chart" aria-label="${escapeHtml(b.subtitle)}">
  <p class="eeo-chart-sub">${escapeHtml(b.subtitle)}</p>
  <p class="eeo-chart-axis">${escapeHtml(b.yAxis)}</p>
  <div class="eeo-vbars">
    <div class="eeo-vbar">
      <div class="eeo-vbar-col"><span class="eeo-vbar-fill eeo-bar--brand" style="height:93.31%"></span></div>
      <p class="eeo-vbar-pct eeo-brand">93.31%</p>
      <p class="eeo-vbar-label">${escapeHtml(b.withLabel)}</p>
      <p class="eeo-bar-detail">${escapeHtml(b.withDetail)}</p>
    </div>
    <div class="eeo-vbar">
      <div class="eeo-vbar-col"><span class="eeo-vbar-fill eeo-bar--muted" style="height:2%"></span></div>
      <p class="eeo-vbar-pct eeo-muted">0%</p>
      <p class="eeo-vbar-label">${escapeHtml(b.withoutLabel)}</p>
      <p class="eeo-bar-detail">${escapeHtml(b.withoutDetail)}</p>
    </div>
  </div>
</figure>`
}

function timelineHtml(dict: EcoOneDict): string {
  const t = dict.testing.timelineChart
  // Static SVG approximating the marketing-site curve (measured to 3.5y, projected to 5y).
  const withPath =
    'M48 246 L106 204 L164 166 L222 136 L280 112 L338 92 L396 78 L454 64 L512 54 L570 48 L628 44'
  return `<figure class="eeo-chart" aria-label="${escapeHtml(t.yAxis)}">
  <svg class="eeo-timeline" viewBox="0 0 640 310" role="img" aria-hidden="true">
    <line x1="48" y1="36" x2="48" y2="246" stroke="rgba(15,104,178,.2)" stroke-width="1"/>
    <line x1="48" y1="246" x2="628" y2="246" stroke="rgba(15,104,178,.2)" stroke-width="1"/>
    <path d="${withPath}" fill="none" stroke="#0F68B2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="48" y1="246" x2="628" y2="246" stroke="#575756" stroke-width="2" stroke-dasharray="4 4" opacity=".55"/>
    <circle cx="454" cy="64" r="5" fill="#0F68B2"/>
    <text x="454" y="50" text-anchor="middle" font-size="16" fill="#0F68B2" font-weight="700">93%</text>
    <text x="628" y="36" text-anchor="end" font-size="16" fill="#0F68B2" font-weight="700">99%</text>
    <text x="48" y="270" font-size="14" fill="#575756">0</text>
    <text x="454" y="270" text-anchor="middle" font-size="14" fill="#575756">3.5</text>
    <text x="628" y="270" text-anchor="end" font-size="14" fill="#575756">5 ${escapeHtml(t.yearsUnit)}</text>
    <text x="60" y="54" font-size="14" fill="#575756">${escapeHtml(t.yAxis)}</text>
  </svg>
  <div class="eeo-legend">
    <span class="eeo-legend-item"><i class="eeo-swatch eeo-bar--brand"></i>${escapeHtml(t.withLabel)} (${escapeHtml(t.measured)} / ${escapeHtml(t.projected)})</span>
    <span class="eeo-legend-item"><i class="eeo-swatch eeo-bar--muted"></i>${escapeHtml(t.withoutLabel)} - ${escapeHtml(t.zeroNote)}</span>
  </div>
  <figcaption>${escapeHtml(t.caption)}</figcaption>
</figure>`
}

const CSS = `<style>
.article-template:has(.ekcos-eco-one) .page-width--inner{max-width:var(--page-width)}
@media screen and (min-width:990px){.article-template:has(.ekcos-eco-one) .page-width--inner{padding-left:5rem!important;padding-right:5rem!important}}
/* Shopify root rem is ~10px; pin a readable base and size children in em. */
.ekcos-eco-one{color:#575756;line-height:1.65;font-size:16px;max-width:none;width:100%}
.ekcos-eco-one h2{color:#0F68B2;margin:1.75em 0 .55em;font-size:1.45em}
.ekcos-eco-one h3{color:#575756;margin:.35em 0 .35em;font-size:1.05em}
.ekcos-eco-one p{margin:.75em 0;font-size:1em;color:#575756}
.ekcos-eco-one .eeo-tagline{color:#0F68B2;font-weight:700;font-size:1.25em;line-height:1.35;margin:.25em 0 1em}
.ekcos-eco-one .eeo-lead{margin-bottom:1.5em}
.eeo-section{margin:1.75em 0}
.eeo-steps{list-style:none;margin:1.5em 0 0;padding:0;display:grid;gap:1.5em}
@media(min-width:990px){.eeo-steps{grid-template-columns:repeat(4,minmax(0,1fr));gap:1.25em}}
.eeo-step{position:relative;display:flex;gap:1em;align-items:flex-start}
@media(min-width:990px){.eeo-step{flex-direction:column}}
.eeo-step:not(.eeo-step--last):before{content:"";position:absolute;left:1.75em;top:3.5em;bottom:-1.5em;width:1px;background:rgba(15,104,178,.3);transform:translateX(-50%)}
@media(min-width:990px){.eeo-step:not(.eeo-step--last):before{left:3.5em;top:1.75em;bottom:auto;width:calc(100% - 3.5em + 1.25em);height:1px;transform:none}}
.eeo-step-n{flex:0 0 auto;width:3.5em;height:3.5em;border-radius:999px;border:2px solid #0F68B2;background:#fff;color:#0F68B2;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:1em;position:relative;z-index:1}
.eeo-step-body{min-width:0;padding-top:.35em}
.eeo-step-body p{margin:.35em 0 0;font-size:1em;color:#575756}
.eeo-metrics{display:grid;gap:1px;background:rgba(0,0,0,.06);margin-top:1.25em}
@media(min-width:750px){.eeo-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:990px){.eeo-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}}
.eeo-metric{background:#fff;padding:1.35em 1.2em}
.eeo-metric-value{margin:0;color:#0F68B2;font-size:2em;font-weight:700;line-height:1.1}
.eeo-metric-label{margin:.4em 0 0;font-size:1em;color:#575756}
.eeo-chart{margin:1.25em 0;padding:1.35em 1.25em;border:1px solid rgba(0,0,0,.06);border-radius:16px;background:#fff}
.eeo-chart figcaption,.eeo-chart-sub,.eeo-chart-axis{font-size:1em;color:#575756;margin:.35em 0 1em;line-height:1.5}
.eeo-bar-row{margin:0 0 1.35em}
.eeo-bar-meta{display:flex;justify-content:space-between;gap:1em;align-items:baseline;margin-bottom:.45em}
.eeo-bar-label,.eeo-bar-value{margin:0;font-weight:700;font-size:1.05em}
.eeo-brand{color:#0F68B2}
.eeo-muted{color:#575756}
.eeo-bar-track{height:.9em;background:rgba(15,104,178,.08);border-radius:999px;overflow:hidden}
.eeo-bar{display:block;height:100%;border-radius:999px}
.eeo-bar--brand{background:#0F68B2}
.eeo-bar--muted{background:#575756}
.eeo-bar-detail{margin:.5em 0 0;font-size:1em;line-height:1.55;color:#575756}
.eeo-vbars{display:grid;gap:1.5em}
@media(min-width:750px){.eeo-vbars{grid-template-columns:repeat(2,minmax(0,1fr))}}
.eeo-vbar{text-align:center}
.eeo-vbar-col{height:12em;display:flex;align-items:flex-end;justify-content:center;background:linear-gradient(to top,rgba(15,104,178,.04),transparent);border-radius:12px;padding:.5em}
.eeo-vbar-fill{display:block;width:4.5em;border-radius:10px 10px 4px 4px;min-height:4px}
.eeo-vbar-pct{margin:.75em 0 .25em;font-weight:700;font-size:1.5em}
.eeo-vbar-label{margin:0;font-weight:700;font-size:1.05em}
.eeo-timeline{width:100%;height:auto;display:block}
.eeo-legend{display:flex;flex-wrap:wrap;gap:.85em 1.35em;margin:1em 0 .5em;font-size:1em;color:#575756;line-height:1.45}
.eeo-legend-item{display:inline-flex;align-items:center;gap:.45em}
.eeo-swatch{width:.85em;height:.85em;border-radius:2px;display:inline-block;flex:0 0 auto}
.eeo-callout{border-left:4px solid #0F68B2;background:rgba(15,104,178,.07);padding:1.1em 1.25em;margin:1.1em 0;border-radius:0 12px 12px 0}
.eeo-callout-title{margin:0;font-weight:700;font-size:1.1em}
.eeo-callout p{margin:.5em 0 0;font-size:1em}
.eeo-closing{margin:2em 0 1em;padding:1.75em 1.35em;border-radius:16px;background:#0F68B2;color:#fff}
.eeo-closing h2{color:#fff;margin:0 0 .65em}
.eeo-closing p{color:rgba(255,255,255,.92);margin:0 0 1.15em;font-size:1em}
/* Reset theme .rte / .link underline gradients that break this CTA. */
.ekcos-eco-one a.eeo-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:.35em;margin-top:.25em;padding:1em 1.6em!important;border:0!important;border-radius:8px!important;background:#fff!important;background-image:none!important;color:#0F68B2!important;font-size:1em!important;font-weight:700!important;letter-spacing:normal!important;line-height:1.2!important;text-transform:none!important;text-decoration:none!important;box-shadow:none!important;min-width:0!important;min-height:0!important;overflow:visible!important}
.ekcos-eco-one a.eeo-btn:hover,.ekcos-eco-one a.eeo-btn:focus{background:rgba(255,255,255,.92)!important;color:#0F68B2!important;text-decoration:none!important}
.ekcos-eco-one a.eeo-btn:before,.ekcos-eco-one a.eeo-btn:after{content:none!important;display:none!important;background:none!important}
.eeo-footnote{margin-top:1.5em;font-size:.95em;color:rgba(87,87,86,.7);line-height:1.55}
</style>`

export function buildEcoOneHtml(locale: string): string {
  const dict = loadEcoOneDict(locale)
  return `${CSS}
<div class="ekcos-eco-one">
  <p class="eeo-tagline">${escapeHtml(dict.hero.tagline)}</p>
  <p class="eeo-lead">${escapeHtml(dict.hero.body)}</p>
  ${stepsHtml(dict)}
  ${metricsHtml(dict)}
  <section class="eeo-section">
    <h2>${escapeHtml(dict.problem.title)}</h2>
    <p>${richText(dict.problem.body)}</p>
    ${comparisonHtml(dict)}
  </section>
  <section class="eeo-section">
    <h2>${escapeHtml(dict.solution.title)}</h2>
    <p>${richText(dict.solution.body1)}</p>
    <p>${richText(dict.solution.body2)}</p>
    <div class="eeo-callout">
      <p class="eeo-callout-title">${escapeHtml(dict.solution.calloutTitle)}</p>
      <p>${richText(dict.solution.calloutBody)}</p>
    </div>
  </section>
  <section class="eeo-section">
    <h2>${escapeHtml(dict.testing.title)}</h2>
    <p>${richText(dict.testing.body)}</p>
    ${testingBarsHtml(dict)}
    ${timelineHtml(dict)}
  </section>
  <section class="eeo-closing">
    <h2>${escapeHtml(dict.closing.title)}</h2>
    <p>${escapeHtml(dict.closing.body)}</p>
    <a class="eeo-btn" href="/">${escapeHtml(dict.closing.shopCta)}</a>
  </section>
  <p class="eeo-footnote">${escapeHtml(dict.footnote)}</p>
</div>`
}

export function ecoOneArticleTitle(locale: string): string {
  return loadEcoOneDict(locale).hero.title
}

export function ecoOneArticleSummary(locale: string): string {
  const dict = loadEcoOneDict(locale)
  return `<p>${escapeHtml(dict.hero.tagline)}</p>`
}

/** Wrap bare Eco-One™ mentions with a link to the Shopify article (idempotent). */
export function linkifyEcoOneMentions(htmlOrText: string): string {
  // Skip already-linked occurrences.
  return htmlOrText.replace(
    /(^|[^>])Eco-One™(?!<\/a>)/g,
    `$1<a href="${ECO_ONE_ARTICLE_PATH}">Eco-One™</a>`,
  )
}
