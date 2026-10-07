/**
 * Inspect live theme header/menu files for FAQ link injection.
 *   bun scripts/tmp/inspect-shopify-header.ts
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '../..')
const MCP = join(ROOT, '.cursor/mcp.json')
const THEME_ID = 'gid://shopify/OnlineStoreTheme/196215472471'
const API = '2025-01'

const cfg = JSON.parse(readFileSync(MCP, 'utf8')) as {
  mcpServers: { shopify: { args: string[] } }
}
const args = cfg.mcpServers.shopify.args
const after = (f: string) => args[args.indexOf(f) + 1]
const creds = {
  clientId: after('--clientId'),
  clientSecret: after('--clientSecret'),
  domain: after('--domain'),
}

const tokenRes = await fetch(`https://${creds.domain}/admin/oauth/access_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
  }),
})
const { access_token } = (await tokenRes.json()) as { access_token: string }

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(`https://${creds.domain}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': access_token,
    },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

const files = [
  'sections/header.liquid',
  'snippets/header-menu.liquid',
  'snippets/header-drawer.liquid',
  'sections/header-group.json',
  'sections/footer.liquid',
  'sections/footer-group.json',
]

for (const filename of files) {
  const json = await gql(
    `query($themeId: ID!, $filenames: [String!]!) {
      theme(id: $themeId) {
        files(filenames: $filenames) {
          nodes {
            filename
            body {
              ... on OnlineStoreThemeFileBodyText { content }
            }
          }
        }
      }
    }`,
    { themeId: THEME_ID, filenames: [filename] },
  )
  const node = json?.data?.theme?.files?.nodes?.[0]
  if (!node?.body?.content) {
    console.log('\n===', filename, 'MISSING ===')
    continue
  }
  const content = node.body.content as string
  console.log('\n===', filename, content.length, 'bytes ===')
  // print lines mentioning menu / link / faq
  const lines = content.split('\n')
  lines.forEach((line, i) => {
    if (/menu|linklist|faq|navigation|header__inline|drawer/i.test(line)) {
      console.log(`${String(i + 1).padStart(4)}| ${line.slice(0, 160)}`)
    }
  })
}
