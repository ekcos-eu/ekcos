/**
 * Translate leftover storefront strings:
 * - B2B page H1 (liquid case blocks)
 * - Footer newsletter + column headings
 * - Cart drawer "You may also like" (theme settings)
 * - Cart Subtotal / Check out (locale)
 *
 *   bun scripts/sync-shopify-leftover-i18n.ts
 *   bun scripts/sync-shopify-leftover-i18n.ts --dry-run
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { translate } from "google-translate-api-x"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const CACHE = join(ROOT, "scripts/tmp/shopify-leftover-i18n-cache.json")
const UI_CACHE = join(ROOT, "scripts/tmp/shopify-ui-i18n-cache.json")
const THEME_ID = "gid://shopify/OnlineStoreTheme/196215472471"
const THEME_RES = THEME_ID
const CART_DRAWER_RES =
  "gid://shopify/OnlineStoreThemeSettingsCategory/Cart+drawer?theme_id=196215472471&first_setting_id=cart_drawer_enabled"
const API = "2025-01"
const DRY = process.argv.includes("--dry-run")

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

/** EN source → translation key(s) to register. */
const STRINGS: { en: string; keys: { resourceId: string; key: string }[] }[] =
  [
    {
      en: "Exclusive benefits",
      keys: [
        {
          resourceId: THEME_RES,
          key: "section.sections/footer-group.json.footer.newsletter_heading:3mws8faawdff7",
        },
      ],
    },
    {
      en: "<p>Apply for our free membership to receive exclusive deals, news, and events.</p>",
      keys: [
        {
          resourceId: THEME_RES,
          key: "section.sections/footer-group.json.footer.newsletter_text:18aqptyndyzie",
        },
      ],
    },
    {
      en: "Contact info",
      keys: [
        {
          resourceId: THEME_RES,
          key: "section.sections/footer-group.json.footer.text_G6n4yx.heading:3886z4tb0py1a",
        },
      ],
    },
    {
      en: "Explore",
      keys: [
        {
          resourceId: THEME_RES,
          key: "section.sections/footer-group.json.footer.footer-0.heading:1rok5v0oosuou",
        },
      ],
    },
    {
      en: "Urinal Screens",
      keys: [
        {
          resourceId: THEME_RES,
          key: "section.sections/footer-group.json.footer.link_list_9jCTzR.heading:mlhkpicpkeko",
        },
      ],
    },
    {
      en: "WC Air Fresheners",
      keys: [
        {
          resourceId: THEME_RES,
          key: "section.sections/footer-group.json.footer.link_list_WdWNGH.heading:31eah9svm3f41",
        },
      ],
    },
    {
      en: "All rights reserved.",
      keys: [
        {
          resourceId: THEME_RES,
          key: "section.sections/footer-group.json.footer.copyright_text:2tjp2nkt2fjbm",
        },
      ],
    },
    {
      en: "You may also like",
      keys: [
        {
          resourceId: THEME_RES,
          key: "general.cart_recommendations_heading",
        },
        {
          resourceId: CART_DRAWER_RES,
          key: "general.cart_recommendations_heading",
        },
      ],
    },
    {
      en: "Subtotal",
      keys: [{ resourceId: THEME_RES, key: "sections.cart.subtotal" }],
    },
    {
      en: "Check out",
      keys: [{ resourceId: THEME_RES, key: "sections.cart.checkout" }],
    },
  ]

