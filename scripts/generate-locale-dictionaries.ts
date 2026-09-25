/**
 * Build dictionaries for new EU locales:
 * - Start from en.json (UI chrome)
 * - Overlay product + green-claim copy from ekcos_product_texts_*.docx
 *
 * Usage: bun scripts/generate-locale-dictionaries.ts
 */
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOC_DIR = join(
  process.env.HOME ?? '',
  'Downloads/ekcos_product_texts_EU_3',
)
const DICT_DIR = join(ROOT, 'dictionaries')

/** New locales only — existing six already curated. */
const NEW_LOCALES: Record<string, string> = {
  bg: 'ekcos_product_texts_Bulgarian.docx',
  hr: 'ekcos_product_texts_Croatian.docx',
  da: 'ekcos_product_texts_Danish.docx',
  nl: 'ekcos_product_texts_Dutch.docx',
  et: 'ekcos_product_texts_Estonian.docx',
  fi: 'ekcos_product_texts_Finnish.docx',
  el: 'ekcos_product_texts_Greek.docx',
  hu: 'ekcos_product_texts_Hungarian.docx',
  lv: 'ekcos_product_texts_Latvian.docx',
  lt: 'ekcos_product_texts_Lithuanian.docx',
  pl: 'ekcos_product_texts_Polish.docx',
  pt: 'ekcos_product_texts_Portuguese.docx',
  ro: 'ekcos_product_texts_Romanian.docx',
  sk: 'ekcos_product_texts_Slovak.docx',
  sl: 'ekcos_product_texts_Slovenian.docx',
  sv: 'ekcos_product_texts_Swedish.docx',
}

const PRODUCT_MAP: Array<[string, string]> = [
  ['xcrenHd', 'xcrën HD'],
  ['ekcoscreen', 'ëkcoscreen'],
  ['powerscreen', 'powër screen'],
  ['basicScreen', 'basic scrëen'],
  ['urolite', 'üro lite'],
  ['ekcoClip', 'ëkco clip'],
  ['freshDrop', 'frësh drop'],
  ['ezTrap', 'ëz trap'],
  ['xcrenPuck', 'xcrën puck'],
  ['ekcoMat', 'ëkco mat'],
]

const SHARED_VARIANT_ORDER: Array<[string, string]> = [
  ['1P', 'x1p'],
  ['2G', 'x2g'],
  ['3B', 'x3b'],
  ['4O', 'x4o'],
  ['6C', 'x6c'],
  ['7BK', 'x7bk'],
  ['8BM', 'x8bm'],
  ['9G', 'x9g'],
  ['10R', 'x10r'],
  ['12P', 'x12p'],
  ['13C', 'x13c'],
]

const XHD_VARIANT_KEYS: Record<string, string> = {
  'XHD-1P': 'xhd1p',
  'XHD-2G': 'xhd2g',
  'XHD-3B': 'xhd3b',
  'XHD-4O': 'xhd4o',
  'XHD-6C': 'xhd6c',
  'XHD-7BK': 'xhd7bk',
  'XHD-8BM': 'xhd8bm',
  'XHD-9G': 'xhd9g',
  'XHD-10R': 'xhd10r',
  'XHD-12P': 'xhd12p',
  'XHD-13C': 'xhd13c',
}

const BENEFITS_MARKERS = [
  'key benefits',
  'hlavní výhody',
  'hlavné výhody',
  'ventajas principales',
  'ventajas clave',
  'principaux avantages',
  'wichtigste vorteile',
  'die wichtigsten vorteile',
  'vantaggi principali',
  'vigtigste fordele',
  'belangrijkste voordelen',
  'viktigaste fördelar',
  'viktigaste fördelarna',
  'tärkeimmät edut',
  'peamised eelised',
  'galvenās priekšrocības',
  'galvenie ieguvumi',
  'pagrindiniai privalumai',
  'pagrindinės naudos',
  'najważniejsze zalety',
  'główne korzyści',
  'principais vantagens',
  'principais benefícios',
  'avantaje principale',
  'principalele beneficii',
  'glavne prednosti',
  'osnovne prednosti',
  'ključne prednosti',
  'основни предимства',
  'βασικά πλεονεκτήματα',
  'βασικά οφέλη',
  'fő előnyök',
  'főbb előnyök',
  'kľúčové výhody',
]

