/**
 * Translate UI chrome in locale dictionaries (everything except products.*).
 * Keeps strings already different from English (docx / curated copy).
 *
 * Usage: bun scripts/translate-ui-dictionaries.ts [locale...]
 */
import { translate } from 'google-translate-api-x'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DICT = join(ROOT, 'dictionaries')

const NEW_LOCALES = [
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

/** Google Translate language codes (el = Greek). */
const GT_CODE: Record<string, string> = {
  bg: 'bg',
  hr: 'hr',
  da: 'da',
  nl: 'nl',
  et: 'et',
  fi: 'fi',
  el: 'el',
  hu: 'hu',
  lv: 'lv',
  lt: 'lt',
  pl: 'pl',
  pt: 'pt',
  ro: 'ro',
  sk: 'sk',
  sl: 'sl',
  sv: 'sv',
}

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

function walkStrings(
  node: Json,
  path: string[],
  visit: (path: string[], value: string) => void,
) {
  if (typeof node === 'string') {
    visit(path, node)
    return
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkStrings(item, [...path, String(i)], visit))
    return
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      walkStrings(v, [...path, k], visit)
    }
  }
}

function setAt(root: Record<string, Json>, path: string[], value: string) {
  let cur: Json = root
  for (let i = 0; i < path.length - 1; i++) {
    cur = (cur as Record<string, Json>)[path[i]]
  }
  ;(cur as Record<string, Json>)[path[path.length - 1]] = value
}

function getAt(root: Record<string, Json>, path: string[]): Json | undefined {
  let cur: Json | undefined = root
  for (const p of path) {
    if (cur == null || typeof cur !== 'object' || Array.isArray(cur)) return undefined
    cur = (cur as Record<string, Json>)[p]
  }
  return cur
}

function protect(text: string): string {
  return text
    .replace(/Eco-One™/g, '⟦ECOONE⟧')
    .replace(/Eco-One/g, '⟦ECOONE⟧')
    .replace(/ëkcos/gi, '⟦EKCOS⟧')
    .replace(/Sealed Bristles Technology™/g, '⟦SBT⟧')
    .replace(/<bold>/g, '⟦BOLD⟧')
    .replace(/<\/bold>/g, '⟦\/BOLD⟧')
    .replace(/\{([a-zA-Z0-9_]+)\}/g, '⟦VAR_$1⟧')
}

function unprotect(text: string): string {
  return text
    .replace(/⟦ECOONE⟧/g, 'Eco-One™')
    .replace(/⟦EKCOS⟧/gi, 'ëkcos')
    .replace(/⟦SBT⟧/g, 'Sealed Bristles Technology™')
    .replace(/⟦BOLD⟧/g, '<bold>')
    .replace(/⟦\/BOLD⟧/g, '</bold>')
    .replace(/⟦VAR_([a-zA-Z0-9_]+)⟧/g, '{$1}')
}

function shouldSkipPath(path: string[]): boolean {
  if (path[0] === 'products') return true
  // Language names in LocaleSwitcher — switcher uses endonyms; keep short EN or skip
  if (path[0] === 'LocaleSwitcher' && path[1] !== 'label') return true
  return false
}

function shouldSkipValue(value: string): boolean {
  const t = value.trim()
  if (!t) return true
  // Pure brand / URL / email / code-like
  if (/^(ëkcos|Eco-One™|ekcos\.eu|www\.ekcos\.eu)$/i.test(t)) return true
  if (/^https?:\/\//i.test(t)) return true
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(t)) return true
  return false
}

async function translateBatch(
  texts: string[],
  to: string,
): Promise<string[]> {
  if (texts.length === 0) return []
  const protectedTexts = texts.map(protect)
  const chunkSize = 40
  const out: string[] = []

  for (let i = 0; i < protectedTexts.length; i += chunkSize) {
    const chunk = protectedTexts.slice(i, i + chunkSize)
    let attempt = 0
    for (;;) {
      try {
        const result = await translate(chunk, {
          from: 'en',
          to,
          forceBatch: true,
        })
        const arr = Array.isArray(result) ? result : [result]
        for (const item of arr) {
          out.push(unprotect(item.text))
        }
        break
      } catch (err) {
        attempt += 1
        if (attempt >= 5) throw err
        const wait = 1500 * attempt
        console.warn(`  retry ${attempt} after error, wait ${wait}ms`)
        await new Promise((r) => setTimeout(r, wait))
      }
    }
    // gentle pacing
    await new Promise((r) => setTimeout(r, 400))
  }

  return out
}

async function translateLocale(locale: string, en: Record<string, Json>) {
  const path = join(DICT, `${locale}.json`)
  const data = JSON.parse(readFileSync(path, 'utf8')) as Record<string, Json>
  const to = GT_CODE[locale]
  if (!to) throw new Error(`No GT code for ${locale}`)

  type Job = { path: string[]; enValue: string }
  const jobs: Job[] = []

  walkStrings(en, [], (p, enValue) => {
    if (shouldSkipPath(p) || shouldSkipValue(enValue)) return
    const current = getAt(data, p)
    // Only translate if still identical to English (untranslated)
    if (typeof current === 'string' && current === enValue) {
      jobs.push({ path: p, enValue })
    }
  })

  console.log(`${locale}: translating ${jobs.length} strings → ${to}`)
  const translated = await translateBatch(
    jobs.map((j) => j.enValue),
    to,
  )

  for (let i = 0; i < jobs.length; i++) {
    setAt(data, jobs[i].path, translated[i] ?? jobs[i].enValue)
  }

  // Ensure LocaleSwitcher.label exists
  const switcher = data.LocaleSwitcher as Record<string, Json> | undefined
  if (switcher && typeof switcher.label === 'string') {
    // already translated if was English
  }

  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  console.log(`${locale}: wrote ${path}`)
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  const locales = args.length > 0 ? args : [...NEW_LOCALES]
  const en = JSON.parse(readFileSync(join(DICT, 'en.json'), 'utf8')) as Record<
    string,
    Json
  >

  for (const locale of locales) {
    await translateLocale(locale, en)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
