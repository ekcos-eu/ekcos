/**
 * Translate Sanity post locale fields from English into missing site locales
 * and write them back to Sanity.
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local
 * (Editor or Admin token from sanity.io/manage → API → Tokens).
 *
 * Usage: bun scripts/sync-article-locales-to-sanity.ts
 */
import {createClient} from '@sanity/client'
import {translate} from 'google-translate-api-x'
import {locales, type AppLocale} from '../i18n/locales'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error(
    'Missing SANITY_API_WRITE_TOKEN.\n' +
      'Create a token with Editor rights at https://www.sanity.io/manage → API → Tokens,\n' +
      'then add to .env.local:\n' +
      'SANITY_API_WRITE_TOKEN=sk...',
  )
  process.exit(1)
}

const EXISTING = new Set(['en', 'cs', 'de', 'fr', 'it', 'es'])
const TARGETS = locales.filter((l) => !EXISTING.has(l)) as AppLocale[]

const GT: Record<string, string> = Object.fromEntries(
  TARGETS.map((l) => [l, l]),
)

type Span = {_type: 'span'; _key: string; text: string; marks?: string[]}
type Block = {
  _type: string
  _key: string
  children?: Span[]
  style?: string
  listItem?: string
  level?: number
  markDefs?: unknown[]
  [key: string]: unknown
}

type LocaleContent = {
  title?: string
  excerpt?: string
  slug?: {_type: 'slug'; current: string}
  mainImage?: unknown
  body?: Block[]
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-02-02',
  token,
  useCdn: false,
})

function protect(text: string): string {
  return text
    .replace(/Eco-One™/g, '⟦ECOONE⟧')
    .replace(/Eco-One/g, '⟦ECOONE⟧')
    .replace(/ëkcos/gi, '⟦EKCOS⟧')
    .replace(/Sealed Bristles Technology™/g, '⟦SBT⟧')
}

function unprotect(text: string): string {
  return text
    .replace(/⟦ECOONE⟧/g, 'Eco-One™')
    .replace(/⟦EKCOS⟧/gi, 'ëkcos')
    .replace(/⟦SBT⟧/g, 'Sealed Bristles Technology™')
}

async function translateTexts(texts: string[], to: string): Promise<string[]> {
  if (texts.length === 0) return []
  const protectedTexts = texts.map(protect)
  const out: string[] = []
  const chunkSize = 30
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
        attempt += 1
        if (attempt >= 5) throw err
        await new Promise((r) => setTimeout(r, 1500 * attempt))
      }
    }
    await new Promise((r) => setTimeout(r, 350))
  }
  return out
}

function collectSpanTexts(body: Block[]): {blockIdx: number; childIdx: number; text: string}[] {
  const items: {blockIdx: number; childIdx: number; text: string}[] = []
  body.forEach((block, bi) => {
    block.children?.forEach((child, ci) => {
      if (child._type === 'span' && child.text?.trim()) {
        items.push({blockIdx: bi, childIdx: ci, text: child.text})
      }
    })
  })
  return items
}

function applySpanTexts(
  body: Block[],
  items: {blockIdx: number; childIdx: number; text: string}[],
  translated: string[],
): Block[] {
  const clone = structuredClone(body) as Block[]
  items.forEach((item, i) => {
    const child = clone[item.blockIdx]?.children?.[item.childIdx]
    if (child) child.text = translated[i] ?? item.text
  })
  return clone
}

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

async function translateLocale(
  en: LocaleContent,
  locale: AppLocale,
): Promise<LocaleContent> {
  const to = GT[locale] ?? locale
  const meta = [en.title ?? '', en.excerpt ?? '', (en.mainImage as {alt?: string})?.alt ?? '']
  const [title, excerpt, alt] = await translateTexts(meta, to)

  const body = (en.body ?? []) as Block[]
  const spans = collectSpanTexts(body)
  const translatedSpans = await translateTexts(
    spans.map((s) => s.text),
    to,
  )
  const newBody = applySpanTexts(body, spans, translatedSpans)

  // Keep English slug for stable URLs across locales (hreflang / shared links)
  const slugCurrent = en.slug?.current ?? slugify(title || 'article')

  const image = en.mainImage
    ? structuredClone(en.mainImage)
    : undefined
  if (image && typeof image === 'object' && alt) {
    ;(image as {alt?: string}).alt = alt
  }

  return {
    title,
    excerpt,
    slug: {_type: 'slug', current: slugCurrent},
    mainImage: image,
    body: newBody,
  }
}

async function main() {
  const posts = await client.fetch<
    Array<{_id: string; _rev: string; en: LocaleContent} & Record<string, LocaleContent | undefined>>
  >(`*[_type == "post"]{_id, _rev, en, ${TARGETS.join(', ')}}`)

  console.log(`Found ${posts.length} post(s). Targets: ${TARGETS.join(', ')}`)

  for (const post of posts) {
    if (!post.en?.title || !post.en?.body?.length) {
      console.warn(`Skip ${post._id}: missing English content`)
      continue
    }

    const patch: Record<string, LocaleContent> = {}
    for (const locale of TARGETS) {
      const existing = post[locale]
      if (existing?.title && existing?.body?.length) {
        console.log(`  ${locale}: already present, skip`)
        continue
      }
      console.log(`  ${locale}: translating…`)
      patch[locale] = await translateLocale(post.en, locale)
    }

    if (Object.keys(patch).length === 0) {
      console.log(`No updates for ${post._id}`)
      continue
    }

    // Write draft then publish
    const draftId = post._id.startsWith('drafts.') ? post._id : `drafts.${post._id}`
    const publishedId = post._id.replace(/^drafts\./, '')

    await client
      .transaction()
      .createIfNotExists({_id: draftId, _type: 'post'})
      .patch(draftId, (p) => p.set(patch))
      .commit({visibility: 'async'})

    // Publish: copy draft → published
    const draft = await client.getDocument(draftId)
    if (draft) {
      const {_id: _ignore, _rev: _r, ...rest} = draft as Record<string, unknown> & {
        _id: string
        _rev?: string
      }
      await client.createOrReplace({...rest, _id: publishedId, _type: 'post'})
    }

    console.log(`Updated + published ${publishedId} (${Object.keys(patch).join(', ')})`)
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