const CODES_MARKERS = [
  'product codes',
  'kódy a',
  'códigos y nombres',
  'codes et noms',
  'produktcodes',
  'artikelnummern',
  'codici e nomi',
  'varenumre',
  'produktkoder',
  'productcodes',
  'tuotekoodit',
  'tootekoodid',
  'produktu kodi',
  'gaminių kodai',
  'produktų kodai',
  'kody i',
  'códigos e nomes',
  'coduri și',
  'coduri si',
  'kodovi i nazivi',
  'šifre i nazivi',
  'sifre i nazivi',
  'šifre in nazivi',
  'sifre in nazivi',
  'кодове и',
  'κωδικοί',
  'termékkódok',
  'kódy a názvy',
  'kode in imena',
]

function findSectionIndex(
  chunk: string[],
  markers: string[],
  opts?: { requireBulletsAfter?: boolean },
): number | null {
  for (let i = 0; i < chunk.length; i++) {
    const st = chunk[i].trim().toLowerCase()
    if (markers.some((m) => st.includes(m))) return i
  }
  if (opts?.requireBulletsAfter) {
    for (let i = 0; i < chunk.length; i++) {
      const st = chunk[i].trim()
      if (!st.endsWith(':')) continue
      const next = chunk[i + 1] ?? ''
      if (next.includes('•') || next.startsWith('\t•') || next.startsWith('\t')) {
        const low = st.toLowerCase()
        if (CODES_MARKERS.some((m) => low.includes(m))) continue
        if (/sku|produktname|product name/i.test(low)) continue
        return i
      }
    }
  }
  return null
}

type ProductParsed = {
  name: string
  category: string
  short: string
  long: string
  benefits: string[]
  variants_raw: Array<[string, string]>
}

type ParsedDoc = {
  about: {
    paragraphs: string[]
    vision_items: string[]
    vision_closing: string | null
  }
  products: Record<string, ProductParsed>
}

