/**
 * Translate incomplete eshop FAQ locales from English source.
 * Always skips Slovenian. Keeps EN (source) and complete CS.
 *
 *   bun scripts/translate-eshop-faq-locales.ts
 *   bun scripts/translate-eshop-faq-locales.ts es sk pl
 */
import { translate } from 'google-translate-api-x'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const FAQ_DIR = join(ROOT, 'content/faq/eshop')
const SKIP = new Set(['en', 'cs', 'sl'])
const EXPECTED_ITEMS = 45

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json }

function protect(text: string): string {
  return text
    .replace(/Eco-One™/g, '__BRAND_ECOONE__')
    .replace(/EcoOne/g, '__BRAND_ECOONE__')
    .replace(/Eco-One/g, '__BRAND_ECOONE__')
    .replace(/Sealed Bristles Technology™/g, '__BRAND_SBT__')
    .replace(/Sealed Bristles Technology/g, '__BRAND_SBT__')
    .replace(/xcrën HD 60\+/gi, '__BRAND_XCRENHD60__')
    .replace(/xcrën HD/gi, '__BRAND_XCRENHD__')
    .replace(/xcrën\s+[Pp]uck/gi, '__BRAND_XCRENPUCK__')
    .replace(/ëkcoscreen 60\+/gi, '__BRAND_EKCOSCREEN60__')
    .replace(/ëkcoscreen/gi, '__BRAND_EKCOSCREEN__')
    .replace(/powër screen/gi, '__BRAND_POWERSCREEN__')
    .replace(/basic scrëen/gi, '__BRAND_BASICSCREEN__')
    .replace(/üro lite/gi, '__BRAND_UROLITE__')
    .replace(/ëkco clip/gi, '__BRAND_EKCOCLIP__')
    .replace(/ëkco loop/gi, '__BRAND_EKCOLOOP__')
    .replace(/ëkco mat/gi, '__BRAND_EKCOMAT__')
    .replace(/frësh drop/gi, '__BRAND_FRESHDROP__')
    .replace(/ëz trap/gi, '__BRAND_EZTRAP__')
    .replace(/NON-PARA/g, '__BRAND_NONPARA__')
    .replace(/support@ekcos\.eu/gi, '__EMAIL_SUPPORT__')
    .replace(/eshop\.ekcos\.eu/gi, '__URL_ESHOP__')
    .replace(/ASTM D5511(?:-02)?/g, '__STD_ASTM__')
    .replace(/ISO 15985(?::2014)?/g, '__STD_ISO__')
    .replace(/PPWR/g, '__STD_PPWR__')
    .replace(/VIES/g, '__STD_VIES__')
    .replace(/BOPP/g, '__STD_BOPP__')
    .replace(/EVA/g, '__STD_EVA__')
    .replace(/Instituto Politécnico Nacional/g, '__ORG_IPN__')
    .replace(/Mexico City/g, '__PLACE_MXCITY__')
    .replace(/EcoLogic,\s*LLC/g, '__ORG_ECOLOGIC__')
    .replace(/ëkcos innovations/gi, '__BRAND_EKCOS_INNOVATIONS__')
    .replace(/ëkcos/gi, '__BRAND_EKCOS__')
}

function unprotect(text: string): string {
  return text
    .replace(/__BRAND_ECOONE__/gi, 'Eco-One™')
    .replace(/__BRAND_SBT__/gi, 'Sealed Bristles Technology™')
    .replace(/__BRAND_XCRENHD60__/gi, 'xcrën HD 60+')
    .replace(/__BRAND_XCRENHD__/gi, 'xcrën HD')
    .replace(/__BRAND_XCRENPUCK__/gi, 'xcrën puck')
    .replace(/__BRAND_EKCOSCREEN60__/gi, 'ëkcoscreen 60+')
    .replace(/__BRAND_EKCOSCREEN__/gi, 'ëkcoscreen')
    .replace(/__BRAND_POWERSCREEN__/gi, 'powër screen')
    .replace(/__BRAND_BASICSCREEN__/gi, 'basic scrëen')
    .replace(/__BRAND_UROLITE__/gi, 'üro lite')
    .replace(/__BRAND_EKCOCLIP__/gi, 'ëkco clip')
    .replace(/__BRAND_EKCOLOOP__/gi, 'ëkco loop')
    .replace(/__BRAND_EKCOMAT__/gi, 'ëkco mat')
    .replace(/__BRAND_FRESHDROP__/gi, 'frësh drop')
    .replace(/__BRAND_EZTRAP__/gi, 'ëz trap')
    .replace(/__BRAND_NONPARA__/gi, 'NON-PARA')
    .replace(/__EMAIL_SUPPORT__/gi, 'support@ekcos.eu')
    .replace(/__URL_ESHOP__/gi, 'eshop.ekcos.eu')
    .replace(/__STD_ASTM__/gi, 'ASTM D5511-02')
    .replace(/__STD_ISO__/gi, 'ISO 15985:2014')
    .replace(/__STD_PPWR__/gi, 'PPWR')
    .replace(/__STD_VIES__/gi, 'VIES')
    .replace(/__STD_BOPP__/gi, 'BOPP')
    .replace(/__STD_EVA__/gi, 'EVA')
    .replace(/__ORG_IPN__/gi, 'Instituto Politécnico Nacional')
    .replace(/__PLACE_MXCITY__/gi, 'Mexico City')
    .replace(/__ORG_ECOLOGIC__/gi, 'EcoLogic, LLC')
    .replace(/__BRAND_EKCOS_INNOVATIONS__/gi, 'ëkcos innovations')
    .replace(/__BRAND_EKCOS__/gi, 'ëkcos')
}

