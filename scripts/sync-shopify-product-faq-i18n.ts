/**
 * Translate product FAQ accordion on product.product-landing template.
 *
 *   bun scripts/sync-shopify-product-faq-i18n.ts
 *   bun scripts/sync-shopify-product-faq-i18n.ts --dry-run
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { translate } from "google-translate-api-x"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const CACHE = join(ROOT, "scripts/tmp/shopify-product-faq-i18n-cache.json")
const API = "2025-01"
const DRY = process.argv.includes("--dry-run")
const RESOURCE_ID =
  "gid://shopify/OnlineStoreThemeJsonTemplate/product.product-landing?theme_id=196215472471"

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

const FAQ_KEYS = [
  "section.product.product-landing.json.collapsible_content_iGUxFe.heading:3k6apu6ummco7",
  "section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_MxwqD7.heading:2v87ddenptkbe",
  "section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_MxwqD7.row_content:p5nnp1rs17qm",
  "section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_EcaLVM.heading:3i6nge7nozvgq",
  "section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_EcaLVM.row_content:3q27ze8z3k60u",
  "section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_hAYLLq.heading:2v9h31iv03ee3",
  "section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_hAYLLq.row_content:2itkddymxw59r",
  "section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_PydxKU.heading:1c90qel18oy29",
  "section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_PydxKU.row_content:2dfw96kl6sqth",
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

/** ASCII tokens survive Google Translate better than unicode brackets. */
function protect(s: string): string {
  return s
    .replace(/Eco-One™/g, "__ECOONE__")
    .replace(/Sealed Bristles Technology™/g, "__SBT__")
    .replace(/xcrën\s*HD/gi, "__XCRENHD__")
    .replace(/xcrën/gi, "__XCREN__")
    .replace(/ëkcoscreen/gi, "__EKCOSCREEN__")
    .replace(/powërscreen/gi, "__POWERSCREEN__")
    .replace(/powër\s*screen/gi, "__POWERSCREEN__")
    .replace(/ürolite/gi, "__UROLITE__")
    .replace(/üro\s*lite/gi, "__UROLITE__")
    .replace(/frësh\s*drop/gi, "__FRESHDROP__")
    .replace(/ëkco\s*clip/gi, "__EKCOCLIP__")
    .replace(/ëkcos/gi, "__EKCOS__")
    .replace(/antisplash/gi, "__ANTISPLASH__")
}

function unprotect(s: string): string {
  return s
    .replace(/__ECOONE__/g, "Eco-One™")
    .replace(/__SBT__/g, "Sealed Bristles Technology™")
    .replace(/__XCRENHD__/gi, "xcrën HD")
    .replace(/__XCREN__/gi, "xcrën")
    .replace(/__EKCOSCREEN__/gi, "ëkcoscreen")
    .replace(/__POWERSCREEN__/gi, "powër screen")
    .replace(/__UROLITE__/gi, "üro lite")
    .replace(/__FRESHDROP__/gi, "frësh drop")
    .replace(/__EKCOCLIP__/gi, "ëkco clip")
    .replace(/__EKCOS__/gi, "ëkcos")
    .replace(/__ANTISPLASH__/gi, "antisplash")
}

async function translateOne(text: string, to: string): Promise<string> {
  // Keep plain "FAQ" as FAQ in most locales (widely understood); localize a few.
  if (text.trim() === "FAQ") {
    const faqLocal: Record<string, string> = {
      cs: "FAQ",
      sk: "FAQ",
      de: "FAQ",
      fr: "FAQ",
      es: "FAQ",
      it: "FAQ",
      pl: "FAQ",
      nl: "FAQ",
      da: "FAQ",
      sv: "FAQ",
      fi: "UKK",
      et: "KKK",
      hu: "GYIK",
      ro: "Întrebări frecvente",
      bg: "ЧЗВ",
      hr: "FAQ",
      el: "Συχνές ερωτήσεις",
      lv: "BUJ",
      lt: "DUK",
      pt: "FAQ",
    }
    return faqLocal[to] ?? "FAQ"
  }

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

  const meta = (await gql(
    creds.domain,
    token,
    `query($id:ID!){translatableResource(resourceId:$id){translatableContent{key value digest}}}`,
    { id: RESOURCE_ID },
  )) as {
    translatableResource: {
      translatableContent: { key: string; value: string; digest: string }[]
    }
  }

  const byKey = new Map(
    meta.translatableResource.translatableContent.map((c) => [c.key, c]),
  )

  const sources: { key: string; value: string; digest: string }[] = []
  for (const key of FAQ_KEYS) {
    const c = byKey.get(key)
    if (!c) throw new Error(`Missing FAQ key: ${key}`)
    sources.push(c)
  }

  console.log(`FAQ fields: ${sources.length}`)

  for (const pack of PACKS) {
    console.log(`\nLocale ${pack}`)
    cache[pack] ??= {}
    const locale = shopifyLocale(pack)
    const translations: {
      key: string
      value: string
      locale: string
      translatableContentDigest: string
    }[] = []

    for (const src of sources) {
      let tr = cache[pack][src.key]
      if (!tr) {
        tr = await translateOne(src.value, pack)
        cache[pack][src.key] = tr
        saveCache(cache)
        await new Promise((r) => setTimeout(r, 200))
      }
      // Preserve wrapping tags if GT stripped them from headings
      if (
        src.value.startsWith("<strong>") &&
        !tr.trim().startsWith("<")
      ) {
        tr = `<strong>${tr}</strong>`
        cache[pack][src.key] = tr
        saveCache(cache)
      }
      if (src.value.startsWith("<p>") && !tr.includes("<p>")) {
        // leave as-is if GT kept structure differently; prefer cached re-run
      }
      console.log(`  ${src.value.replace(/<[^>]+>/g, "").slice(0, 50)} → ${tr.replace(/<[^>]+>/g, "").slice(0, 50)}`)
      translations.push({
        key: src.key,
        value: tr,
        locale,
        translatableContentDigest: src.digest,
      })
    }

    if (DRY) continue

    const data = (await gql(
      creds.domain,
      token,
      `mutation($resourceId:ID!,$translations:[TranslationInput!]!){
        translationsRegister(resourceId:$resourceId,translations:$translations){
          userErrors{message field}
        }
      }`,
      { resourceId: RESOURCE_ID, translations },
    )) as {
      translationsRegister: { userErrors: { message: string }[] }
    }
    const errs = data.translationsRegister.userErrors
    if (errs?.length) console.warn("  errs", errs)
    else console.log(`  ok (${translations.length})`)
  }

  console.log(DRY ? "\n(dry-run done)" : "\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
