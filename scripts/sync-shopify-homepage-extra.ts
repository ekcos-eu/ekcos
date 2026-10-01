/**
 * Translate remaining Shopify homepage strings from screenshots:
 * Discover Our Collections, Stay clean…, Product of the week, View all.
 * Fast shipping lives in Custom Liquid (not API-translatable) — writes
 * multi-locale liquid to scripts/tmp/ for theme paste.
 *
 *   bun scripts/sync-shopify-homepage-extra.ts
 *   bun scripts/sync-shopify-homepage-extra.ts --dry-run
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { translate } from "google-translate-api-x"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const CACHE_PATH = join(ROOT, "scripts/tmp/shopify-homepage-extra-cache.json")
const LIQUID_OUT = join(ROOT, "scripts/tmp/fast-shipping-custom-liquid.liquid")
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

/** Exact EN values to translate (theme section settings + locale). */
const TARGET_VALUES = new Set([
  "Discover Our <em>Collections</em>",
  "Stay clean. Stay protected.",
  "<p>Urinal screens designed to help protect users from unwanted splashback, keep surrounding areas cleaner and deliver long-lasting fragrance for 60+ days.</p>",
  "Product of the <em>week</em>",
  "View all",
])

type Content = { key: string; value: string; digest: string }
type Resource = { resourceId: string; translatableContent: Content[] }
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
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: c.clientId,
    client_secret: c.clientSecret,
  })
  const res = await fetch(`https://${c.domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
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

function shopifyLocale(pack: string): string {
  return SHOPIFY_LOCALE[pack] ?? pack
}

function loadCache(): Record<string, Record<string, string>> {
  if (!existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Record<
      string,
      Record<string, string>
    >
  } catch {
    return {}
  }
}

function saveCache(cache: Record<string, Record<string, string>>) {
  mkdirSync(join(ROOT, "scripts/tmp"), { recursive: true })
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
}

/** Protect HTML tags + brand bits during GT. */
function protect(s: string): string {
  return s
    .replace(/<\/?[a-z][^>]*>/gi, (m) => `⟦${Buffer.from(m).toString("base64")}⟧`)
    .replace(/ëkcos/gi, "⟦EKCOS⟧")
    .replace(/60\+/g, "⟦60PLUS⟧")
}

function unprotect(s: string): string {
  return s
    .replace(/⟦EKCOS⟧/gi, "ëkcos")
    .replace(/⟦60PLUS⟧/g, "60+")
    .replace(/⟦([A-Za-z0-9+/=]+)⟧/g, (_, b64) => {
      try {
        return Buffer.from(b64, "base64").toString("utf8")
      } catch {
        return _
      }
    })
}

async function translateOne(text: string, to: string): Promise<string> {
  const protectedText = protect(text)
  let attempt = 0
  for (;;) {
    try {
      const result = await translate(protectedText, {
        from: "en",
        to,
        rejectOnPartialFail: false,
      })
      const raw =
        result && typeof result === "object" && "text" in result
          ? String((result as { text: string }).text)
          : text
      return unprotect(raw || text)
    } catch (err) {
      attempt += 1
      if (attempt >= 6) {
        console.warn(`  give up → ${to}:`, err)
        return text
      }
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

/** Prefer marketing-site dictionary for Product of the week title. */
function dictProductOfWeek(pack: string): string | null {
  const path = join(ROOT, `dictionaries/${pack}.json`)
  if (!existsSync(path)) return null
  const d = JSON.parse(readFileSync(path, "utf8")) as {
    home?: { productOfWeek?: { title?: string } }
  }
  const title = d.home?.productOfWeek?.title
  if (!title) return null
  // Wrap last word in <em> to match theme markup
  const parts = title.trim().split(/\s+/)
  if (parts.length < 2) return title
  const last = parts.pop()!
  return `${parts.join(" ")} <em>${last}</em>`
}

function dictShipping(pack: string): { title: string; body: string } | null {
  const path = join(ROOT, `dictionaries/${pack}.json`)
  if (!existsSync(path)) return null
  const d = JSON.parse(readFileSync(path, "utf8")) as {
    home?: { shipping?: { title?: string; body?: string } }
  }
  const s = d.home?.shipping
  if (!s?.title || !s?.body) return null
  return { title: s.title, body: s.body }
}

function buildFastShippingLiquid(
  byLocale: Record<string, { title: string; body: string }>,
): string {
  const en = {
    title: "Fast shipping across Europe",
    body: "All ëkcos products are dispatched within 1–2 working days after payment confirmation. With secure and efficient delivery throughout the EU, you can rely on consistent restocking for your business.",
  }
  const lines: string[] = [
    `{% comment %} Multi-locale Fast shipping banner — paste into Custom Liquid section custom_liquid_gY8dna {% endcomment %}`,
    `{% assign _loc = request.locale.iso_code | default: 'en' %}`,
    `{% if _loc == 'pt-PT' or _loc == 'pt' %}`,
    `  {% assign _loc = 'pt' %}`,
    `{% endif %}`,
    `{% case _loc %}`,
  ]
  for (const pack of PACK_LOCALES) {
    const t = byLocale[pack] ?? en
    const shopLoc = shopifyLocale(pack)
    // Shopify may report pt-PT; case both pack and shop locale when different
    if (shopLoc !== pack) {
      lines.push(`{% when '${shopLoc}' %}`)
      lines.push(`  {% assign _fs_title = ${JSON.stringify(t.title)} %}`)
      lines.push(`  {% assign _fs_body = ${JSON.stringify(t.body)} %}`)
    }
    lines.push(`{% when '${pack}' %}`)
    lines.push(`  {% assign _fs_title = ${JSON.stringify(t.title)} %}`)
    lines.push(`  {% assign _fs_body = ${JSON.stringify(t.body)} %}`)
  }
  lines.push(`{% else %}`)
  lines.push(`  {% assign _fs_title = ${JSON.stringify(en.title)} %}`)
  lines.push(`  {% assign _fs_body = ${JSON.stringify(en.body)} %}`)
  lines.push(`{% endcase %}`)
  lines.push(`<div style="background-color: #046eb8; color: #ffffff; padding: 40px 20px; text-align: center;">`)
  lines.push(
    `  <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 600; color: #fff">{{ _fs_title }}</h2>`,
  )
  lines.push(
    `  <p style="margin: 0; font-size: 16px; line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto;">{{ _fs_body }}</p>`,
  )
  lines.push(`</div>`)
  return lines.join("\n")
}