function extractTxt(docx: string): string {
  const r = spawnSync('textutil', ['-convert', 'txt', '-stdout', docx], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
  if (r.status !== 0) {
    throw new Error(`textutil failed for ${docx}: ${r.stderr}`)
  }
  return (r.stdout ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\ufeff/g, '')
    .replace(/\r/g, '')
}

function colorScentLabel(fullLabel: string): string {
  let label = fullLabel
  for (const junk of [
    'xcrën HD 60+',
    'xcrën HD',
    'ëkcoscreen 60+',
    'ëkcoscreen',
    'powër screen',
    'basic scrëen',
    'üro lite',
    'ëkco clip',
    'frësh drop insert',
    'frësh drop base',
    'frësh drop lock',
    'frësh drop',
    'ëz trap',
    'xcrën puck',
    'ëkco mat',
  ]) {
    if (label.toLowerCase().startsWith(junk.toLowerCase())) {
      label = label.slice(junk.length).trim()
      break
    }
  }
  return label ? label.toLowerCase() : fullLabel.toLowerCase()
}

function isToolVariantSubtitle(after: string): boolean {
  const a = after.toLowerCase()
  const toolish = [
    'tool',
    'nástroj',
    'herramient',
    'outil',
    'werkzeug',
    'strument',
    'removal',
    'narzęd',
    'verktyg',
    'værktøj',
    'työkalu',
  ]
  const withish =
    /^(without |with |ohne |mit |bez |s |sin |con |sans |avec |senza |sem |com |fara |cu |ohne |med |ilman )/i.test(
      a,
    )
  return withish && toolish.some((t) => a.includes(t))
}

function parseDoc(text: string): ParsedDoc {
  const lines = text.split('\n')
  const starts: Array<[number, string, string, string]> = []

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/^\f/, '').trim()
    if (!raw) continue
    for (const [key, prefix] of PRODUCT_MAP) {
      if (raw.toLowerCase().startsWith(prefix.toLowerCase()) && raw.includes(' - ')) {
        const after = raw.split(' - ')[1]
        if (after.includes('/') && after.length < 45) continue
        if (isToolVariantSubtitle(after)) continue
        starts.push([i, key, prefix, raw])
        break
      }
    }
  }

  const filtered: typeof starts = []
  const seen = new Set<string>()
  for (const item of starts) {
    if (seen.has(item[1])) continue
    seen.add(item[1])
    filtered.push(item)
  }

  const products: Record<string, ProductParsed> = {}
  for (let idx = 0; idx < filtered.length; idx++) {
    const [start, key, prefix, titleLine] = filtered[idx]
    const end = idx + 1 < filtered.length ? filtered[idx + 1][0] : lines.length
    let chunk = lines.slice(start, end)
    for (let j = 0; j < chunk.length; j++) {
      if (
        j > 0 &&
        chunk[j].replace(/^\f/, '').trim().toLowerCase().startsWith('ëkco loop')
      ) {
        chunk = chunk.slice(0, j)
        break
      }
    }

    const title = titleLine.replace(/^\f/, '').trim()
    const category = title.includes(' - ') ? title.split(' - ').slice(1).join(' - ').trim() : ''

    let benIdx = findSectionIndex(chunk, BENEFITS_MARKERS, {
      requireBulletsAfter: true,
    })
    let codesIdx = findSectionIndex(chunk, CODES_MARKERS)
    // Fallback: line that is exactly "SKU" after a title line
    if (codesIdx === null) {
      for (let i = 0; i < chunk.length; i++) {
        if (chunk[i].trim() === 'SKU') {
          codesIdx = i > 0 ? i - 1 : i
          break
        }
      }
    }

    const bodyEnd = benIdx ?? codesIdx ?? chunk.length
    const paragraphs = chunk
      .slice(1, bodyEnd)
      .map((l) => l.trim())
      .filter((s) => s && s !== '\f')

    const benefits: string[] = []
    if (benIdx !== null) {
      const stop = codesIdx ?? chunk.length
      for (const l of chunk.slice(benIdx + 1, stop)) {
        const s = l.trim()
        if (!s) continue
        if (s.startsWith('•') || l.startsWith('\t') || s.startsWith('-')) {
          const cleaned = s.replace(/^[•\-\t\s]+/, '').replace(/^•/, '').trim()
          if (cleaned) benefits.push(cleaned)
        }
      }
    }

    const variants: Array<[string, string]> = []
    if (codesIdx !== null) {
      const codeLines = chunk
        .slice(codesIdx + 1)
        .map((l) => l.trim())
        .filter(Boolean)
      let i = 0
      while (i < codeLines.length) {
        const line = codeLines[i]
        if (/^[A-Z]{2,4}-[0-9A-Z]+$/.test(line)) {
          const sku = line
          const label = codeLines[i + 1] ?? ''
          if (label && !/^[A-Z]{2,4}-[0-9A-Z]+$/.test(label)) {
            variants.push([sku, label])
            i += 2
          } else {
            i += 1
          }
        } else {
          i += 1
        }
      }
    }

    products[key] = {
      name: prefix,
      category,
      short: paragraphs[0] ?? category,
      long: paragraphs.join('\n\n'),
      benefits,
      variants_raw: variants,
    }
  }

  const aboutHeaders = [
    'About Us',
    'O nás',
    'Sobre nosotros',
    'À propos',
    'Über uns',
    'Chi siamo',
    'Over ons',
    'Om os',
    'Om oss',
    'Tietoa meistä',
    'Meist',
    'Par mums',
    'Apie mus',
    'O nas',
    'Sobre nós',
    'Despre noi',
    'Za nas',
    'O nama',
    'За нас',
    'Σχετικά με εμάς',
    'Rólunk',
    'O nás',
  ]
  const visionHeaders = [
    'Our Vision',
    'Naše vize',
    'Nuestra visión',
    'Notre vision',
    'Unsere Vision',
    'La nostra visione',
    'Onze visie',
    'Vår vision',
    'Vores vision',
    'Visiomme',
    'Meie visioon',
    'Mūsu vīzija',
    'Mūsų vizija',
    'Nasza wizja',
    'A nossa visão',
    'Viziunea noastră',
    'Naša vizija',
    'Нашата визия',
    'Το όραμά μας',
    'Jövőképünk',
    'Naša vízia',
  ]

  let aboutIdx: number | null = null
  let visionIdx: number | null = null
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].replace(/^\f/, '').trim()
    if (aboutIdx === null && aboutHeaders.some((h) => t === h || t.startsWith(h))) {
      aboutIdx = i
    }
    if (visionIdx === null && visionHeaders.some((h) => t === h || t.startsWith(h))) {
      visionIdx = i
    }
  }

  const firstProduct = filtered[0]?.[0] ?? lines.length
  const about = {
    paragraphs: [] as string[],
    vision_items: [] as string[],
    vision_closing: null as string | null,
  }
  if (aboutIdx !== null) {
    const endAbout = visionIdx ?? firstProduct
    about.paragraphs = lines
      .slice(aboutIdx + 1, endAbout)
      .map((l) => l.trim())
      .filter(Boolean)
  }
  if (visionIdx !== null) {
    for (const l of lines.slice(visionIdx + 1, firstProduct)) {
      const s = l.trim()
      if (!s) continue
      if (s.startsWith('•') || l.startsWith('\t') || s.startsWith('-')) {
        about.vision_items.push(s.replace(/^[•\-\t\s]+/, '').replace(/^•/, '').trim())
      } else {
        about.vision_closing = s
      }
    }
  }

  return { about, products }
}

