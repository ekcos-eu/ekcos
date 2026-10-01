/**
 * Rewrite article ecology section to EU green-claims compliant wording
 * and push to Sanity for every locale.
 */
import {translate} from 'google-translate-api-x'
import {createClient} from '@sanity/client'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {homedir} from 'node:os'
import {locales} from '../i18n/locales'

const DOC_ID = 'a73f8673-8a93-4ce9-bc84-4d768a22773c'
const DRAFT_ID = `drafts.${DOC_ID}`

/** Compliant EN replacements keyed by block _key → full children texts (single-span blocks). */
const EN_REPLACEMENTS: Record<string, string> = {
  'h2-4': '4. Recycled materials and landfill biodegradation',
  p7: 'If material choice matters for your organisation, check recycled content and end-of-life behaviour. A used urinal screen is biologically contaminated, so it typically cannot be recycled and ends up in landfill or incineration.',
  p8: 'ëkcos urinal screens are made with recycled EVA and the Eco-One™ additive for landfill biodegradation:',
  b10: 'Made with recycled EVA',
  b11:
    'The EVA material itself can be recycled; a used urinal screen cannot, because it is biologically contaminated',
  b12:
    'Biodegradable in landfill with Eco-One™ — in an independent ASTM D5511 / ISO 15985 lab test, ëkcos EVA with Eco-One™ reached 93% biodegradation within about 3.5 years; up to 99% is projected within 5 years',
  b13: 'Product boxes are made from 100% recycled cardboard',
  b14: 'Compatible with waterless urinals',
  p10: 'Investing in the right urinal screen pays off through reduced cleaning costs, improved hygiene perception, and more satisfied restroom visitors - who will not leave with bacteria from previous users on their trousers. The choice is not just about fragrance - consider traffic frequency, hygiene needs, urinal type, and material end-of-life.',
}

const EN_EXCERPT =
  'A practical guide to choosing the right urinal screen for restaurants, gas stations, and public facilities - covering traffic, splash protection, fragrance, recycled materials, and urinal type.'

/** Hand-tuned CS (aligned with dictionaries/cs.json Eco-One™ wording). */
const CS_REPLACEMENTS: Record<string, string> = {
  'h2-4': '4. Recyklované materiály a biologický rozklad na skládce',
  p7: 'Pokud pro vaši organizaci hraje roli volba materiálu, sledujte podíl recyklátu a chování výrobku na konci životnosti. Použité sítko do pisoáru je biologicky kontaminované, takže se obvykle nedá recyklovat a končí na skládce nebo ve spalovně.',
  p8: 'Sítka ëkcos vyrábíme s podílem recyklovaného EVA a s přísadou Eco-One™ pro biologický rozklad na skládce:',
  b10: 'Vyrobeno s podílem recyklovaného EVA',
  b11:
    'Samotný materiál EVA lze recyklovat; použité sítko do pisoáru ne, protože je biologicky kontaminované',
  b12:
    'Biologicky rozložitelné na skládce s Eco-One™ — v nezávislém laboratorním testu ASTM D5511 / ISO 15985 dosáhlo EVA ëkcos s Eco-One™ asi 93% biologického rozkladu za přibližně 3,5 roku; do 5 let se předpokládá až 99 %',
  b13: 'Krabice výrobků jsou ze 100% recyklované lepenky',
  b14: 'Kompatibilní s bezvodými pisoáry',
  p10: 'Investice do správného sítka do pisoáru se vyplatí nižšími náklady na úklid, lepším vnímáním hygieny a spokojenějšími návštěvníky toalet — kteří neodcházejí s bakteriemi od předchozích uživatelů na kalhotách. Volba není jen o vůni — zvažte frekvenci provozu, hygienické potřeby, typ pisoáru a konec životnosti materiálu.',
}

const CS_EXCERPT =
  'Praktický průvodce výběrem správného sítka do pisoáru pro restaurace, čerpací stanice a veřejné objekty — frekvence provozu, ochrana proti odstřikům, vůně, recyklované materiály a typ pisoáru.'

type Span = {_type: 'span'; _key: string; text: string; marks?: string[]}
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

type LocaleDoc = {
  title?: string
  excerpt?: string
  slug?: {_type: 'slug'; current: string}
  mainImage?: unknown
  body?: Block[]
}

function findToken(): string | undefined {
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN
  try {
    const cfg = JSON.parse(
      readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8'),
    ) as Record<string, unknown>
    if (typeof cfg.authToken === 'string') return cfg.authToken
  } catch {
    /* ignore */
  }
  return undefined
}

function protect(text: string): string {
  return text
    .replace(/Eco-One™/g, '__BRAND_ECOONE__')
    .replace(/Eco-One/g, '__BRAND_ECOONE__')
    .replace(/ASTM D5511/g, '__STD_ASTM__')
    .replace(/ISO 15985/g, '__STD_ISO__')
    .replace(/ëkcos/gi, '__BRAND_EKCOS__')
    .replace(/EVA/g, '__MAT_EVA__')
}

