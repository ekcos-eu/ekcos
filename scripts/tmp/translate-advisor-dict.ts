/**
 * Translate articles.advisor from EN into missing dictionary locales (batched).
 * Usage: bun scripts/tmp/translate-advisor-dict.ts
 */
import {readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {translate} from 'google-translate-api-x'
import {locales, type AppLocale} from '../../i18n/locales'

const ROOT = join(import.meta.dir, '../..')
const SKIP = new Set(['en', 'cs'])

const GT: Partial<Record<AppLocale, string>> = {
  sk: 'sk',
  de: 'de',
  pl: 'pl',
  fr: 'fr',
  es: 'es',
  it: 'it',
  nl: 'nl',
  pt: 'pt',
  sv: 'sv',
  da: 'da',
  fi: 'fi',
  el: 'el',
  hu: 'hu',
  ro: 'ro',
  bg: 'bg',
  hr: 'hr',
  sl: 'sl',
  et: 'et',
  lv: 'lv',
  lt: 'lt',
}

function protect(text: string): string {
  return text
    .replace(/Eco-One™/g, '⟦ECOONE⟧')
    .replace(/Sealed Bristles Technology™/g, '⟦SBT⟧')
    .replace(/ëkcoscreen 60\+/g, '⟦EKS60⟧')
    .replace(/xcrën HD 60\+/g, '⟦XHD60⟧')
    .replace(/xcrën puck/g, '⟦PUCK⟧')
    .replace(/powër screen/g, '⟦PWR⟧')
    .replace(/basic scrëen/g, '⟦BS⟧')
    .replace(/üro lite/g, '⟦URO⟧')
    .replace(/ëkco clip/g, '⟦CLIP⟧')
    .replace(/ëkco mat/g, '⟦MAT⟧')
    .replace(/frësh drop/g, '⟦FRESH⟧')
    .replace(/ëz trap/g, '⟦EZ⟧')
    .replace(/ëkcos/g, '⟦EKCOS⟧')
    .replace(/ASTM D5511/g, '⟦ASTM⟧')
    .replace(/ISO 15985/g, '⟦ISO⟧')
    .replace(/Falcon Velocity/g, '⟦FALCON⟧')
    .replace(/PPWR/g, '⟦PPWR⟧')
    .replace(/<ecoOne>/g, '⟦ECOOPEN⟧')
    .replace(/<\/ecoOne>/g, '⟦ECOCLOSE⟧')
}

function unprotect(text: string): string {
  return text
    .replace(/⟦ECOONE⟧/gi, 'Eco-One™')
    .replace(/⟦SBT⟧/gi, 'Sealed Bristles Technology™')
    .replace(/⟦EKS60⟧/gi, 'ëkcoscreen 60+')
    .replace(/⟦XHD60⟧/gi, 'xcrën HD 60+')
    .replace(/⟦PUCK⟧/gi, 'xcrën puck')
    .replace(/⟦PWR⟧/gi, 'powër screen')
    .replace(/⟦BS⟧/gi, 'basic scrëen')
    .replace(/⟦URO⟧/gi, 'üro lite')
    .replace(/⟦CLIP⟧/gi, 'ëkco clip')
    .replace(/⟦MAT⟧/gi, 'ëkco mat')
    .replace(/⟦FRESH⟧/gi, 'frësh drop')
    .replace(/⟦EZ⟧/gi, 'ëz trap')
    .replace(/⟦EKCOS⟧/gi, 'ëkcos')
    .replace(/⟦ASTM⟧/gi, 'ASTM D5511')
    .replace(/⟦ISO⟧/gi, 'ISO 15985')
    .replace(/⟦FALCON⟧/gi, 'Falcon Velocity')
    .replace(/⟦PPWR⟧/gi, 'PPWR')
    .replace(/⟦ECOOPEN⟧/gi, '<ecoOne>')
    .replace(/⟦ECOCLOSE⟧/gi, '</ecoOne>')
    .replace(/—/g, '-')
}

function flatten(
  obj: Record<string, unknown>,
  prefix = '',
): {path: string; text: string}[] {
  const out: {path: string; text: string}[] = []
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') out.push({path: p, text: v})
    else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flatten(v as Record<string, unknown>, p))
    }
  }
  return out
}

function setPath(obj: Record<string, unknown>, path: string, value: string) {
  const parts = path.split('.')
  let cur: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in cur) || typeof cur[part] !== 'object' || cur[part] === null) {
      cur[part] = {}
    }
    cur = cur[part] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
}

async function translateBatch(texts: string[], to: string): Promise<string[]> {
  const protectedTexts = texts.map(protect)
  const result = await translate(protectedTexts, {from: 'en', to})
  const arr = Array.isArray(result) ? result : [result]
  return arr.map((r, i) =>
    unprotect(typeof r.text === 'string' ? r.text : protectedTexts[i]),
  )
}

const en = JSON.parse(readFileSync(join(ROOT, 'dictionaries/en.json'), 'utf8')) as {
  articles: {advisor: Record<string, unknown>}
}
const entries = flatten(en.articles.advisor)
console.log(`${entries.length} strings to translate`)

const targets = locales.filter((l) => !SKIP.has(l)) as AppLocale[]

for (const locale of targets) {
  const gt = GT[locale]
  if (!gt) continue
  const path = join(ROOT, `dictionaries/${locale}.json`)
  const dict = JSON.parse(readFileSync(path, 'utf8')) as {
    articles: Record<string, unknown>
  }
  if (dict.articles?.advisor) {
    console.log('skip (exists):', locale)
    continue
  }

  console.log('translating', locale)
  const translated: Record<string, unknown> = {}
  const CHUNK = 20
  for (let i = 0; i < entries.length; i += CHUNK) {
    const slice = entries.slice(i, i + CHUNK)
    let attempts = 0
    while (true) {
      try {
        const texts = await translateBatch(
          slice.map((e) => e.text),
          gt,
        )
        slice.forEach((e, idx) => setPath(translated, e.path, texts[idx]))
        break
      } catch (err) {
        attempts += 1
        if (attempts >= 4) throw err
        console.warn(`retry ${locale} chunk ${i} (${attempts})`, err)
        await new Promise((r) => setTimeout(r, 1500 * attempts))
      }
    }
    await new Promise((r) => setTimeout(r, 400))
  }

  dict.articles.advisor = translated
  writeFileSync(path, `${JSON.stringify(dict, null, 2)}\n`)
  console.log('wrote', locale)
}

console.log('done')
