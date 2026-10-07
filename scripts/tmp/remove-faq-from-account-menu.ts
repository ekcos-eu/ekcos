import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '../..')
const MCP = join(ROOT, '.cursor/mcp.json')
const cfg = JSON.parse(readFileSync(MCP, 'utf8')) as {
  mcpServers: { shopify: { args: string[] } }
}
const args = cfg.mcpServers.shopify.args
const after = (f: string) => args[args.indexOf(f) + 1]
const domain = after('--domain')
const clientId = after('--clientId')
const clientSecret = after('--clientSecret')

const tokenRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  }),
})
const { access_token: token } = (await tokenRes.json()) as {
  access_token: string
}

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

const data = await gql(`{
  menus(first: 20) {
    nodes {
      id handle title
      items { id title type url resourceId }
    }
  }
}`)

const menu = data.data.menus.nodes.find(
  (m: { handle: string }) => m.handle === 'customer-account-main-menu',
)
if (!menu) throw new Error('customer-account-main-menu not found')

const items = menu.items
  .filter((i: { title: string }) => i.title !== 'FAQ')
  .map((i: { id: string; title: string; type: string; url?: string; resourceId?: string }) => ({
    id: i.id,
    title: i.title,
    type: i.type,
    ...(i.url ? { url: i.url } : {}),
    ...(i.resourceId ? { resourceId: i.resourceId } : {}),
  }))

const upd = await gql(
  `mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu { items { title } }
      userErrors { message }
    }
  }`,
  { id: menu.id, title: menu.title, items },
)
console.log(JSON.stringify(upd, null, 2))
