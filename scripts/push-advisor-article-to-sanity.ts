/**
 * Push advisor article locale content (from PDF-aligned JSON) to Sanity.
 *
 * Source: scripts/tmp/advisor-content/{locale}.json
 * Doc: how-to-choose-the-right-urinal-screen
 *
 * Auth: SANITY_API_WRITE_TOKEN or Sanity CLI authToken.
 * Env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET (.env.local)
 *
 * Usage: bun scripts/push-advisor-article-to-sanity.ts
 */
import {createClient} from '@sanity/client'
import {readFileSync, readdirSync, existsSync} from 'node:fs'
import {join} from 'node:path'
import {homedir} from 'node:os'

const DOC_ID = 'a73f8673-8a93-4ce9-bc84-4d768a22773c'
const DRAFT_ID = `drafts.${DOC_ID}`
const SLUG = 'how-to-choose-the-right-urinal-screen'
const CONTENT_DIR = 'scripts/tmp/advisor-content'

function loadEnvLocal(): void {
  const path = '.env.local'
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    let val = line.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

function findToken(): string | undefined {
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  try {
    const cfg = JSON.parse(
      readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8'),
    ) as Record<string, unknown>
    if (typeof cfg.authToken === 'string') return cfg.authToken
    if (typeof cfg.token === 'string') return cfg.token
  } catch {
    /* ignore */
  }
  return undefined
}

type LocalePayload = {
  title: string
  excerpt: string
  imageAlt: string
  body: unknown[]
}

type LocaleDoc = {
  title: string
  excerpt: string
  slug: {_type: 'slug'; current: string}
  mainImage?: {
    _type: 'image'
    alt?: string
    asset?: {_type: 'reference'; _ref: string}
  }
  body: unknown[]
}

loadEnvLocal()

const token = findToken()
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

if (!token) {
  console.error('NO_TOKEN: set SANITY_API_WRITE_TOKEN or login via Sanity CLI')
  process.exit(2)
}
if (!projectId || !dataset) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-02-02',
  token,
  useCdn: false,
})

const locales = readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace('.json', ''))
  .sort()

if (locales.length === 0) {
  console.error(`No JSON files in ${CONTENT_DIR}`)
  process.exit(1)
}

const published = await client.getDocument(DOC_ID)
if (!published) throw new Error(`published doc missing: ${DOC_ID}`)

const publishedLocales = published as Record<string, unknown>
const fallbackImage =
  (publishedLocales.en as {mainImage?: LocaleDoc['mainImage']} | undefined)
    ?.mainImage ?? undefined

const patch: Record<string, LocaleDoc> = {}

for (const locale of locales) {
  const raw = JSON.parse(
    readFileSync(join(CONTENT_DIR, `${locale}.json`), 'utf8'),
  ) as LocalePayload

  const existing = publishedLocales[locale] as
    | {mainImage?: LocaleDoc['mainImage']; slug?: {_type: 'slug'; current: string}}
    | undefined

  const assetRef =
    existing?.mainImage?.asset?._ref ?? fallbackImage?.asset?._ref

  const mainImage: LocaleDoc['mainImage'] = assetRef
    ? {
        _type: 'image',
        alt: raw.imageAlt,
        asset: {_type: 'reference', _ref: assetRef},
      }
    : undefined

  patch[locale] = {
    title: raw.title,
    excerpt: raw.excerpt,
    slug: {_type: 'slug', current: existing?.slug?.current ?? SLUG},
    ...(mainImage ? {mainImage} : {}),
    body: raw.body,
  }
}

console.log(`Patching ${locales.length} locales into draft…`)

const existingDraft = await client.getDocument(DRAFT_ID)
if (!existingDraft) {
  const {_rev, ...rest} = published as Record<string, unknown> & {_rev?: string}
  await client.createOrReplace({...rest, _id: DRAFT_ID, _type: 'post'})
}

await client.patch(DRAFT_ID).set(patch).commit()
console.log('Draft patched')

const draft = await client.getDocument(DRAFT_ID)
if (!draft) throw new Error('draft missing after patch')
const {_id, _rev, ...rest} = draft as Record<string, unknown> & {
  _id: string
  _rev?: string
}
await client.createOrReplace({...rest, _id: DOC_ID, _type: 'post'})
console.log('Published', DOC_ID)

const check = await client.fetch(
  `*[_id==$id][0]{
    "enTitle": en.title,
    "csTitle": cs.title,
    "deTitle": de.title,
    "enBlocks": count(en.body),
    "csBlocks": count(cs.body),
    "slBlocks": count(sl.body),
    "ltBlocks": count(lt.body),
    "enExcerpt": en.excerpt,
    "csExcerpt": cs.excerpt
  }`,
  {id: DOC_ID},
)
console.log('verify', check)