/** Prefer curated B2B titles where we already have good copy. */
const B2B_TITLES: Record<string, string> = {
  bg: "Ръководство за B2B и 0% ДДС",
  hr: "Vodič za B2B i 0% PDV",
  cs: "Průvodce B2B a 0 % DPH",
  da: "B2B- og 0% moms-vejledning",
  nl: "B2B- en 0% btw-gids",
  et: "B2B ja 0% käibemaksu juhend",
  fi: "B2B- ja 0 % ALV -opas",
  fr: "Guide B2B et TVA 0 %",
  de: "B2B- und 0%-MwSt.-Leitfaden",
  el: "Οδηγός B2B και ΦΠΑ 0%",
  hu: "B2B és 0% áfa útmutató",
  it: "Guida B2B e IVA 0%",
  lv: "B2B un 0% PVN rokasgrāmata",
  lt: "B2B ir 0% PVM vadovas",
  pl: "Przewodnik B2B i 0% VAT",
  pt: "Guia B2B e IVA 0%",
  ro: "Ghid B2B și TVA 0%",
  sk: "Sprievodca B2B a 0 % DPH",
  es: "Guía B2B y IVA 0%",
  sv: "B2B- och 0% moms-guide",
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
  const json = (await res.json()) as { data?: Record<string, unknown>; errors?: unknown }
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 2000))
  return json.data as Record<string, unknown>
}

function protect(s: string): string {
  return s
    .replace(/Eco-One™/g, "__ECOONE__")
    .replace(/ëkcos/gi, "__EKCOS__")
    .replace(/B2B/g, "__B2B__")
}