async function register(
  domain: string,
  token: string,
  resourceId: string,
  translations: { key: string; value: string; locale: string; translatableContentDigest: string }[],
) {
  if (DRY || translations.length === 0) return { errors: [] as { message: string }[] }
  // batch 25
  const errors: { message: string }[] = []
  for (let i = 0; i < translations.length; i += 25) {
    const chunk = translations.slice(i, i + 25)
    const data = (await gql(
      domain,
      token,
      `mutation($resourceId:ID!,$translations:[TranslationInput!]!){translationsRegister(resourceId:$resourceId,translations:$translations){userErrors{message field} translations{key locale}}}`,
      { resourceId, translations: chunk },
    )) as {
      translationsRegister: {
        userErrors: { message: string }[]
      }
    }
    errors.push(...(data.translationsRegister?.userErrors ?? []))
  }
  return { errors }
}

async function main() {
  const creds = loadCreds()
  const token = await getToken(creds)
  const cache = loadCache()

  const themeData = (await gql(
    creds.domain,
    token,
    `query{translatableResources(first:1, resourceType:ONLINE_STORE_THEME){edges{node{resourceId translatableContent{key value digest}}}}}`,
  )) as {
    translatableResources: { edges: { node: Resource }[] }
  }
  const theme = themeData.translatableResources.edges[0].node

  const localeData = (await gql(
    creds.domain,
    token,
    `query{translatableResources(first:5, resourceType:ONLINE_STORE_THEME_LOCALE_CONTENT){edges{node{resourceId translatableContent{key value digest}}}}}`,
  )) as {
    translatableResources: { edges: { node: Resource }[] }
  }
  const localeRes = localeData.translatableResources.edges[0]?.node

  const fields: { resourceId: string; key: string; value: string; digest: string }[] = []
  for (const c of theme.translatableContent) {
    if (c.value && TARGET_VALUES.has(c.value)) {
      fields.push({
        resourceId: theme.resourceId,
        key: c.key,
        value: c.value,
        digest: c.digest,
      })
    }
  }
  if (localeRes) {
    for (const c of localeRes.translatableContent) {
      if (
        c.value === "View all" &&
        (c.key === "sections.collection_list.view_all" ||
          c.key === "sections.featured_blog.view_all" ||
          c.key === "sections.featured_collection.view_all")
      ) {
        fields.push({
          resourceId: localeRes.resourceId,
          key: c.key,
          value: c.value,
          digest: c.digest,
        })
      }
    }
  }

  // unique by resourceId+key
  const seen = new Set<string>()
  const unique = fields.filter((f) => {
    const k = `${f.resourceId}::${f.key}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  console.log(`Matched ${unique.length} fields`)
  for (const f of unique) console.log(`  - ${f.value.slice(0, 60)}… (${f.key.slice(-40)})`)

  // unique EN strings to translate
  const enTexts = [...new Set(unique.map((f) => f.value))]

  for (const pack of PACK_LOCALES) {
    const locale = shopifyLocale(pack)
    console.log(`\n== ${pack} (${locale}) ==`)
    if (!cache[pack]) cache[pack] = {}

    const translationsByResource = new Map<
      string,
      { key: string; value: string; locale: string; translatableContentDigest: string }[]
    >()

    for (const en of enTexts) {
      let translated = cache[pack][en]
      if (!translated) {
        if (en === "Product of the <em>week</em>") {
          translated = dictProductOfWeek(pack) ?? (await translateOne(en, pack))
        } else if (en === "Discover Our <em>Collections</em>") {
          // Keep Collections brand-ish; translate full phrase with em preserved
          translated = await translateOne(en, pack)
        } else {
          translated = await translateOne(en, pack)
        }
        cache[pack][en] = translated
        saveCache(cache)
        await new Promise((r) => setTimeout(r, 400))
      }
      console.log(`  ${en.slice(0, 40)} → ${translated.slice(0, 50)}`)

      for (const f of unique.filter((x) => x.value === en)) {
        const list = translationsByResource.get(f.resourceId) ?? []
        list.push({
          key: f.key,
          value: translated,
          locale,
          translatableContentDigest: f.digest,
        })
        translationsByResource.set(f.resourceId, list)
      }
    }

    for (const [resourceId, translations] of translationsByResource) {
      const { errors } = await register(creds.domain, token, resourceId, translations)
      if (errors.length) console.warn(`  errors:`, errors)
      else console.log(`  registered ${translations.length} on ${resourceId.slice(-30)}`)
    }
  }

  // Fast shipping custom liquid (not API-translatable)
  const shippingByLoc: Record<string, { title: string; body: string }> = {}
  for (const pack of PACK_LOCALES) {
    const fromDict = dictShipping(pack)
    if (fromDict) {
      shippingByLoc[pack] = fromDict
    } else {
      const title = await translateOne("Fast shipping across Europe", pack)
      const body = await translateOne(
        "All ëkcos products are dispatched within 1–2 working days after payment confirmation. With secure and efficient delivery throughout the EU, you can rely on consistent restocking for your business.",
        pack,
      )
      shippingByLoc[pack] = { title, body }
      await new Promise((r) => setTimeout(r, 400))
    }
  }
  const liquid = buildFastShippingLiquid(shippingByLoc)
  mkdirSync(join(ROOT, "scripts/tmp"), { recursive: true })
  writeFileSync(LIQUID_OUT, liquid)
  console.log(`\nWrote Fast shipping multi-locale liquid → ${LIQUID_OUT}`)
  console.log(
    "Paste into Theme editor → Homepage → Custom liquid (blue shipping banner). App lacks write_themes.",
  )
  console.log(DRY ? "\n(dry-run: no Shopify writes)" : "\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
