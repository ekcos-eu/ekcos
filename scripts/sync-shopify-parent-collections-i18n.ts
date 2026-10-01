/**
 * Translate parent collection blurbs: Urinal Screens, Air Fresheners, Other products.
 *
 *   bun scripts/sync-shopify-parent-collections-i18n.ts
 *   bun scripts/sync-shopify-parent-collections-i18n.ts --handle other-products
 *   bun scripts/sync-shopify-parent-collections-i18n.ts --dry-run
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { translate } from "google-translate-api-x"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const CACHE = join(ROOT, "scripts/tmp/shopify-parent-collections-i18n-cache.json")
const UI_CACHE = join(ROOT, "scripts/tmp/shopify-ui-i18n-cache.json")
const API = "2025-01"
const DRY = process.argv.includes("--dry-run")
const HANDLE_ARG = (() => {
  const i = process.argv.indexOf("--handle")
  return i >= 0 ? process.argv[i + 1] : null
})()

const SHOPIFY_LOCALE: Record<string, string> = { pt: "pt-PT" }
const PACKS = [
  "bg",
  "hr",
  "cs",
  "da",
  "nl",
  "et",
  "fi",
  "fr",
  "de",
  "el",
  "hu",
  "it",
  "lv",
  "lt",
  "pl",
  "pt",
  "ro",
  "sk",
  "es",
  "sv",
] as const

const COLLECTIONS: {
  handle: string
  titleEn: string
  bodyEn: string
}[] = [
  {
    handle: "urinal-screens",
    titleEn: "Urinal Screens",
    bodyEn: `<h2>Hygiene and fragrance in one – reliable protection against urine splash</h2>
<p>ëkcos urinal screens are designed to deliver a cleaner, more comfortable experience by minimizing urine splashback and unpleasant odors, while continuously refreshing the space with a strong fragrance. Thanks to a patented bristle system and advanced deodorizing formula, they last up to 60 days. Suitable for both waterless and standard urinals. Available in premium and budget-friendly options, with a wide variety of colors and scents.</p>
<p><strong>An ideal solution for high-traffic restrooms in restaurants, bars, gas stations, and public buildings.</strong></p>`,
  },
  {
    handle: "air-fresheners",
    titleEn: "Air Fresheners",
    bodyEn: `<h2>Long-lasting freshness for toilet bowls and cubicles</h2>
<p>ëkcos air fresheners effectively neutralize odors and ensure a pleasant atmosphere in every restroom. Whether you're looking for a bowl hanger or a subtle scent for the cubicle, ëkcos products release fragrance gradually for up to 30 days. Eco-friendly formula, versatile use, and easy installation – ideal for hotels, businesses, and public facilities.</p>
<p><strong>Elegant freshness with no compromises.</strong></p>`,
  },
  {
    handle: "other-products",
    titleEn: "Other products",
    bodyEn: `<h2>Other products for waterless systems – reliable maintenance made easy</h2>
<p>In addition to urinal screens, we offer other essential products for waterless systems that help maintain hygiene and efficiency. Our ëz trap cartridge systems prevent odor leakage and buildup of debris, while ëkco mat floor mats protect the area around the urinal and enhance comfort for users. All items are eco-friendly, designed for quick replacement and long-lasting performance.</p>
<p>For facilities seeking hygiene, sustainability, and efficiency in one.</p>`,
  },
]

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

function shopifyLocale(pack: string) {
  return SHOPIFY_LOCALE[pack] ?? pack
}

function loadCache(): Record<string, Record<string, string>> {
  if (!existsSync(CACHE)) return {}
  try {
    return JSON.parse(readFileSync(CACHE, "utf8"))
  } catch {
    return {}
  }
}

function saveCache(cache: Record<string, Record<string, string>>) {
  mkdirSync(join(ROOT, "scripts/tmp"), { recursive: true })
  writeFileSync(CACHE, JSON.stringify(cache, null, 2))
}

function loadUiCache(): Record<string, Record<string, string>> {
  if (!existsSync(UI_CACHE)) return {}
  try {
    return JSON.parse(readFileSync(UI_CACHE, "utf8"))
  } catch {
    return {}
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
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error(JSON.stringify(data))
  return data.access_token
}

async function gql(
  domain: string,
  token: string,
  query: string,
  variables?: Record<string, unknown>,
) {
  const res = await fetch(
    `https://${domain}/admin/api/${API}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
  )
  const json = (await res.json()) as {
    data?: Record<string, unknown>
    errors?: unknown
  }
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 2000))
  return json.data as Record<string, unknown>
}

function protect(s: string): string {
  return s
    .replace(/Eco-One™/g, "__ECOONE__")
    .replace(/ëz trap/gi, "__EZTRAP__")
    .replace(/ëkco mat/gi, "__EKCOMAT__")
    .replace(/ëkcomat/gi, "__EKCOMAT__")
    .replace(/ëkcos/gi, "__EKCOS__")
}

function unprotect(s: string): string {
  return s
    .replace(/__ECOONE__/g, "Eco-One™")
    .replace(/__EZTRAP__/gi, "ëz trap")
    .replace(/__EKCOMAT__/gi, "ëkco mat")
    .replace(/__EKCOS__/gi, "ëkcos")
}

async function translateOne(text: string, to: string): Promise<string> {
  let attempt = 0
  for (;;) {
    try {
      const result = await translate(protect(text), {
        from: "en",
        to,
        rejectOnPartialFail: false,
      })
      const raw =
        result && typeof result === "object" && "text" in result
          ? String((result as { text: string }).text)
          : text
      return unprotect(raw || text)
    } catch {
      attempt++
      if (attempt >= 6) return text
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
}

async function main() {
  const creds = loadCreds()
  const token = await getToken(creds)
  const cache = loadCache()
  const uiCache = loadUiCache()
  const collections = HANDLE_ARG
    ? COLLECTIONS.filter((c) => c.handle === HANDLE_ARG)
    : COLLECTIONS
  if (!collections.length) {
    throw new Error(`Unknown --handle ${HANDLE_ARG}`)
  }

  for (const col of collections) {
    const found = (await gql(
      creds.domain,
      token,
      `query($h:String!){collectionByHandle(handle:$h){id title descriptionHtml}}`,
      { h: col.handle },
    )) as {
      collectionByHandle: {
        id: string
        title: string
        descriptionHtml: string
      } | null
    }
    if (!found.collectionByHandle) {
      throw new Error(`Collection not found: ${col.handle}`)
    }
    const id = found.collectionByHandle.id
    console.log(`\n=== ${col.titleEn} (${col.handle}) ===`)

    if (!DRY) {
      const upd = (await gql(
        creds.domain,
        token,
        `mutation($input:CollectionInput!){collectionUpdate(input:$input){userErrors{message}}}`,
        {
          input: {
            id,
            title: col.titleEn,
            descriptionHtml: col.bodyEn,
          },
        },
      )) as { collectionUpdate: { userErrors: { message: string }[] } }
      if (upd.collectionUpdate.userErrors?.length) {
        throw new Error(JSON.stringify(upd.collectionUpdate.userErrors))
      }
      console.log("updated EN primary")
    } else {
      console.log("dry-run: skip EN update")
    }

    const meta = (await gql(
      creds.domain,
      token,
      `query($id:ID!){translatableResource(resourceId:$id){translatableContent{key value digest}}}`,
      { id },
    )) as {
      translatableResource: {
        translatableContent: { key: string; value: string; digest: string }[]
      }
    }
    const digests = Object.fromEntries(
      meta.translatableResource.translatableContent.map((c) => [c.key, c.digest]),
    )

    for (const pack of PACKS) {
      cache[pack] ??= {}
      const locale = shopifyLocale(pack)
      const titleKey = `${col.handle}:title`
      const bodyKey = `${col.handle}:body`

      let title = cache[pack][titleKey]
      if (!title) {
        title = uiCache[pack]?.[col.titleEn]
      }
      if (!title) {
        title = await translateOne(col.titleEn, pack)
        await new Promise((r) => setTimeout(r, 150))
      }
      cache[pack][titleKey] = title
      saveCache(cache)

      let body = cache[pack][bodyKey]
      if (!body) {
        body = await translateOne(col.bodyEn, pack)
        cache[pack][bodyKey] = body
        saveCache(cache)
        await new Promise((r) => setTimeout(r, 250))
      }

      console.log(
        `  ${pack}: ${title} | ${body.replace(/<[^>]+>/g, " ").slice(0, 60).trim()}…`,
      )

      if (DRY) continue

      const translations = [
        {
          locale,
          key: "title",
          value: title,
          translatableContentDigest: digests.title,
        },
        {
          locale,
          key: "body_html",
          value: body,
          translatableContentDigest: digests.body_html,
        },
      ]
      const data = (await gql(
        creds.domain,
        token,
        `mutation($resourceId:ID!,$translations:[TranslationInput!]!){
          translationsRegister(resourceId:$resourceId,translations:$translations){
            userErrors{message}
          }
        }`,
        { resourceId: id, translations },
      )) as {
        translationsRegister: { userErrors: { message: string }[] }
      }
      const errs = data.translationsRegister.userErrors
      if (errs?.length) console.warn(`  errs ${pack}`, errs)
    }
  }

  console.log(DRY ? "\n(dry-run done)" : "\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