function unprotect(s: string): string {
  return s
    .replace(/__ECOONE__/g, "Eco-One™")
    .replace(/__EKCOS__/gi, "ëkcos")
    .replace(/__B2B__/g, "B2B")
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

function liquidAssign(key: string, value: string): string {
  const cleaned = value.replace(/\u2026/g, "...").replace(/\r?\n/g, " ")
  if (!cleaned.includes("'")) {
    return `{% assign ${key} = '${cleaned.replace(/\\/g, "\\\\")}' %}`
  }
  if (!cleaned.includes('"')) {
    return `{% assign ${key} = "${cleaned.replace(/\\/g, "\\\\")}" %}`
  }
  const safe = cleaned.replace(/"/g, "'")
  return `{% assign ${key} = "${safe.replace(/\\/g, "\\\\")}" %}`
}

function updateB2bLiquidTitles(liquid: string): string {
  let out = liquid
  for (const pack of PACKS) {
    const title = B2B_TITLES[pack]
    if (!title) continue
    const marker = `{% when '${pack}' %}`
    const idx = out.indexOf(marker)
    if (idx < 0) continue
    const nextWhen = out.indexOf("{% when '", idx + marker.length)
    const endcase = out.indexOf("{% endcase %}", idx)
    const end = Math.min(
      nextWhen > 0 ? nextWhen : Infinity,
      endcase > 0 ? endcase : Infinity,
    )
    if (!Number.isFinite(end)) continue
    const block = out.slice(idx, end)
    const patched = block.replace(
      /\{%\s*assign\s+vat_title\s*=\s*['"][^'"]*['"]\s*%\}/,
      liquidAssign("vat_title", title).trim(),
    )
    out = out.slice(0, idx) + patched + out.slice(end)
  }
  return out
}

async function upsertThemeFile(
  domain: string,
  token: string,
  filename: string,
  body: string,
) {
  if (DRY) {
    console.log(`  dry-run upsert ${filename}`)
    return
  }
  const data = (await gql(
    domain,
    token,
    `mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
      themeFilesUpsert(themeId: $themeId, files: $files) {
        upsertedThemeFiles { filename }
        userErrors { field message }
      }
    }`,
    {
      themeId: THEME_ID,
      files: [{ filename, body: { type: "TEXT", value: body } }],
    },
  )) as {
    themeFilesUpsert: {
      userErrors: { message: string }[]
    }
  }
  if (data.themeFilesUpsert.userErrors?.length) {
    throw new Error(JSON.stringify(data.themeFilesUpsert.userErrors))
  }
  console.log(`  upserted ${filename}`)
}

async function main() {
  const creds = loadCreds()
  const token = await getToken(creds)
  const cache = loadCache()
  const uiCache = loadUiCache()

  // Seed B2B titles from UI cache when better
  for (const pack of PACKS) {
    const cached = uiCache[pack]?.["B2B & 0% VAT Guide"]
    if (cached && !B2B_TITLES[pack]) B2B_TITLES[pack] = cached
  }

  // 1) Update B2B liquid titles
  const b2bPath = join(ROOT, "shopify/sections/b2b-vat-guide.liquid")
  let b2b = readFileSync(b2bPath, "utf8")
  b2b = updateB2bLiquidTitles(b2b)
  writeFileSync(b2bPath, b2b)
  console.log("Updated local b2b-vat-guide.liquid titles")
  await upsertThemeFile(
    creds.domain,
    token,
    "sections/b2b-vat-guide.liquid",
    b2b,
  )

  // 2) Resolve digests for target keys
  const digestByResource = new Map<string, Map<string, string>>()
  for (const resourceId of [THEME_RES, CART_DRAWER_RES]) {
    const meta = (await gql(
      creds.domain,
      token,
      `query($id:ID!){translatableResource(resourceId:$id){translatableContent{key value digest}}}`,
      { id: resourceId },
    )) as {
      translatableResource: {
        translatableContent: { key: string; value: string; digest: string }[]
      }
    }
    const map = new Map<string, string>()
    for (const c of meta.translatableResource.translatableContent) {
      map.set(c.key, c.digest)
    }
    digestByResource.set(resourceId, map)
  }

  // 3) Translate + register
  for (const pack of PACKS) {
    console.log(`\nLocale ${pack}`)
    cache[pack] ??= {}
    const locale = shopifyLocale(pack)

    const byResource = new Map<
      string,
      {
        key: string
        value: string
        locale: string
        translatableContentDigest: string
      }[]
    >()

    for (const item of STRINGS) {
      let tr = cache[pack][item.en]
      if (!tr) {
        // Prefer UI cache for known strings
        tr =
          uiCache[pack]?.[item.en] ||
          uiCache[pack]?.[item.en.replace(/<\/?p>/g, "").trim()] ||
          (await translateOne(item.en, pack))
        cache[pack][item.en] = tr
        saveCache(cache)
        await new Promise((r) => setTimeout(r, 150))
      }

      // Keep HTML wrappers if source had them
      if (item.en.startsWith("<p>") && !tr.startsWith("<p>")) {
        tr = `<p>${tr.replace(/^<p>|<\/p>$/gi, "")}</p>`
      }

      console.log(`  ${item.en.slice(0, 40)} → ${tr.slice(0, 50)}`)

      for (const { resourceId, key } of item.keys) {
        const digest = digestByResource.get(resourceId)?.get(key)
        if (!digest) {
          console.warn(`  missing digest ${resourceId} ${key}`)
          continue
        }
        const list = byResource.get(resourceId) ?? []
        list.push({
          key,
          value: tr,
          locale,
          translatableContentDigest: digest,
        })
        byResource.set(resourceId, list)
      }
    }

    // Also register B2B page title
    const pageId = "gid://shopify/Page/164880089431"
    const pageMeta = (await gql(
      creds.domain,
      token,
      `query($id:ID!){translatableResource(resourceId:$id){translatableContent{key digest}}}`,
      { id: pageId },
    )) as {
      translatableResource: {
        translatableContent: { key: string; digest: string }[]
      }
    }
    const titleDigest = pageMeta.translatableResource.translatableContent.find(
      (c) => c.key === "title",
    )?.digest
    if (titleDigest && B2B_TITLES[pack]) {
      byResource.set(pageId, [
        {
          key: "title",
          value: B2B_TITLES[pack],
          locale,
          translatableContentDigest: titleDigest,
        },
      ])
    }

    if (DRY) continue

    for (const [resourceId, translations] of byResource) {
      const data = (await gql(
        creds.domain,
        token,
        `mutation($resourceId:ID!,$translations:[TranslationInput!]!){
          translationsRegister(resourceId:$resourceId,translations:$translations){
            userErrors{message field}
          }
        }`,
        { resourceId, translations },
      )) as {
        translationsRegister: { userErrors: { message: string }[] }
      }
      const errs = data.translationsRegister.userErrors
      if (errs?.length) console.warn(`  errs ${resourceId}`, errs)
      else console.log(`  ok ${resourceId.split("/").pop()} (${translations.length})`)
    }
  }

  console.log(DRY ? "\n(dry-run done)" : "\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
