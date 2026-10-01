/**
 * Re-translate article locale fields from EN with brand-safe placeholders,
 * preserve span edge whitespace, then push to Sanity.
 */
import {translate} from 'google-translate-api-x'
import {createClient} from '@sanity/client'
import {readFileSync, writeFileSync, mkdirSync, rmSync} from 'node:fs'
import {join} from 'node:path'
import {homedir} from 'node:os'

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

/** ASCII tokens Google Translate leaves alone */
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

/** Catch leftover mangled placeholders / mistranslated brand names */
const BRAND_FIXES: [RegExp, string][] = [
  [/⟦[^⟧]*⟧/g, ''], // strip any leftover unicode tokens — restored below by context if needed
  [/\[[A-ZÁÉÍÓÖŐÚÜŰÄÅÆØČĆĐŠŽŁĄĘŃÓŚŹŻ\s]+\]/g, ''], // strip leftover [TOKEN]
  [/ëkcosekraan/gi, 'ëkcoscreen'],
  [/ëkcoszaslon/gi, 'ëkcoscreen'],
  [/ëkcosekran/gi, 'ëkcoscreen'],
  [/ëkcosekrán/gi, 'ëkcoscreen'],
  [/ekcosekraan/gi, 'ëkcoscreen'],
  [/ekcosekran/gi, 'ëkcoscreen'],
]

function protect(text: string): string {
  let s = text
  for (const [re, token] of BRAND_TOKENS) s = s.replace(re, token)
  return s
}

function unprotect(text: string): string {
  let s = text
  for (const [re, rep] of UNPROTECT) s = s.replace(re, rep)
  for (const [re, rep] of BRAND_FIXES) {
    if (rep === '') {
      // only strip empty if it's clearly a broken token, not product content
      continue
    }
    s = s.replace(re, rep)
  }
  // strip leftover unicode/bracket brand tokens that failed to unprotect
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
  const protectedTexts = texts.map(protect)
  const out: string[] = []
  const chunkSize = 20
  for (let i = 0; i < protectedTexts.length; i += chunkSize) {
    const chunk = protectedTexts.slice(i, i + chunkSize)
    let attempt = 0
    for (;;) {
      try {
        const result = await translate(chunk, {from: 'en', to, forceBatch: true})
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
    await new Promise((r) => setTimeout(r, 250))
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

function findToken(): string | undefined {
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
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

const enPath = 'scripts/tmp/article-en.json'
const en = JSON.parse(readFileSync(enPath, 'utf8')) as {
  title: string
  excerpt: string
  slug: {_type: 'slug'; current: string}
  mainImage?: {_type: string; alt?: string; asset?: unknown}
  body: Block[]
}

const outDir = 'scripts/tmp/article-locales'
mkdirSync(outDir, {recursive: true})

const patch: Record<string, unknown> = {}

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
    if (!child) return
    const raw = translated[i] ?? s.text
    child.text = restoreEdgeWhitespace(s.text, raw)
  })

  // Final brand sweep on all spans
  body.forEach((block) => {
    block.children?.forEach((child) => {
      if (!child.text) return
      let t = child.text
      for (const [re, rep] of BRAND_FIXES) {
        if (rep) t = t.replace(re, rep)
      }
      t = t.replace(/⟦[^⟧]*⟧/g, '')
      // If a strong span became empty after stripping broken token, restore from EN marks context
      child.text = t
    })
  })

  // Recover product-name-only strong spans that were emptied / mangled
  const enBody = en.body
  body.forEach((block, bi) => {
    const enBlock = enBody[bi]
    block.children?.forEach((child, ci) => {
      const enChild = enBlock?.children?.[ci]
      if (!enChild) return
      const enText = enChild.text ?? ''
      const isBrandOnly =
        /^(xcrën HD|xcrën Puck|xcrën puck|ëkcoscreen|powër screen|üro lite|Sealed Bristles Technology™|NON-PARA)$/i.test(
          enText.trim(),
        )
      if (isBrandOnly) {
        const lead = enText.match(/^\s*/)?.[0] ?? ''
        const trail = enText.match(/\s*$/)?.[0] ?? ''
        child.text = lead + enText.trim() + trail
      }
      // Connector / punctuation-only spans that lost spaces: restore whitespace pattern from EN
      if (enText !== enText.trim() && child.text === child.text.trim()) {
        child.text = restoreEdgeWhitespace(enText, child.text)
      }
    })
  })

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

console.log('Pushing to Sanity…')
const published = await client.getDocument(docId)
if (!published) throw new Error('published missing')
const existingDraft = await client.getDocument(draftId)
if (!existingDraft) {
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
    "etB3": et.body[_key=="b3"][0].children[].text,
    "etB4": et.body[_key=="b4"][0].children[].text,
    "etB5": et.body[_key=="b5"][0].children[].text,
    "etP5": et.body[_key=="p5"][0].children[].text,
    "etB2": et.body[_key=="b2"][0].children[].text
  }`,
  {id: docId},
)
console.log('ET verify', JSON.stringify(check, null, 2))

rmSync(outDir, {recursive: true, force: true})
console.log('Done — Sanity updated, temp files removed.')
