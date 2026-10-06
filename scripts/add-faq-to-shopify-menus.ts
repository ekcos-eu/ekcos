/**
 * Add FAQ page to Shopify main / footer menus if missing.
 *
 *   bun scripts/add-faq-to-shopify-menus.ts
 *   bun scripts/add-faq-to-shopify-menus.ts --dry-run
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const MCP = join(ROOT, '.cursor/mcp.json')
const API = '2025-01'
const DRY = process.argv.includes('--dry-run')

type MenuItem = {
  id: string
  title: string
  type: string
  url?: string | null
  resourceId?: string | null
  items?: MenuItem[]
}

type Menu = {
  id: string
  handle: string
  title: string
  items: MenuItem[]
}

function loadCreds() {
  const cfg = JSON.parse(readFileSync(MCP, 'utf8')) as {
    mcpServers: { shopify: { args: string[] } }
  }
  const args = cfg.mcpServers.shopify.args
  const after = (f: string) => args[args.indexOf(f) + 1]
  return {
    clientId: after('--clientId'),
    clientSecret: after('--clientSecret'),
    domain: after('--domain'),
  }
}

async function getToken(creds: ReturnType<typeof loadCreds>) {
  const res = await fetch(`https://${creds.domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    }),
  })
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error(JSON.stringify(data))
  return data.access_token
}

async function gql<T>(
  domain: string,
  token: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`https://${domain}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = (await res.json()) as { data?: T; errors?: unknown }
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  if (!json.data) throw new Error('No data')
  return json.data
}

function toUpdateInput(item: MenuItem): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: item.id,
    title: item.title,
    type: item.type,
  }
  if (item.url) out.url = item.url
  if (item.resourceId) out.resourceId = item.resourceId
  if (item.items?.length) out.items = item.items.map(toUpdateInput)
  return out
}

function hasFaq(items: MenuItem[]): boolean {
  return items.some((item) => {
    const title = item.title.toLowerCase()
    const url = (item.url || '').toLowerCase()
    const resource = item.resourceId || ''
    if (title === 'faq') return true
    if (url.includes('/pages/faq')) return true
    if (resource.includes('/Page/') && title.includes('faq')) return true
    return item.items ? hasFaq(item.items) : false
  })
}

async function main() {
  const creds = loadCreds()
  const token = await getToken(creds)
  console.log(`shop ${creds.domain}`)

  const pageData = await gql<{
    pages: { nodes: { id: string; handle: string; title: string }[] }
  }>(
    creds.domain,
    token,
    `{ pages(first: 10, query: "handle:faq") { nodes { id handle title } } }`,
  )
  const faqPage = pageData.pages.nodes.find((p) => p.handle === 'faq')
  if (!faqPage) throw new Error('FAQ page not found')
  console.log('FAQ page', faqPage.id)

  const menuData = await gql<{ menus: { nodes: Menu[] } }>(
    creds.domain,
    token,
    `{
      menus(first: 30) {
        nodes {
          id handle title
          items {
            id title type url resourceId
            items { id title type url resourceId items { id title type url resourceId } }
          }
        }
      }
    }`,
  )

  for (const menu of menuData.menus.nodes) {
    console.log(`\nmenu ${menu.handle} (${menu.title}): ${menu.items.length} items`)
    for (const item of menu.items) {
      console.log(`  - ${item.title} [${item.type}] ${item.url || item.resourceId || ''}`)
    }
  }

  // Prefer storefront main + footer menus only (not customer account / collection megamenus)
  const targets = menuData.menus.nodes.filter((m) => {
    const h = m.handle.toLowerCase()
    return h === 'main-menu' || h === 'main' || h === 'footer' || h.includes('header')
  })

  if (!targets.length) {
    console.log('No main/footer menus matched; updating all menus without FAQ')
  }

  const menusToUpdate = (targets.length ? targets : menuData.menus.nodes).filter(
    (m) => !hasFaq(m.items),
  )

  if (!menusToUpdate.length) {
    console.log('\nFAQ already present in target menus.')
    return
  }

  for (const menu of menusToUpdate) {
    const items = [
      ...menu.items.map(toUpdateInput),
      {
        title: 'FAQ',
        type: 'PAGE',
        resourceId: faqPage.id,
      },
    ]

    console.log(`\nAdding FAQ to ${menu.handle}...`)
    if (DRY) {
      console.log('dry-run items:', JSON.stringify(items, null, 2))
      continue
    }

    const result = await gql<{
      menuUpdate: {
        menu: { id: string; handle: string; items: { title: string }[] } | null
        userErrors: { message: string; field?: string[] }[]
      }
    }>(
      creds.domain,
      token,
      `mutation menuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
        menuUpdate(id: $id, title: $title, items: $items) {
          menu { id handle items { title } }
          userErrors { field message }
        }
      }`,
      {
        id: menu.id,
        title: menu.title,
        items,
      },
    )

    if (result.menuUpdate.userErrors?.length) {
      console.error(menu.handle, result.menuUpdate.userErrors)
      continue
    }
    console.log(
      'updated',
      menu.handle,
      '→',
      result.menuUpdate.menu?.items.map((i) => i.title).join(', '),
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
