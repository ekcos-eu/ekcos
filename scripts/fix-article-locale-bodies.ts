/**
 * Fix locales whose article body is still English; preserve brand names + span spaces.
 */
import {translate} from 'google-translate-api-x'
import {createClient} from '@sanity/client'
import {readFileSync, writeFileSync, mkdirSync, rmSync} from 'node:fs'
import {join} from 'node:path'
import {homedir} from 'node:os'

const ALL = [
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

type Span = {_type: 'span'; _key: string; text: string; marks?: string[]}
type Block = {
  _type: string
  _key: string
  children?: Span[]
  [k: string]: unknown
}

const BRAND_TOKENS: [RegExp, string][] = [
  [/Eco-One™/g, '__BRAND_ECOONE__'],
  [/EcoOne/g, '__BRAND_ECOONE__'],
  [/Eco-One/g, '__BRAND_ECOONE__'],
  [/Sealed Bristles Technology™/g, '__BRAND_SBT__'],
  [/Sealed Bristles Technology/g, '__BRAND_SBT__'],
  [/xcrën HD/g, '__BRAND_XCRENHD__'],
  [/xcrën Puck/gi, '__BRAND_XCRENPUCK__'],
  [/xcrën puck/g, '__BRAND_XCRENPUCK__'],
  [/ëkcoscreen/g, '__BRAND_EKCOSCREEN__'],
  [/powër screen/g, '__BRAND_POWERSCREEN__'],
  [/üro lite/g, '__BRAND_UROLITE__'],
  [/NON-PARA/g, '__BRAND_NONPARA__'],
  [/ëkcos/gi, '__BRAND_EKCOS__'],
]

const UNPROTECT: [RegExp, string][] = [
  [/__BRAND_ECOONE__/gi, 'Eco-One™'],
  [/__BRAND_SBT__/gi, 'Sealed Bristles Technology™'],
  [/__BRAND_XCRENHD__/gi, 'xcrën HD'],
  [/__BRAND_XCRENPUCK__/gi, 'xcrën puck'],
  [/__BRAND_EKCOSCREEN__/gi, 'ëkcoscreen'],
  [/__BRAND_POWERSCREEN__/gi, 'powër screen'],
  [/__BRAND_UROLITE__/gi, 'üro lite'],
  [/__BRAND_NONPARA__/gi, 'NON-PARA'],
  [/__BRAND_EKCOS__/gi, 'ëkcos'],
]

const BRAND_FIXES: [RegExp, string][] = [
  [/ëkcosekraan/gi, 'ëkcoscreen'],
  [/ëkcoszaslon/gi, 'ëkcoscreen'],
  [/ëkcosekran/gi, 'ëkcoscreen'],
  [/ëkcosekrán/gi, 'ëkcoscreen'],
  [/ekcosekraan/gi, 'ëkcoscreen'],
  [/ekcosekran/gi, 'ëkcoscreen'],
]

const BRAND_ONLY =
  /^(xcrën HD|xcrën Puck|xcrën puck|ëkcoscreen|powër screen|üro lite|Sealed Bristles Technology™|NON-PARA)$/i

function protect(text: string): string {
  let s = text
  for (const [re, token] of BRAND_TOKENS) s = s.replace(re, token)
  return s
}

function unprotect(text: string): string {
  let s = text
  for (const [re, rep] of UNPROTECT) s = s.replace(re, rep)
  for (const [re, rep] of BRAND_FIXES) s = s.replace(re, rep)
  s = s.replace(/⟦[^⟧]*⟧/g, '')
  return s
}

function restoreEdgeWhitespace(original: string, translated: string): string {
  const lead = original.match(/^\s*/)?.[0] ?? ''
  const trail = original.match(/\s*$/)?.[0] ?? ''
  return lead + translated.trim() + trail
}

async function translateTexts(texts: string[], to: string): Promise<string[]> {
  if (!texts.length) return []
  const out: string[] = []
  const chunkSize = 15
  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize).map(protect)
    let attempt = 0
    for (;;) {
      try {
        const result = await translate(chunk, {from: 'en', to, forceBatch: true})
        const arr = Array.isArray(result) ? result : [result]
        if (arr.length !== chunk.length) {
          throw new Error(`length mismatch ${arr.length} vs ${chunk.length}`)
        }
        for (const item of arr) out.push(unprotect(item.text))
        break
      } catch (err) {
        attempt++
        if (attempt >= 6) throw err
        console.warn(`  retry ${attempt} for ${to}:`, (err as Error).message ?? err)
        await new Promise((r) => setTimeout(r, 2000 * attempt))
      }
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  return out
}

function collectSpans(body: Block[]) {
  const items: {bi: number; ci: number; text: string}[] = []
  body.forEach((block, bi) => {
    block.children?.forEach((child, ci) => {
      if (child._type === 'span' && child.text?.trim()) {
        items.push({bi, ci, text: child.text})
      }
    })
  })
  return items
}

function joinedBody(body: Block[] | undefined): string {
  return (body ?? [])
    .flatMap((b) => (b.children ?? []).map((c) => c.text ?? ''))
    .join('')
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

const docId = 'a73f8673-8a93-4ce9-bc84-4d768a22773c'
const draftId = `drafts.${docId}`

const en = JSON.parse(readFileSync('scripts/tmp/article-en.json', 'utf8')) as {
  title: string
  excerpt: string
  slug: {_type: 'slug'; current: string}
  mainImage?: {_type: string; alt?: string; asset?: unknown}
  body: Block[]
}

const enJoined = joinedBody(en.body)
const fieldList = ALL.join(',')
const current = (await client.fetch(`*[_id==$id][0]{${fieldList}}`, {
  id: docId,
})) as Record<string, {title?: string; body?: Block[]} | undefined>

const needsFix: string[] = []
for (const loc of ALL) {
  const body = current[loc]?.body
  const joined = joinedBody(body)
  // Still English, or still has broken brand tokens
  const stillEn = joined.includes('For high-traffic toilets:')
  const broken =
    /⟦|TOITEEKRAAN|UROLIIT|ëkcosekraan|__BRAND_|EKRAN ZASILANIA|TEHNÄYTTÖ|UROLIT|KÉPERNYŐ|MAITINIMO/i.test(
      joined,
    )
  // Missing spaces between product spans (e.g. HDvõi)
  const jammed = /xcrën HD[a-z]|ëkcoscreen\(|powër screen\(|üro lite-/i.test(joined)
  if (stillEn || broken || jammed) {
    needsFix.push(loc)
    console.log(
      `fix ${loc}:`,
      stillEn ? 'english-body' : '',
      broken ? 'broken-tokens' : '',
      jammed ? 'jammed-spaces' : '',
    )
  } else {
    console.log(`ok ${loc}`)
  }
}

if (!needsFix.length) {
  console.log('Nothing to fix')
  process.exit(0)
}

const outDir = 'scripts/tmp/article-locales'
mkdirSync(outDir, {recursive: true})
const patch: Record<string, unknown> = {}

for (const locale of needsFix) {
  console.log(`Translating ${locale}…`)
  const [title, excerpt, alt] = await translateTexts(
    [en.title, en.excerpt, en.mainImage?.alt || ''],
    locale,
  )
  // Reject English fallback for title
  if (title.trim() === en.title.trim()) {
    console.warn(`  warning: title still English for ${locale}, retrying once…`)
    await new Promise((r) => setTimeout(r, 3000))
  }

  const body = structuredClone(en.body) as Block[]
  const spans = collectSpans(body)
  let translated = await translateTexts(
    spans.map((s) => s.text),
    locale,
  )

  // If body still looks English, retry whole body once
  const probe = translated.find((_, i) => spans[i]?.text.includes('For high-traffic'))
  if (probe && probe.includes('For high-traffic')) {
    console.warn(`  body still English for ${locale}, full retry…`)
    await new Promise((r) => setTimeout(r, 4000))
    translated = await translateTexts(
      spans.map((s) => s.text),
      locale,
    )
  }

  spans.forEach((s, i) => {
    const child = body[s.bi]?.children?.[s.ci]
    if (!child) return
    const enText = s.text
    if (BRAND_ONLY.test(enText.trim())) {
      child.text = restoreEdgeWhitespace(enText, enText.trim())
      return
    }
    child.text = restoreEdgeWhitespace(enText, translated[i] ?? enText)
  })

  // Ensure connector/punctuation spans keep EN whitespace
  body.forEach((block, bi) => {
    const enBlock = en.body[bi]
    block.children?.forEach((child, ci) => {
      const enChild = enBlock?.children?.[ci]
      if (!enChild?.text) return
      if (enChild.text !== enChild.text.trim() && child.text === child.text.trim()) {
        child.text = restoreEdgeWhitespace(enChild.text, child.text)
      }
      for (const [re, rep] of BRAND_FIXES) {
        child.text = child.text.replace(re, rep)
      }
    })
  })

  const joined = joinedBody(body)
  if (joined.includes('For high-traffic toilets:')) {
    throw new Error(`${locale} body still English after retry — aborting`)
  }

  const localeObj = {
    title: title.trim(),
    excerpt: excerpt.trim(),
    slug: {_type: 'slug' as const, current: en.slug.current},
    mainImage: {
      ...en.mainImage,
      alt: (alt || en.mainImage?.alt || '').trim(),
    },
    body,
  }
  writeFileSync(join(outDir, `${locale}.json`), JSON.stringify(localeObj))
  patch[locale] = localeObj
  console.log(`  ${locale}: ${localeObj.title}`)
  // sample b3
  const b3 = body.find((b) => b._key === 'b3')
  console.log('  b3:', (b3?.children ?? []).map((c) => c.text).join(''))
}

console.log('Pushing to Sanity…')
const published = await client.getDocument(docId)
if (!published) throw new Error('published missing')
if (!(await client.getDocument(draftId))) {
  const {_rev, ...rest} = published as Record<string, unknown> & {_rev?: string}
  await client.createOrReplace({...rest, _id: draftId, _type: 'post'})
}
await client.patch(draftId).set(patch).commit()
const draft = await client.getDocument(draftId)
if (!draft) throw new Error('draft missing')
const {_id, _rev, ...rest} = draft as Record<string, unknown> & {_id: string; _rev?: string}
await client.createOrReplace({...rest, _id: docId, _type: 'post'})

const check = await client.fetch(
  `*[_id==$id][0]{
    "etB2": et.body[_key=="b2"][0].children[].text,
    "etB3": et.body[_key=="b3"][0].children[].text,
    "etB4": et.body[_key=="b4"][0].children[].text,
    "etB5": et.body[_key=="b5"][0].children[].text,
    "etP4": et.body[_key=="p4"][0].children[].text,
    "etP5": et.body[_key=="p5"][0].children[].text,
    "nlB3": nl.body[_key=="b3"][0].children[].text,
    "fiB3": fi.body[_key=="b3"][0].children[].text
  }`,
  {id: docId},
)
console.log(JSON.stringify(check, null, 2))

rmSync(outDir, {recursive: true, force: true})
console.log('Done')
