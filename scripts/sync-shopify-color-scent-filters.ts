/**
 * Translate Shopify color-pattern metaobject labels used by the
 * "color & scent" collection filter (e.g. "black / mint").
 *
 * Digest = sha256(enLabel); no read_metaobjects scope needed.
 *
 *   bun scripts/sync-shopify-color-scent-filters.ts
 *   bun scripts/sync-shopify-color-scent-filters.ts --dry-run
 */
import { createHash } from "node:crypto"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const API_VERSION = "2025-01"
const DRY = process.argv.includes("--dry-run")

const SHOPIFY_LOCALE: Record<string, string> = { pt: "pt-PT" }
const PACK_LOCALES = [
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

/** EN label → metaobject GID (from storefront filter.v.t.shopify.color-pattern). */
const COLOR_METAOBJECTS: { en: string; id: string }[] = [
  { en: "black / mint", id: "gid://shopify/Metaobject/454096978263" },
  { en: "blue / fresh", id: "gid://shopify/Metaobject/454095634775" },
  { en: "clear / tropical fruit", id: "gid://shopify/Metaobject/454096781655" },
  { en: "flame / mango", id: "gid://shopify/Metaobject/454021742935" },
  { en: "green / apple", id: "gid://shopify/Metaobject/454095208791" },
  { en: "green / pine", id: "gid://shopify/Metaobject/454098026839" },
  { en: "orange / tropical fruit", id: "gid://shopify/Metaobject/454096191831" },
  { en: "purple / berry", id: "gid://shopify/Metaobject/454094881111" },
  { en: "purple / lavender", id: "gid://shopify/Metaobject/454098583895" },
  { en: "red / melon", id: "gid://shopify/Metaobject/454098190679" },
  { en: "white / fresh", id: "gid://shopify/Metaobject/454099435863" },
  { en: "yellow / citrus", id: "gid://shopify/Metaobject/454098911575" },
]

/** Fallback for white / fresh (not in all variantLabels packs). */
const WHITE_FRESH: Record<string, string> = {
  bg: "бяло / fresh",
  hr: "bijela / fresh",
  cs: "bílá / fresh",
  da: "hvid / fresh",
  nl: "wit / fresh",
  et: "valge / fresh",
  fi: "valkoinen / fresh",
  fr: "blanc / fresh",
  de: "weiß / fresh",
  el: "λευκό / fresh",
  hu: "fehér / fresh",
  it: "bianco / fresh",
  lv: "balta / fresh",
  lt: "balta / fresh",
  pl: "biały / fresh",
  pt: "branco / fresh",
  ro: "alb / fresh",
  sk: "biela / fresh",
  es: "blanco / fresh",
  sv: "vit / fresh",
}

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
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error(`token failed: ${JSON.stringify(data)}`)
  return data.access_token
}

async function gql(
  domain: string,
  token: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(
    `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
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
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 1500))
  return json.data ?? {}
}

function digest(en: string): string {
  return createHash("sha256").update(en, "utf8").digest("hex")
}

function shopifyLocale(pack: string): string {
  return SHOPIFY_LOCALE[pack] ?? pack
}

function loadVariantMap(pack: string): Record<string, string> {
  const path = join(ROOT, `dictionaries/${pack}.json`)
  if (!existsSync(path)) return {}
  const d = JSON.parse(readFileSync(path, "utf8")) as {
    products?: { variantLabels?: Record<string, string> }
  }
  const labels = d.products?.variantLabels ?? {}
  // Build EN→localized using EN dictionary as key source
  const enPath = join(ROOT, "dictionaries/en.json")
  const en = JSON.parse(readFileSync(enPath, "utf8")) as {
    products?: { variantLabels?: Record<string, string> }
  }
  const enLabels = en.products?.variantLabels ?? {}
  const map: Record<string, string> = {}
  for (const [key, enVal] of Object.entries(enLabels)) {
    const loc = labels[key]
    if (loc) map[enVal] = loc
  }
  return map
}

async function main() {
  const creds = loadCreds()
  const token = await getToken(creds)

  console.log(`Syncing ${COLOR_METAOBJECTS.length} color/scent filter labels…`)

  for (const pack of PACK_LOCALES) {
    const locale = shopifyLocale(pack)
    const map = loadVariantMap(pack)
    if (WHITE_FRESH[pack]) map["white / fresh"] = WHITE_FRESH[pack]

    console.log(`\n== ${pack} (${locale}) ==`)
    const translations: {
      resourceId: string
      key: string
      value: string
      locale: string
      translatableContentDigest: string
    }[] = []

    for (const { en, id } of COLOR_METAOBJECTS) {
      const value = map[en]
      if (!value) {
        console.warn(`  missing translation for ${en}`)
        continue
      }
      console.log(`  ${en} → ${value}`)
      translations.push({
        resourceId: id,
        key: "label",
        value,
        locale,
        translatableContentDigest: digest(en),
      })
    }

    if (DRY) continue

    for (const t of translations) {
      const data = (await gql(
        creds.domain,
        token,
        `mutation($resourceId:ID!,$translations:[TranslationInput!]!){translationsRegister(resourceId:$resourceId,translations:$translations){userErrors{message} translations{key locale value}}}`,
        {
          resourceId: t.resourceId,
          translations: [
            {
              key: t.key,
              value: t.value,
              locale: t.locale,
              translatableContentDigest: t.translatableContentDigest,
            },
          ],
        },
      )) as {
        translationsRegister: {
          userErrors: { message: string }[]
          translations: { value: string }[]
        }
      }
      const errs = data.translationsRegister?.userErrors ?? []
      if (errs.length) {
        console.warn(`  ERR ${t.value}:`, errs.map((e) => e.message).join("; "))
      }
    }
    console.log(`  registered ${translations.length}`)
  }

  console.log(DRY ? "\n(dry-run done)" : "\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
