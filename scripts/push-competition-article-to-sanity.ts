/**
 * Create/publish the comparison guide article from PDF-aligned JSON.
 *
 * Source: scripts/tmp/competition-content/{locale}.json
 * Slug: ekcos-vs-other-suppliers
 *
 * Auth: SANITY_API_WRITE_TOKEN or Sanity CLI authToken.
 * Env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET (.env.local)
 *
 * Usage:
 *   bun scripts/push-competition-article-to-sanity.ts
 *   bun scripts/push-competition-article-to-sanity.ts --image scripts/tmp/competition-images/page1-000.jpg
 */
import {createClient} from '@sanity/client'
import {createReadStream, existsSync, readFileSync, readdirSync} from 'node:fs'
import {basename, join} from 'node:path'
import {homedir} from 'node:os'
import {randomUUID} from 'node:crypto'

const SLUG = 'ekcos-vs-other-suppliers'
const CONTENT_DIR = 'scripts/tmp/competition-content'
const CATEGORY = 'guide'
const PUBLISHED_AT = '2026-10-08T10:00:00.000Z'

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

const imageArgIdx = process.argv.indexOf('--image')
const imagePath =
  imageArgIdx >= 0 ? process.argv[imageArgIdx + 1] : undefined

const locales = readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace('.json', ''))
  .sort()

if (locales.length === 0) {
  console.error(`No JSON files in ${CONTENT_DIR}`)
  process.exit(1)
}

const existing = await client.fetch<{_id: string} | null>(
  `*[_type == "post" && en.slug.current == $slug][0]{_id}`,
  {slug: SLUG},
)

const DOC_ID = existing?._id ?? randomUUID()
const DRAFT_ID = `drafts.${DOC_ID}`

console.log(`Document id: ${DOC_ID}${existing ? ' (existing)' : ' (new)'}`)

let assetRef: string | undefined

if (existing) {
  const published = await client.getDocument(DOC_ID)
  assetRef = (
    published as {en?: {mainImage?: {asset?: {_ref?: string}}}} | null
  )?.en?.mainImage?.asset?._ref
}

if (imagePath) {
  if (!existsSync(imagePath)) {
    console.error(`Image not found: ${imagePath}`)
    process.exit(1)
  }
  console.log(`Uploading image ${imagePath}…`)
  const asset = await client.assets.upload('image', createReadStream(imagePath), {
    filename: basename(imagePath),
  })
  assetRef = asset._id
  console.log('Uploaded', assetRef)
}

if (!assetRef) {
  // Fall back to existing advisor product photo if no cover provided
  assetRef = 'image-3699456590f9ca86dfff8e1bfab387e6aedbc818-1342x1401-jpg'
  console.log('Using fallback image', assetRef)
}

const localeFields: Record<string, LocaleDoc> = {}

for (const locale of locales) {
  const raw = JSON.parse(
    readFileSync(join(CONTENT_DIR, `${locale}.json`), 'utf8'),
  ) as LocalePayload

  localeFields[locale] = {
    title: raw.title,
    excerpt: raw.excerpt,
    slug: {_type: 'slug', current: SLUG},
    mainImage: {
      _type: 'image',
      alt: raw.imageAlt,
      asset: {_type: 'reference', _ref: assetRef},
    },
    body: raw.body,
  }
}

const doc = {
  _type: 'post',
  publishedAt: PUBLISHED_AT,
  category: CATEGORY,
  ...localeFields,
}

console.log(`Writing ${locales.length} locales to draft…`)
await client.createOrReplace({...doc, _id: DRAFT_ID})
console.log('Draft saved')

await client.createOrReplace({...doc, _id: DOC_ID})
console.log('Published', DOC_ID)

const check = await client.fetch(
  `*[_id==$id][0]{
    publishedAt,
    category,
    "enTitle": en.title,
    "csTitle": cs.title,
    "deTitle": de.title,
    "slTitle": sl.title,
    "enSlug": en.slug.current,
    "enBlocks": count(en.body),
    "csBlocks": count(cs.body),
    "slBlocks": count(sl.body),
    "ltBlocks": count(lt.body),
    "localeTitles": count([en,cs,sk,de,pl,fr,es,it,nl,pt,sv,da,fi,el,hu,ro,bg,hr,sl,et,lv,lt][defined(title)]),
    "enExcerpt": en.excerpt,
    "csExcerpt": cs.excerpt,
    "image": en.mainImage.asset->_id
  }`,
  {id: DOC_ID},
)
console.log('verify', check)
