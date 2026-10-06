import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const dir = 'content/faq/eshop'
for (const f of readdirSync(dir)
  .filter((x) => x.endsWith('.json') && x !== 'sl.json')
  .sort()) {
  const d = JSON.parse(readFileSync(join(dir, f), 'utf8')) as {
    categories?: { items?: { answer?: { type?: string }[] }[] }[]
  }
  const cats = d.categories?.length ?? 0
  const items = (d.categories || []).reduce(
    (n, c) => n + (c.items?.length || 0),
    0,
  )
  const raw = JSON.stringify(d)
  const tables = (raw.match(/"type":"table"/g) || []).length
  const firstAns = d.categories?.[1]?.items?.[0]?.answer?.[0]
  console.log(
    f.padEnd(10),
    'cats',
    cats,
    'items',
    String(items).padStart(2),
    'tables',
    tables,
    'sample',
    firstAns?.type || '?',
  )
}
