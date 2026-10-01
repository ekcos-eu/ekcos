/**
 * Push translated article locale fields to Sanity (source of truth).
 * Auth: SANITY_API_WRITE_TOKEN or Sanity CLI authToken.
 */
import {createClient} from '@sanity/client'
import {readFileSync, readdirSync, rmSync} from 'node:fs'
import {join} from 'node:path'
import {homedir} from 'node:os'

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

const BRAND_FIXES: [RegExp, string][] = [
  [/ëkcoszaslon/gi, 'ëkcoscreen'],
  [/ëkcosekran/gi, 'ëkcoscreen'],
  [/ëkcosekran/gi, 'ëkcoscreen'],
]

function fixBrands(obj: unknown): unknown {
  if (typeof obj === 'string') {
    let s = obj
    for (const [re, rep] of BRAND_FIXES) s = s.replace(re, rep)
    return s
  }
  if (Array.isArray(obj)) return obj.map(fixBrands)
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = fixBrands(v)
    }
    return out
  }
  return obj
}

const token = findToken()
if (!token) {
  console.error('NO_TOKEN: set SANITY_API_WRITE_TOKEN or login via Sanity CLI')
  process.exit(2)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-02-02',
  token,
  useCdn: false,
})

const dir = 'scripts/tmp/article-locales'
const locales = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace('.json', ''))

const docId = 'a73f8673-8a93-4ce9-bc84-4d768a22773c'
const draftId = `drafts.${docId}`

const patch: Record<string, unknown> = {}
for (const locale of locales) {
  const raw = JSON.parse(readFileSync(join(dir, `${locale}.json`), 'utf8'))
  patch[locale] = fixBrands(raw)
}

console.log(`Patching ${locales.length} locales into draft…`)

const published = await client.getDocument(docId)
if (!published) throw new Error('published doc missing')

const existingDraft = await client.getDocument(draftId)
if (!existingDraft) {
  const {_rev, ...rest} = published as Record<string, unknown> & {_rev?: string}
  await client.createOrReplace({...rest, _id: draftId, _type: 'post'})
}

await client.patch(draftId).set(patch).commit()
console.log('Draft patched')

const draft = await client.getDocument(draftId)
if (!draft) throw new Error('draft missing after patch')
const {_id, _rev, ...rest} = draft as Record<string, unknown> & {
  _id: string
  _rev?: string
}
await client.createOrReplace({...rest, _id: docId, _type: 'post'})
console.log('Published', docId)

const check = await client.fetch(
  `*[_id==$id][0]{
    "hrTitle": hr.title,
    "skTitle": sk.title,
    "plTitle": pl.title,
    "hrBlocks": count(hr.body),
    "skBlocks": count(sk.body),
    "nlBlocks": count(nl.body)
  }`,
  {id: docId},
)
console.log('verify', check)

// Remove ephemeral translation cache — Sanity is source of truth
rmSync(dir, {recursive: true, force: true})
rmSync('scripts/tmp/article-en.json', {force: true})
console.log('Removed local temp translation files')