function collectStrings(node: Json, out: string[]) {
  if (typeof node === 'string') {
    out.push(node)
    return
  }
  if (Array.isArray(node)) {
    for (const item of node) collectStrings(item, out)
    return
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      // Keep structural ids in English
      if (key === 'id' || key === 'type' || key === 'value') continue
      collectStrings(value, out)
    }
  }
}

function applyStrings(node: Json, values: string[], index: { i: number }): Json {
  if (typeof node === 'string') {
    const next = values[index.i] ?? node
    index.i += 1
    return next
  }
  if (Array.isArray(node)) {
    return node.map((item) => applyStrings(item, values, index))
  }
  if (node && typeof node === 'object') {
    const out: Record<string, Json> = {}
    for (const [key, value] of Object.entries(node)) {
      if (key === 'id' || key === 'type' || key === 'value') {
        out[key] = value
        continue
      }
      out[key] = applyStrings(value, values, index)
    }
    return out
  }
  return node
}

async function translateTexts(texts: string[], to: string): Promise<string[]> {
  if (!texts.length) return []
  const protectedTexts = texts.map(protect)
  const out: string[] = []
  const chunkSize = 20
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
        for (const item of arr) out.push(unprotect(item.text))
        break
      } catch (err) {
        attempt += 1
        if (attempt >= 5) throw err
        await new Promise((r) => setTimeout(r, 800 * attempt))
      }
    }
    process.stdout.write('.')
  }
  return out
}

function itemCount(data: { categories?: { items?: unknown[] }[] }): number {
  return (data.categories || []).reduce(
    (n, c) => n + (c.items?.length || 0),
    0,
  )
}

async function translateLocale(en: Json, locale: string): Promise<Json> {
  const strings: string[] = []
  collectStrings(en, strings)
  console.log(`\n${locale}: translating ${strings.length} strings`)
  const translated = await translateTexts(strings, locale)
  if (translated.length !== strings.length) {
    throw new Error(
      `${locale}: got ${translated.length} translations for ${strings.length} strings`,
    )
  }
  // Force FAQ title to stay "FAQ" (universal) like EN
  const result = applyStrings(structuredClone(en), translated, { i: 0 }) as {
    hero?: { title?: string }
  }
  if (result.hero) result.hero.title = 'FAQ'
  return result as Json
}

async function main() {
  const en = JSON.parse(
    readFileSync(join(FAQ_DIR, 'en.json'), 'utf8'),
  ) as Json & { categories?: { items?: unknown[] }[] }

  const argLocales = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  const all = readdirSync(FAQ_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .filter((loc) => !SKIP.has(loc))

  const targets = (argLocales.length ? argLocales : all).filter((loc) => {
    if (loc === 'sl') {
      console.log('skip sl (not on eshop)')
      return false
    }
    if (SKIP.has(loc)) return false
    if (argLocales.length) return true
    const path = join(FAQ_DIR, `${loc}.json`)
    try {
      const data = JSON.parse(readFileSync(path, 'utf8')) as {
        categories?: { items?: unknown[] }[]
      }
      const n = itemCount(data)
      if (n >= EXPECTED_ITEMS) {
        console.log(`keep ${loc} (${n} items)`)
        return false
      }
      console.log(`queue ${loc} (${n} items)`)
      return true
    } catch {
      console.log(`queue ${loc} (missing)`)
      return true
    }
  })

  // Also force-translate locales that have 45 but no tables when run with --all-incomplete
  // Default queue already covers < 45.

  for (const locale of targets) {
    const translated = await translateLocale(en, locale)
    writeFileSync(
      join(FAQ_DIR, `${locale}.json`),
      `${JSON.stringify(translated, null, 2)}\n`,
    )
    const n = itemCount(
      translated as { categories?: { items?: unknown[] }[] },
    )
    console.log(`\nwrote ${locale}.json (${n} items)`)
  }

  console.log('\nDone. Skip list:', [...SKIP].join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