function benefitsObj(list: string[]): Record<string, string> {
  return Object.fromEntries(list.map((v, i) => [String(i), v]))
}

function buildProductBlock(
  existing: Record<string, unknown>,
  p: ProductParsed,
  key: string,
): Record<string, unknown> {
  const out = structuredClone(existing) as Record<string, unknown>
  out.name = p.name
  out.category = p.category
  if (key === 'xcrenHd') out.badge = p.category
  out.short = p.short
  out.long = p.long
  out.benefits = benefitsObj(p.benefits)

  const raw = p.variants_raw
  if (key === 'xcrenHd') {
    const variants: Record<string, string> = {}
    for (const [sku, label] of raw) {
      const vk = XHD_VARIANT_KEYS[sku]
      if (vk) variants[vk] = colorScentLabel(label)
    }
    if (Object.keys(variants).length) out.variants = variants
  } else if (key === 'freshDrop') {
    const bases: Record<string, string> = {}
    for (const [sku, label] of raw) {
      if (!sku.startsWith('FDB-')) continue
      const cs = colorScentLabel(label)
      const low = label.toLowerCase()
      if (
        /white|blanc|weiß|bílá|bianc|wit|hvid|vit|valkoinen|valge|balta|biał|branco|alb|bijel|бял|λευκ|fehér|biela|bela/.test(
          low,
        )
      ) {
        bases.white = cs
      } else {
        bases.black = cs
      }
    }
    if (Object.keys(bases).length) out.bases = bases
  } else if (key === 'ezTrap') {
    const variants: Record<string, string> = {}
    for (const [sku, label] of raw) {
      const clean = label.includes(' - ') ? label.split(' - ').slice(1).join(' - ').trim() : label
      const low = label.toLowerCase()
      if (
        sku.endsWith('00') ||
        /without|ohne|bez|sin|sans|senza|sem|fara|uden|zonder|utan|ilman/.test(low)
      ) {
        variants.withoutTool = clean
      } else {
        variants.withTool = clean
      }
    }
    if (Object.keys(variants).length) out.variants = variants
  } else if (key === 'xcrenPuck') {
    const variants: Record<string, string> = {}
    for (const [sku, label] of raw) {
      const cs = colorScentLabel(label)
      const low = label.toLowerCase()
      if (
        sku.endsWith('B') ||
        /blue|blau|modr|azul|bleu|blu|blå|sininen|sinine|zila|mėlyn|niebies|albastr|plav|син|μπλε|kék/.test(
          low,
        )
      ) {
        variants.blueFresh = cs
      } else {
        variants.whiteFresh = cs
      }
    }
    if (Object.keys(variants).length) out.variants = variants
  } else if (key === 'ekcoMat' && raw[0]) {
    const variants = {
      ...((out.variants as Record<string, string>) ?? {}),
      standard: colorScentLabel(raw[0][1]),
    }
    out.variants = variants
  }

  return out
}

function sharedVariantLabels(parsed: ParsedDoc): Record<string, string> {
  let src: Array<[string, string]> | null = null
  for (const key of ['ekcoscreen', 'powerscreen', 'basicScreen', 'xcrenHd']) {
    const v = parsed.products[key]?.variants_raw
    if (v?.length) {
      src = v
      break
    }
  }
  if (!src) return {}
  const labels: Record<string, string> = {}
  for (const [sku, label] of src) {
    for (const [suffix, vk] of SHARED_VARIANT_ORDER) {
      if (sku.endsWith(suffix) || sku.split('-')[1] === suffix) {
        labels[vk] = colorScentLabel(label)
        break
      }
    }
  }
  return labels
}

