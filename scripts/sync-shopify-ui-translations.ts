#!/usr/bin/env bun
/**
 * Translate Shopify storefront UI (menus, filters, theme locale + section
 * settings) into all shop languages from English source strings.
 *
 * Requires Shopify Admin credentials in .cursor/mcp.json (same as product sync).
 * Portuguese shop locale is pt-PT. Slovenian omitted.
 *
 * Usage:
 *   bun scripts/sync-shopify-ui-translations.ts
 *   bun scripts/sync-shopify-ui-translations.ts --dry-run
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { translate } from "google-translate-api-x"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const CACHE_PATH = join(ROOT, "scripts/tmp/shopify-ui-i18n-cache.json")
const API_VERSION = "2025-01"

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

/** Brand / product names — keep as-is in every locale. */
const KEEP_AS_IS = new Set([
  "xcrën HD",
  "ëkcoscreen",
  "powërscreen",
  "üro lite",
  "ëkco clip",
  "frësh drop",
  "ëz trap",
  "ëkco mat",
  "xcrën puck",
  "Eco-One™",
])

/** Exact EN UI strings that must be translated (menus, filters, theme settings). */
const PRIORITY_EN = [
  "Home",
  "Catalog",
  "Search",
  "Orders",
  "Profile",
  "Urinal Screens",
  "Air Fresheners",
  "Other Products",
  "Other products",
  "All Products",
  "Custom Branding",
  "Contact",
  "FAQ",
  "B2B & 0% VAT Guide",
  "How to Choose the Right urinal Screen",
  "Your Privacy Choices",
  "Availability",
  "Price",
  "color & scent",
  "Recently viewed",
  "Recently Viewed",
  "You May Also Like",
  "You may also like",
  "Guarantees",
  "Eco-Friendly & Biodegradable",
  "Hygiene Without Compromise",
  "Less Cleaning, Lower Costs",
  "Official EU Distributor",
  "Get in touch",
  "Customer service",
  "Follow us",
  "Follow Us",
  "Explore Products",
  "Explore Now",
  "Free shipping on 120€+ orders",
  "Stay informed. Stay ëkco.",
  "Be the first to know about new collections and exclusive offers.",
  "Enter email here",
  "Subscribe",
  "Thanks for subscribing",
  "Add to cart",
  "Add set to cart",
  "Quantity",
  "Discount",
  "Price after Discount",
  "Price per item",
  "Price incl. VAT",
  "Reset",
  "In stock",
  "Out of stock",
  "Filter",
  "Sort",
  "Clear",
  "Clear all",
  "Apply",
  "Cart",
  "Check out",
  "View cart",
  "Send message",
  "Name",
  "Email",
  "Phone number",
  "Comment",
]

const LOCALE_KEY_PREFIXES = [
  "products.product.",
  "products.facets.",
  "general.cart.",
  "general.search.",
  "general.continue_shopping",
  "general.breadcrumbs.",
  "sections.cart.",
  "sections.footer.",
  "sections.header.",
  "sections.collection_template.",
  "sections.featured_collection.",
  "newsletter.",
  "templates.contact.",
  "shopify.filters.",
  "accessibility.home",
  "accessibility.search",
  "accessibility.site_footer",
]

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

async function allResources(
  domain: string,
  token: string,
  resourceType: string,
): Promise<Resource[]> {
  const out: Resource[] = []
  let cursor: string | null = null
  for (;;) {
    const data = (await gql(
      domain,
      token,
      `query($c:String){translatableResources(first:50, after:$c, resourceType:${resourceType}){pageInfo{hasNextPage endCursor} edges{node{resourceId translatableContent{key value digest}}}}}`,
      { c: cursor },
    )) as {
      translatableResources: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
        edges: { node: Resource }[]
      }
    }
    const conn = data.translatableResources
    for (const e of conn.edges) out.push(e.node)
    if (!conn.pageInfo.hasNextPage) break
    cursor = conn.pageInfo.endCursor
  }
  return out
}

function shopifyLocale(pack: string): string {
  return SHOPIFY_LOCALE[pack] ?? pack
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim()
}

function shouldTranslateLocaleKey(key: string): boolean {
  return LOCALE_KEY_PREFIXES.some((p) => key.startsWith(p) || key === p)
}

const PH = /(\{\{[^}]+\}\}|%\{[^}]+\}|%[sd])/g

