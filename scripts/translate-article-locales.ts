import { translate } from 'google-translate-api-x'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const TARGETS = [
  'bg',
  'hr',
  'da',
  'nl',
  'et',
  'fi',
  'el',
  'hu',
  'lv',
  'lt',
  'pl',
  'pt',
  'ro',
  'sk',
  'sl',
  'sv',
] as const

const en = JSON.parse(readFileSync('scripts/tmp/article-en.json', 'utf8')) as {
  title: string
  excerpt: string
  slug: { _type: 'slug'; current: string }
  mainImage?: { _type: string; alt?: string; asset?: unknown }
  body: Block[]
}

const outDir = 'scripts/tmp/article-locales'
mkdirSync(outDir, { recursive: true })

type Span = { _type: 'span'; _key: string; text: string; marks?: string[] }
type Block = {
  _type: string
  _key: string
  children?: Span[]
  style?: string
  listItem?: string
  level?: number
  markDefs?: unknown[]
  [k: string]: unknown
}

/** ASCII tokens — Unicode ⟦…⟧ placeholders get translated by Google. */
function protect(text: string): string {
  return text
    .replace(/Eco-One™/g, '__BRAND_ECOONE__')
    .replace(/EcoOne/g, '__BRAND_ECOONE__')
    .replace(/Eco-One/g, '__BRAND_ECOONE__')
    .replace(/Sealed Bristles Technology™/g, '__BRAND_SBT__')
    .replace(/Sealed Bristles Technology/g, '__BRAND_SBT__')
    .replace(/xcrën HD/g, '__BRAND_XCRENHD__')
    .replace(/xcrën Puck/gi, '__BRAND_XCRENPUCK__')
    .replace(/xcrën puck/g, '__BRAND_XCRENPUCK__')
    .replace(/ëkcoscreen/g, '__BRAND_EKCOSCREEN__')
    .replace(/powër screen/g, '__BRAND_POWERSCREEN__')
    .replace(/üro lite/g, '__BRAND_UROLITE__')
    .replace(/NON-PARA/g, '__BRAND_NONPARA__')
    .replace(/ëkcos/gi, '__BRAND_EKCOS__')
}

function unprotect(text: string): string {
  return text
    .replace(/__BRAND_ECOONE__/gi, 'Eco-One™')
    .replace(/__BRAND_SBT__/gi, 'Sealed Bristles Technology™')
    .replace(/__BRAND_XCRENHD__/gi, 'xcrën HD')
    .replace(/__BRAND_XCRENPUCK__/gi, 'xcrën puck')
    .replace(/__BRAND_EKCOSCREEN__/gi, 'ëkcoscreen')
    .replace(/__BRAND_POWERSCREEN__/gi, 'powër screen')
    .replace(/__BRAND_UROLITE__/gi, 'üro lite')
    .replace(/__BRAND_NONPARA__/gi, 'NON-PARA')
    .replace(/__BRAND_EKCOS__/gi, 'ëkcos')
    .replace(/ëkcosekraan/gi, 'ëkcoscreen')
    .replace(/ëkcoszaslon/gi, 'ëkcoscreen')
    .replace(/ëkcosekran/gi, 'ëkcoscreen')
}

function restoreEdgeWhitespace(original: string, translated: string): string {
  const lead = original.match(/^\s*/)?.[0] ?? ''
  const trail = original.match(/\s*$/)?.[0] ?? ''
  return lead + translated.trim() + trail
}

async function translateTexts(texts: string[], to: string): Promise<string[]> {
  if (!texts.length) return []
  const protectedTexts = texts.map(protect)
  const out: string[] = []
  const chunkSize = 25
  for (let i = 0; i < protectedTexts.length; i += chunkSize) {
    const chunk = protectedTexts.slice(i, i + chunkSize)
    let attempt = 0
    for (;;) {
      try {
        const result = await translate(chunk, { from: 'en', to, forceBatch: true })
        const arr = Array.isArray(result) ? result : [result]
        for (const item of arr) out.push(unprotect(item.text))
        break
      } catch (err) {
        attempt++
        if (attempt >= 5) throw err
        console.warn(`  retry ${attempt} for ${to}`)
        await new Promise((r) => setTimeout(r, 1500 * attempt))
      }
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  return out
}

function collectSpans(body: Block[]) {
  const items: { bi: number; ci: number; text: string }[] = []
  body.forEach((block, bi) => {
    block.children?.forEach((child, ci) => {
      if (child._type === 'span' && child.text?.trim()) {
        items.push({ bi, ci, text: child.text })
      }
    })
  })
  return items
}

for (const locale of TARGETS) {
  console.log(`Translating ${locale}…`)
  const [title, excerpt, alt] = await translateTexts(
    [en.title, en.excerpt, en.mainImage?.alt || ''],
    locale,
  )
  const body = structuredClone(en.body) as Block[]
  const spans = collectSpans(body)
  const translated = await translateTexts(
    spans.map((s) => s.text),
    locale,
  )
  spans.forEach((s, i) => {
    const child = body[s.bi]?.children?.[s.ci]
    if (child) child.text = restoreEdgeWhitespace(s.text, translated[i] ?? s.text)
  })

  const localeObj = {
    title,
    excerpt,
    slug: { _type: 'slug', current: en.slug.current },
    mainImage: {
      ...en.mainImage,
      alt: alt || en.mainImage?.alt,
    },
    body,
  }
  writeFileSync(join(outDir, `${locale}.json`), JSON.stringify(localeObj))
  console.log(`  wrote ${locale}: ${title}`)
}

console.log('All locales translated.')