function findEcoPara(paragraphs: string[]): string | null {
  for (const p of paragraphs) {
    if (
      p.includes('Eco-One') &&
      /landfill|skládk|vertedero|décharge|deponie|discarica|stortplaats|losseplads|deponi|kaatopaik|prügila|poligon|sąvartyn|składowisk|aterro|groap|odlagališt|депони|χωματερ|hulladéklerak/i.test(
        p,
      )
    ) {
      return p
    }
  }
  for (const p of paragraphs) {
    if (p.includes('Eco-One')) return p
  }
  return null
}

function scrubClaims(
  data: Record<string, unknown>,
  about: ParsedDoc['about'],
  locale: string,
) {
  const ecoPara = findEcoPara(about.paragraphs)
  if (!ecoPara) return

  const meta =
    ecoPara.length > 320
      ? (() => {
          const cut = ecoPara.slice(0, 320)
          const sp = cut.lastIndexOf('. ')
          return sp > 120 ? ecoPara.slice(0, sp + 1) : cut
        })()
      : ecoPara

  const metadata = data.Metadata as Record<string, string>
  metadata.description = meta
  metadata.ecoOneDescription = ecoPara.length < 400 ? ecoPara : meta

  const footer = data.footer as Record<string, string>
  if (about.vision_closing) footer.tagline = about.vision_closing

  const home = data.home as {
    hero: Record<string, string>
    benefits: { eco: Record<string, string> }
  }
  // Prefer Eco-One benefit phrasing from xcren if available later; use short EN-style fallback via eco para snippet
  const taglineFromBenefit = (
    data.products as Record<string, { benefits?: Record<string, string> }>
  )?.xcrenHd?.benefits?.['5']
  home.hero.tagline =
    taglineFromBenefit && taglineFromBenefit.length < 120
      ? taglineFromBenefit
      : ecoPara.includes('Eco-One')
        ? ecoPara.split('. ').find((s) => /Eco-One|EVA/i.test(s))?.slice(0, 100) ??
          home.hero.tagline
        : home.hero.tagline

  const bodyParts = ecoPara.split(/(?<=\.)\s+/)
  home.hero.body =
    ecoPara.length > 400 && bodyParts.length >= 2
      ? `${bodyParts[0]} ${bodyParts[1]}`
      : ecoPara

  const visionBio =
    about.vision_items.find((v) => /EVA|Eco-One|biodegrad|biolog/i.test(v)) ?? null
  if (visionBio) home.benefits.eco.body = visionBio

  const ecoOne = data.ecoOne as {
    hero: Record<string, string>
    closing: Record<string, string>
  }
  ecoOne.hero.body = ecoPara
  // Keep English chrome titles if we don't have localized marketing titles — hero body carries the claim.
  if (locale !== 'en') {
    // Leave hero.title from EN base unless we already scrubbed EN; for new locales EN title is OK temporarily
  }
}

function applyProducts(
  data: Record<string, unknown>,
  parsed: ParsedDoc,
) {
  const products = data.products as Record<string, Record<string, unknown>>
  const labels = sharedVariantLabels(parsed)
  if (Object.keys(labels).length) products.variantLabels = labels

  for (const [key] of PRODUCT_MAP) {
    if (!products[key] || !parsed.products[key]) {
      console.warn(`  missing product ${key}`)
      continue
    }
    products[key] = buildProductBlock(products[key], parsed.products[key], key)
  }
}

function main() {
  const enPath = join(DICT_DIR, 'en.json')
  if (!existsSync(enPath)) throw new Error('dictionaries/en.json missing')

  for (const [locale, docxName] of Object.entries(NEW_LOCALES)) {
    const docx = join(DOC_DIR, docxName)
    if (!existsSync(docx)) {
      console.error(`SKIP ${locale}: missing ${docx}`)
      continue
    }

    const outPath = join(DICT_DIR, `${locale}.json`)
    copyFileSync(enPath, outPath)
    const data = JSON.parse(readFileSync(outPath, 'utf8')) as Record<string, unknown>
    const parsed = parseDoc(extractTxt(docx))

    console.log(
      locale,
      'products',
      Object.keys(parsed.products).length,
      'xcren benefits',
      parsed.products.xcrenHd?.benefits.length ?? 0,
      'variants',
      parsed.products.xcrenHd?.variants_raw.length ?? 0,
    )

    applyProducts(data, parsed)
    scrubClaims(data, parsed.about, locale)

    // LocaleSwitcher label stays English ("Language") until UI is translated
    const switcher = data.LocaleSwitcher as Record<string, string>
    switcher.label = 'Language'

    writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
    console.log('  wrote', outPath)
  }
}

main()
