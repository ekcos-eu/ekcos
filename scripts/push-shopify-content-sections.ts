/**
 * Push content page sections to the live Shopify theme.
 *
 *   bun scripts/push-shopify-content-sections.ts
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const THEME_ID = "gid://shopify/OnlineStoreTheme/196215472471"
const API = "2025-01"

const FILES = [
  "sections/faq.liquid",
  "sections/custom-branding.liquid",
  "sections/b2b-vat-guide.liquid",
] as const

type Creds = { clientId: string; clientSecret: string; domain: string }

function loadCreds(): Creds {
  const cfg = JSON.parse(readFileSync(MCP, "utf8"))
  const args: string[] = cfg.mcpServers.shopify.args
  const after = (f: string) => args[args.indexOf(f) + 1]
  return {
    clientId: after("--clientId"),
    clientSecret: after("--clientSecret"),
    domain: after("--domain"),
  }
}

async function getToken(c: Creds): Promise<string> {
  const res = await fetch(`https://${c.domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: c.clientId,
      client_secret: c.clientSecret,
    }),
  })
  const data = (await res.json()) as { access_token?: string; errors?: unknown }
  if (!data.access_token) throw new Error(JSON.stringify(data))
  return data.access_token
}

async function upsertThemeFile(
  domain: string,
  token: string,
  filename: string,
  body: string,
) {
  const res = await fetch(`https://${domain}/admin/api/${API}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({
      query: `mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }`,
      variables: {
        themeId: THEME_ID,
        files: [{ filename, body: { type: "TEXT", value: body } }],
      },
    }),
  })
  const json = (await res.json()) as {
    data?: {
      themeFilesUpsert: {
        upsertedThemeFiles: { filename: string }[]
        userErrors: { field: string[]; message: string }[]
      }
    }
    errors?: unknown
  }
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 2000))
  const errs = json.data?.themeFilesUpsert.userErrors
  if (errs?.length) throw new Error(JSON.stringify(errs))
  console.log(`upserted ${filename}`)
}

async function main() {
  const creds = loadCreds()
  console.log(`shop ${creds.domain}`)
  const token = await getToken(creds)

  for (const file of FILES) {
    const body = readFileSync(join(ROOT, "shopify", file), "utf8")
    await upsertThemeFile(creds.domain, token, file, body)
  }
  console.log("done")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