function unprotect(text: string): string {
  return text
    .replace(/__BRAND_ECOONE__/gi, 'Eco-One™')
    .replace(/__STD_ASTM__/gi, 'ASTM D5511')
    .replace(/__STD_ISO__/gi, 'ISO 15985')
    .replace(/__BRAND_EKCOS__/gi, 'ëkcos')
    .replace(/__MAT_EVA__/gi, 'EVA')
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

async function translateOne(text: string, to: string): Promise<string> {
  const guarded = protect(text)
  let attempt = 0
  for (;;) {
    try {
      const result = await translate(guarded, {from: 'en', to})
      const out = unprotect(
        (Array.isArray(result) ? result[0].text : result.text) as string,
      )
      if (text.trim().length >= 20 && out.trim() === text.trim()) {
        throw new Error('still-english')
      }
      return out
    } catch (err) {
      attempt++
      if (attempt >= 6) throw err
      await sleep(1200 * attempt)
    }
  }
}

function setBlockText(body: Block[], key: string, text: string): void {
  const block = body.find((b) => b._key === key)
  if (!block?.children?.length) {
    throw new Error(`Missing block ${key}`)
  }
  // Ecology blocks in this article are single-span; keep marks from first span.
  const first = block.children[0]!
  block.children = [
    {
      _type: 'span',
      _key: first._key,
      marks: first.marks ?? [],
      text,
    },
  ]
}

function applyReplacements(body: Block[], map: Record<string, string>): Block[] {
  const next = structuredClone(body) as Block[]
  for (const [key, text] of Object.entries(map)) {
    setBlockText(next, key, text)
  }
  return next
}

const BANNED =
  /eco-friendly|environmentally friendly|100%\s*recyclable|the only ones|EcoOne(?!™)|high percentage of recycled|saving potable water|renewable,\s*biodegradable|sustainability(?!\s+report)/i

const token = findToken()
if (!token) {
  console.error('NO_TOKEN')
  process.exit(2)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-02-02',
  token,
  useCdn: false,
})

const fieldList = locales.join(',')
const doc = (await client.fetch(`*[_id==$id][0]{${fieldList}}`, {
  id: DOC_ID,
})) as Record<string, LocaleDoc | undefined>

if (!doc.en?.body) throw new Error('EN body missing')

// Pre-translate shared strings once per target locale (from EN replacements + excerpt)
const translateCache = new Map<string, Record<string, string>>()

async function translationsFor(locale: string): Promise<Record<string, string>> {
  if (locale === 'en') return EN_REPLACEMENTS
  if (locale === 'cs') return CS_REPLACEMENTS
  const cached = translateCache.get(locale)
  if (cached) return cached

  console.log(`Translating ecology strings → ${locale}…`)
  const out: Record<string, string> = {}
  for (const [key, enText] of Object.entries(EN_REPLACEMENTS)) {
    out[key] = await translateOne(enText, locale)
    await sleep(150)
  }
  translateCache.set(locale, out)
  return out
}

async function excerptFor(locale: string): Promise<string> {
  if (locale === 'en') return EN_EXCERPT
  if (locale === 'cs') return CS_EXCERPT
  return translateOne(EN_EXCERPT, locale)
}

async function ensureDraft() {
  const published = await client.getDocument(DOC_ID)
  if (!published) throw new Error('published missing')
  if (!(await client.getDocument(DRAFT_ID))) {
    const {_rev, ...rest} = published as Record<string, unknown> & {_rev?: string}
    await client.createOrReplace({...rest, _id: DRAFT_ID, _type: 'post'})
  }
}

async function publishPatch(patch: Record<string, unknown>) {
  await ensureDraft()
  await client.patch(DRAFT_ID).set(patch).commit()
  const draft = await client.getDocument(DRAFT_ID)
  if (!draft) throw new Error('draft missing')
  const {_id, _rev, ...rest} = draft as Record<string, unknown> & {
    _id: string
    _rev?: string
  }
  await client.createOrReplace({...rest, _id: DOC_ID, _type: 'post'})
}

const failures: string[] = []

for (const locale of locales) {
  const current = doc[locale]
  if (!current?.body?.length) {
    console.warn(`skip ${locale}: no body`)
    continue
  }

  try {
    const map = await translationsFor(locale)
    const excerpt = await excerptFor(locale)
    const body = applyReplacements(current.body, map)

    const joined = body
      .filter((b) => Object.keys(EN_REPLACEMENTS).includes(b._key))
      .flatMap((b) => (b.children ?? []).map((c) => c.text))
      .join('\n')

    if (BANNED.test(joined)) {
      throw new Error(`banned phrase remains: ${joined.match(BANNED)?.[0]}`)
    }
    if (!/Eco-One™/.test(joined)) {
      throw new Error('Eco-One™ missing from ecology section')
    }
    if (/100%\s*recyclable/i.test(joined)) {
      throw new Error('100% recyclable still present')
    }

    const localeObj: LocaleDoc = {
      ...current,
      excerpt,
      body,
    }

    await publishPatch({[locale]: localeObj})
    console.log(`✓ ${locale}`)
    await sleep(400)
  } catch (err) {
    console.error(`✗ ${locale}:`, err)
    failures.push(locale)
  }
}

const verify = await client.fetch(
  `*[_id==$id][0]{
    "enH": en.body[_key=="h2-4"][0].children[0].text,
    "enB11": en.body[_key=="b11"][0].children[0].text,
    "enB12": en.body[_key=="b12"][0].children[0].text,
    "csH": cs.body[_key=="h2-4"][0].children[0].text,
    "csB11": cs.body[_key=="b11"][0].children[0].text,
    "etB11": et.body[_key=="b11"][0].children[0].text,
    "deB12": de.body[_key=="b12"][0].children[0].text,
    "enExcerpt": en.excerpt
  }`,
  {id: DOC_ID},
)
console.log(JSON.stringify(verify, null, 2))

if (failures.length) {
  console.error('Failed locales:', failures.join(', '))
  process.exit(1)
}
console.log('All locales updated.')
