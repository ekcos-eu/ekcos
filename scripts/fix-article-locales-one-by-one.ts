/**
 * Re-translate + push article locales one-by-one (avoids aborting the whole batch).
 */
import {translate} from 'google-translate-api-x'
import {createClient} from '@sanity/client'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {homedir} from 'node:os'

const LOCALES = [
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

/** Spans that are only brand names + separators (comma, slash, spaces) */
const BRAND_LIST_ONLY =
  /^(?:(?:xcrën HD|xcrën Puck|xcrën puck|ëkcoscreen|powër screen|üro lite|Sealed Bristles Technology™|NON-PARA)[\s,/\-()]*)+$/i

function isBrandSpan(text: string): boolean {
  const t = text.trim()
  return BRAND_ONLY.test(t) || BRAND_LIST_ONLY.test(t)
}

function protect(text: string): string {
  let s = text
  for (const [re, token] of BRAND_TOKENS) s = s.replace(re, token)
  return s
}

function unprotect(text: string): string {
  let s = text
  for (const [re, rep] of UNPROTECT) s = s.replace(re, rep)
  for (const [re, rep] of BRAND_FIXES) s = s.replace(re, rep)
  return s.replace(/⟦[^⟧]*⟧/g, '')
}

function restoreEdgeWhitespace(original: string, translated: string): string {
  const lead = original.match(/^\s*/)?.[0] ?? ''
  const trail = original.match(/\s*$/)?.[0] ?? ''
  return lead + translated.trim() + trail
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

async function translateOne(text: string, to: string): Promise<string> {
  const guarded = protect(text)
  // Pure brand token(s) — never send to Google
  if (/^(__BRAND_[A-Z]+__[\s,/]*)+$/.test(guarded.trim()) || isBrandSpan(text)) {
    return unprotect(guarded)
  }
  let attempt = 0
  for (;;) {
    try {
      const result = await translate(guarded, {from: 'en', to})
      const translated = unprotect(
        (Array.isArray(result) ? result[0].text : result.text) as string,
      )
      // Soft failure: API returned English for a non-brand span
      if (
        text.trim().length >= 12 &&
        translated.trim() === text.trim() &&
        !isBrandSpan(text) &&
        !/^[\d.\s]+/.test(text.trim()) // keep "1. ..." if unchanged digits
      ) {
        throw new Error('still-english')
      }
      return translated
    } catch (err) {
      attempt++
      if (attempt >= 7) throw err
      await sleep(1500 * attempt)
    }
  }
}

async function translateTexts(texts: string[], to: string): Promise<string[]> {
  const out: string[] = []
  for (let i = 0; i < texts.length; i++) {
    out.push(await translateOne(texts[i]!, to))
    if (i % 5 === 4) await sleep(200)
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

function needsFix(joined: string, enJoined: string): string[] {
  const reasons: string[] = []
  if (joined.includes('For high-traffic toilets:')) reasons.push('english')
  if (/⟦|__BRAND_|TOITEEKRAAN|UROLIIT|ëkcosekraan|EKRAN ZASILANIA|TEHNÄYTTÖ|UROLIT[^e]|KÉPERNYŐ|MAITINIMO|TECLA DE ENERGIA/i.test(joined)) {
    reasons.push('tokens')
  }
  // Real jam: product name glued to letters/parens without space
  if (/xcrën HD[a-záčďéěíňóřšťúůýža-z]|ëkcoscreen[a-zá(]|powër screen[a-zá(]|üro lite[a-zá(-]/i.test(joined)) {
    reasons.push('jammed')
  }
  // Same as EN body (entirely untranslated)
  if (joined === enJoined) reasons.push('identical-en')
  return reasons
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

const only = process.argv.slice(2).filter((a) => LOCALES.includes(a as (typeof LOCALES)[number]))
const targets = only.length ? only : [...LOCALES]

const current = (await client.fetch(`*[_id==$id][0]{${LOCALES.join(',')}}`, {
  id: docId,
})) as Record<string, {title?: string; excerpt?: string; body?: Block[]; slug?: unknown; mainImage?: unknown} | undefined>

async function ensureDraft() {
  const published = await client.getDocument(docId)
  if (!published) throw new Error('published missing')
  if (!(await client.getDocument(draftId))) {
    const {_rev, ...rest} = published as Record<string, unknown> & {_rev?: string}
    await client.createOrReplace({...rest, _id: draftId, _type: 'post'})
  }
}

async function publishLocale(locale: string, localeObj: unknown) {
  await ensureDraft()
  await client.patch(draftId).set({[locale]: localeObj}).commit()
  const draft = await client.getDocument(draftId)
  if (!draft) throw new Error('draft missing')
  const {_id, _rev, ...rest} = draft as Record<string, unknown> & {_id: string; _rev?: string}
  await client.createOrReplace({...rest, _id: docId, _type: 'post'})
}

for (const locale of targets) {
  const joined = joinedBody(current[locale]?.body)
  const reasons = needsFix(joined, enJoined)
  if (!reasons.length && !only.length) {
    console.log(`ok ${locale}`)
    continue
  }
  console.log(`fix ${locale}${reasons.length ? ` (${reasons.join(',')})` : ''}…`)

  try {
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
      if (isBrandSpan(s.text)) {
        child.text = restoreEdgeWhitespace(s.text, s.text.trim())
        return
      }
      child.text = restoreEdgeWhitespace(s.text, translated[i] ?? s.text)
    })

    body.forEach((block, bi) => {
      const enBlock = en.body[bi]
      block.children?.forEach((child, ci) => {
        const enChild = enBlock?.children?.[ci]
        if (!enChild?.text) return
        if (enChild.text !== enChild.text.trim() && child.text === child.text.trim()) {
          child.text = restoreEdgeWhitespace(enChild.text, child.text)
        }
        for (const [re, rep] of BRAND_FIXES) child.text = child.text.replace(re, rep)
      })
    })

    const outJoined = joinedBody(body)
    const outReasons = needsFix(outJoined, enJoined)
    if (outReasons.includes('english') || outReasons.includes('identical-en')) {
      throw new Error(`still untranslated: ${outReasons.join(',')}`)
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

    await publishLocale(locale, localeObj)
    const b3 = body.find((b) => b._key === 'b3')
    console.log(`  ✓ ${locale}: ${localeObj.title}`)
    console.log(`    b3: ${(b3?.children ?? []).map((c) => c.text).join('')}`)
  } catch (err) {
    console.error(`  ✗ ${locale}:`, err)
  }

  await sleep(1000)
}

const verify = await client.fetch(
  `*[_id==$id][0]{
    "etB2": et.body[_key=="b2"][0].children[].text,
    "etB3": et.body[_key=="b3"][0].children[].text,
    "etB4": et.body[_key=="b4"][0].children[].text,
    "etB5": et.body[_key=="b5"][0].children[].text,
    "etP4": et.body[_key=="p4"][0].children[].text,
    "etP5": et.body[_key=="p5"][0].children[].text
  }`,
  {id: docId},
)
console.log('ET verify', JSON.stringify(verify, null, 2))