function protect(s: string): string {
  return s
    .replace(PH, (m) => `⟦${Buffer.from(m).toString("base64")}⟧`)
    .replace(/Eco-One™/g, "⟦ECOONE⟧")
    .replace(/ëkcos/gi, "⟦EKCOS⟧")
}

function unprotect(s: string): string {
  return s
    .replace(/⟦ECOONE⟧/g, "Eco-One™")
    .replace(/⟦EKCOS⟧/gi, "ëkcos")
    .replace(/⟦([A-Za-z0-9+/=]+)⟧/g, (_, b64) => {
      try {
        return Buffer.from(b64, "base64").toString("utf8")
      } catch {
        return _
      }
    })
}

async function translateBatch(texts: string[], to: string): Promise<string[]> {
  if (texts.length === 0) return []
  const protectedTexts = texts.map(protect)
  const chunkSize = 30
  const out: string[] = []

  for (let i = 0; i < protectedTexts.length; i += chunkSize) {
    const chunk = protectedTexts.slice(i, i + chunkSize)
    let attempt = 0
    for (;;) {
      try {
        const result = await translate(chunk, {
          from: "en",
          to,
          forceBatch: true,
          rejectOnPartialFail: false,
        })
        const arr = Array.isArray(result) ? result : [result]
        for (let j = 0; j < chunk.length; j++) {
          const item = arr[j]
          const raw =
            item && typeof item === "object" && "text" in item
              ? String((item as { text: string }).text)
              : texts[i + j]
          out.push(unprotect(raw || texts[i + j]))
        }
        break
      } catch (err) {
        attempt += 1
        if (attempt >= 6) {
          console.warn(`  giving up chunk@${i} → ${to}:`, err)
          for (let j = 0; j < chunk.length; j++) out.push(texts[i + j])
          break
        }
        const wait = 2000 * attempt
        console.warn(`  retry ${attempt} ${to} wait ${wait}ms`)
        await new Promise((r) => setTimeout(r, wait))
      }
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return out
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

async function registerBatch(
  domain: string,
  token: string,
  resourceId: string,
  translations: {
    locale: string
    key: string
    value: string
    translatableContentDigest: string
  }[],
): Promise<string[]> {
  const failed: string[] = []
  // chunk by locale to keep payloads small
  const byLocale = new Map<string, typeof translations>()
  for (const t of translations) {
    const list = byLocale.get(t.locale) ?? []
    list.push(t)
    byLocale.set(t.locale, list)
  }
  for (const [locale, batch] of byLocale) {
    // Shopify limit ~ soft; send in groups of 25
    for (let i = 0; i < batch.length; i += 25) {
      const chunk = batch.slice(i, i + 25)
      try {
        const data = (await gql(
          domain,
          token,
          `mutation($resourceId:ID!,$translations:[TranslationInput!]!){translationsRegister(resourceId:$resourceId,translations:$translations){userErrors{message} translations{key locale}}}`,
          { resourceId, translations: chunk },
        )) as {
          translationsRegister: {
            userErrors: { message: string }[]
          }
        }
        const errs = data.translationsRegister.userErrors
        if (errs?.length) {
          failed.push(`${locale}: ${errs.map((e) => e.message).join("; ")}`)
        }
      } catch (e) {
        failed.push(`${locale}: ${String(e).slice(0, 200)}`)
      }
    }
  }
  return failed
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const creds = loadCreds()
  const token = await getToken(creds)
  const { domain } = creds

  console.log("Loading resources…")
  const [links, filters, collections, themeJson, themeLocale] =
    await Promise.all([
      allResources(domain, token, "LINK"),
      allResources(domain, token, "FILTER"),
      allResources(domain, token, "COLLECTION"),
      allResources(domain, token, "ONLINE_STORE_THEME_JSON_TEMPLATE"),
      allResources(domain, token, "ONLINE_STORE_THEME_LOCALE_CONTENT"),
    ])

  type Job = {
    resourceId: string
    key: string
    digest: string
    en: string
  }
  const jobs: Job[] = []
  const priority = new Set(PRIORITY_EN.map((s) => s.toLowerCase()))

  const add = (r: Resource, c: Content) => {
    const v = c.value ?? ""
    if (!v.trim()) return
    jobs.push({
      resourceId: r.resourceId,
      key: c.key,
      digest: c.digest,
      en: v,
    })
  }

  for (const r of links) {
    for (const c of r.translatableContent) {
      if (c.key !== "title") continue
      if (KEEP_AS_IS.has(c.value)) continue
      add(r, c)
    }
  }
  for (const r of filters) {
    for (const c of r.translatableContent) add(r, c)
  }
  for (const r of collections) {
    for (const c of r.translatableContent) {
      if (c.key !== "title") continue
      if (KEEP_AS_IS.has(c.value)) continue
      // translate category-like titles only
      if (
        [
          "Urinal Screens",
          "Air Fresheners",
          "Other products",
          "All Products",
        ].includes(c.value)
      ) {
        add(r, c)
      }
    }
  }
  for (const r of themeJson) {
    for (const c of r.translatableContent) {
      const plain = stripHtml(c.value ?? "")
      if (
        priority.has((c.value ?? "").trim().toLowerCase()) ||
        priority.has(plain.toLowerCase())
      ) {
        add(r, c)
      }
    }
  }
  for (const r of themeLocale) {
    for (const c of r.translatableContent) {
      if (!shouldTranslateLocaleKey(c.key)) continue
      if (!(c.value ?? "").trim()) continue
      // skip shopify checkout spam under products? already filtered by prefix
      if (c.key.startsWith("shopify.checkout.")) continue
      add(r, c)
    }
  }

  // unique EN strings to translate
  const uniqueEn = [...new Set(jobs.map((j) => j.en))]
  console.log(
    `Jobs: ${jobs.length} fields, ${uniqueEn.length} unique EN strings, locales: ${PACK_LOCALES.length}`,
  )

  const diskCache = loadCache()
  const translationsByEn = new Map<string, Record<string, string>>()

  for (const locale of PACK_LOCALES) {
    const need: string[] = []
    const cachedRow = diskCache[locale] ?? {}
    for (const en of uniqueEn) {
      if (KEEP_AS_IS.has(en)) {
        const row = translationsByEn.get(en) ?? {}
        row[locale] = en
        translationsByEn.set(en, row)
        continue
      }
      if (cachedRow[en]) {
        const row = translationsByEn.get(en) ?? {}
        row[locale] = cachedRow[en]
        translationsByEn.set(en, row)
      } else {
        need.push(en)
      }
    }
    console.log(
      `Translating → ${locale} (new ${need.length}, cached ${uniqueEn.length - need.length})…`,
    )
    if (need.length) {
      const translated = await translateBatch(need, locale === "pt" ? "pt" : locale)
      const localeCache = diskCache[locale] ?? {}
      for (let i = 0; i < need.length; i++) {
        const en = need[i]
        const t = translated[i] ?? en
        localeCache[en] = t
        const row = translationsByEn.get(en) ?? {}
        row[locale] = t
        translationsByEn.set(en, row)
      }
      diskCache[locale] = localeCache
      saveCache(diskCache)
    }
  }

  if (dryRun) {
    const sample = uniqueEn.slice(0, 8)
    for (const en of sample) {
      console.log("\nEN:", en.slice(0, 80))
      console.log("HU:", translationsByEn.get(en)?.hu?.slice(0, 80))
      console.log("CS:", translationsByEn.get(en)?.cs?.slice(0, 80))
    }
    console.log("\nDRY-RUN done")
    return
  }

  // group jobs by resource
  const byResource = new Map<string, Job[]>()
  for (const j of jobs) {
    const list = byResource.get(j.resourceId) ?? []
    list.push(j)
    byResource.set(j.resourceId, list)
  }

  let failCount = 0
  let okResources = 0
  for (const [resourceId, list] of byResource) {
    const translations = []
    for (const j of list) {
      const map = translationsByEn.get(j.en) ?? {}
      for (const locale of PACK_LOCALES) {
        const value = map[locale]
        if (!value) continue
        translations.push({
          locale: shopifyLocale(locale),
          key: j.key,
          value,
          translatableContentDigest: j.digest,
        })
      }
    }
    const failed = await registerBatch(domain, token, resourceId, translations)
    if (failed.length) {
      failCount += failed.length
      console.warn(`fails ${resourceId}:`, failed.slice(0, 3))
    } else {
      okResources++
    }
  }

  console.log(
    `\nDone. Resources OK: ${okResources}/${byResource.size}, failure events: ${failCount}`,
  )
  console.log(
    "Note: color/scent filter VALUES need read_metaobjects scope; footer column titles CONTACT INFO / EXPLORE may be hardcoded in the theme (need Theme access).",
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
