/**
 * Expand B2B VAT Guide + Custom Branding liquid case blocks for all shop
 * languages, push to live theme, and register page title/body translations.
 *
 *   bun scripts/sync-shopify-b2b-branding-i18n.ts
 */
import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { translate } from "google-translate-api-x"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const CACHE = join(ROOT, "scripts/tmp/shopify-b2b-branding-i18n-cache.json")
const THEME_ID = "gid://shopify/OnlineStoreTheme/196215472471"
const API = "2025-01"
const DRY = process.argv.includes("--dry-run")
const FROM_CACHE = process.argv.includes("--from-cache")

const SHOPIFY_LOCALE: Record<string, string> = { pt: "pt-PT" }
const EXISTING = new Set(["cs", "de", "fr", "es", "it"])
const MISSING = [
  "bg",
  "hr",
  "da",
  "nl",
  "et",
  "fi",
  "el",
  "hu",
  "lv",
  "lt",
  "pl",
  "pt",
  "ro",
  "sk",
  "sv",
] as const

const B2B_EN: Record<string, string> = {
  vat_eyebrow: "B2B checkout help",
  vat_title: "B2B & 0% VAT Guide",
  vat_lead: "How to purchase as a business and apply VAT exemption",
  vat_intro:
    "Are you buying for a company within the European Union? Here is a step-by-step guide on how to automatically claim your 0% VAT (Reverse Charge) during checkout.",
  vat_eligibility_title: "Important: eligibility",
  vat_eligibility_body:
    "0% VAT (reverse charge) applies to VAT-registered businesses in all EU countries except the Czech Republic. Because we invoice under our Czech VAT ID (DIČ), Czech companies cannot use reverse charge and standard Czech VAT applies to their orders.",
  vat_step_1_title: "1. Enter your shipping and billing information",
  vat_step_1_body:
    "When you proceed to checkout from your shopping cart, first fill in your standard contact and delivery details.",
  vat_step_2_title: "2. Fill in your company name and VAT ID",
  vat_step_2_body:
    "To trigger the VAT validation system, fill in the company details fields carefully.",
  vat_step_2_item_1: "Your official Company Name.",
  vat_step_2_item_2:
    "Your valid EU VAT ID including the country prefix, for example DE123456789, FR123456789, or IT123456789. Czech VAT IDs (CZ…) are not eligible for reverse charge.",
  vat_step_3_title: "3. Automatic VIES verification and 0% VAT application",
  vat_step_3_body:
    "Our system automatically verifies your VAT ID in real time through the official EU VIES database. If your VAT ID is active for cross-border transactions and registered outside the Czech Republic, the total amount is recalculated immediately and the VAT rate drops to 0%.",
  vat_notice_title: "Notice: Bank transfer / wire transfer available",
  vat_notice_body:
    "Need to pay via invoice or standard bank transfer? You can select Bank Deposit / Wire Transfer as your payment method during checkout. Once your order is placed, you will receive our bank details and payment instructions automatically.",
  vat_support_title: "Need help?",
  vat_support_body:
    "If you are not sure whether your VAT ID is eligible, or if you need help with a B2B order, contact our team and we will guide you through the process.",
  vat_support_button: "Contact support",
}

const CB_EN: Record<string, string> = {
  cb_eyebrow: "B2B custom branding",
  cb_title: "Custom Branding",
  cb_lead: "Put your logo on the products you use",
  cb_intro:
    "Make our products your own. With custom branding we personalize our proven washroom products with your logo, so every detail reflects your business. Ideal for restaurants, hotels, facility and cleaning companies, offices and chains that want a consistent, professional impression across all locations. All we need is your logo — we take care of the rest.",
  cb_cta_label: "Request a quote",
  cb_why_title: "Why choose custom branding",
  cb_why_1_title: "Proven products",
  cb_why_1_body:
    "Every item is the result of intensive development and engineered for reliable performance. Your logo goes on a product that already works.",
  cb_why_2_title: "A simple process",
  cb_why_2_body:
    "We only need your logo to prepare your personalized products, and we keep every step easy.",
  cb_why_3_title: "Support all the way",
  cb_why_3_body:
    "Our team guides you through the whole process, from the first idea to delivery.",
  cb_ways_title: "Two ways to brand our products",
  cb_way_print_title: "Printed branding",
  cb_way_print_body: "Your logo printed directly onto the product.",
  cb_way_cutout_title: "Logo cut-out",
  cb_way_cutout_body:
    "Your logo integrated into the material itself as a unique cut-out — a distinctive, premium finish that no other manufacturer offers.",
  cb_beyond_title: "Customize beyond the product",
  cb_beyond_pack_title: "Packaging & labels",
  cb_beyond_pack_body:
    "Add your logo, company details, product names and descriptions, EAN codes and more to boxes, master cases or individual product bags.",
  cb_beyond_mix_title: "Colour & fragrance",
  cb_beyond_mix_body:
    "Create your own signature combination of colour and scent from our range.",
  cb_pricing_title: "Commercial terms",
  cb_pricing_desc:
    "Published fees: one-time setup, per-unit branding, and optional packaging labels.",
  cb_card_1_title: "One-time entry fee",
  cb_card_1_item_1:
    "Option A: Logo cut-out — one-time fee of 350 EUR per product (mold inserts).",
  cb_card_1_item_2:
    "Option B: Print — one-time fee of 120 EUR per product (printing plates).",
  cb_card_2_title: "Branding cost",
  cb_card_2_item_1:
    "Option A: Logo cut-out is free of charge after paying the entry fee.",
  cb_card_2_item_2:
    "Option B: Logo print is charged at +0.02 EUR per piece. Exception: frësh drop and ëz trap are free of charge.",
  cb_card_3_title: "Custom labels on packaging",
  cb_card_3_item_1: "B&W labels on boxes and master cases: free of charge.",
  cb_card_3_item_2: "Color labels: +0.02 EUR per product piece.",
  cb_card_3_item_3:
    "Additional labels on cellophane bags: B&W +0.02 EUR, color +0.06 EUR per bag.",
  cb_card_3_item_4:
    "Labels can include logo, address, product names, descriptions, EAN codes, and related data.",
  cb_good_title: "Good to know",
  cb_good_1:
    "The minimum order quantity depends on the specific product you choose.",
  cb_good_2:
    "A one-time set-up fee applies for each product you wish to brand — it covers the tooling and preparation needed to reproduce your branding.",
  cb_good_3:
    "All branded products are made to order, to your specification.",
  cb_good_4:
    "We share the exact minimum quantities, pricing and lead times together with your quote, once we understand your specific requirements.",
  cb_good_5:
    "Production takes place in Mexico; products are delivered to the European hub in the Czech Republic.",
  cb_good_6: "Typical production and delivery time is 6 to 10 weeks.",
  cb_good_7: "All customized products must be paid 100% in advance.",
  cb_form_title: "Interested?",
  cb_form_desc:
    "Send us your specific request and one of our sales representatives will contact you directly to discuss the details.",
  cb_label_name: "Name",
  cb_label_company: "Company name",
  cb_label_email: "Email",
  cb_label_phone: "Phone",
  cb_label_products: "Products for custom branding",
  cb_products_hint:
    "Enter a quantity for the products you want to brand. You do not need to fill in every product — we will discuss details after your inquiry.",
  cb_label_quantity: "Qty (pcs)",
  cb_label_message: "Message",
  cb_submit_label: "Send message",
  cb_form_success: "Thank you — we will get back to you shortly.",
  cb_alert_select:
    "Please enter a quantity for at least one product. You do not need to order every product.",
}

/** Keep brand/product names untranslated. ASCII tokens survive Google Translate. */
function protect(s: string): string {
  return s
    .replace(/Eco-One™/g, "__ECOONE__")
    .replace(/ëkcos/gi, "__EKCOS__")
    .replace(/frësh drop/gi, "__FRESHDROP__")
    .replace(/Fresh Drop/g, "__FRESHDROP_CAP__")
    .replace(/EZ Trap/g, "__EZTRAP__")
    .replace(/ëz trap/gi, "__EZTRAP__")
    .replace(/B2B/g, "__B2B__")
    .replace(/VIES/g, "__VIES__")
    .replace(/DIČ/g, "__DIC__")
    .replace(/EAN/g, "__EAN__")
    .replace(/EUR/g, "__EUR__")
    .replace(/Bank Deposit \/ Wire Transfer/g, "__BANKWIRE__")
    .replace(/Reverse Charge/gi, "__REVCHARGE__")
    .replace(/reverse charge/g, "__revcharge__")
}

function unprotect(s: string): string {
  return s
    .replace(/__ECOONE__/g, "Eco-One™")
    .replace(/__EKCOS__/gi, "ëkcos")
    .replace(/__FRESHDROP__/gi, "frësh drop")
    .replace(/__FRESHDROP_CAP__/g, "Fresh Drop")
    .replace(/__EZTRAP__/gi, "EZ Trap")
    .replace(/__B2B__/g, "B2B")
    .replace(/__VIES__/g, "VIES")
    .replace(/__DIC__/g, "DIČ")
    .replace(/__EAN__/g, "EAN")
    .replace(/__EUR__/g, "EUR")
    .replace(/__BANKWIRE__/g, "Bank Deposit / Wire Transfer")
    .replace(/__REVCHARGE__/g, "Reverse Charge")
    .replace(/__revcharge__/g, "reverse charge")
    // legacy unicode protect leftovers
    .replace(/⟦([^⟧]*)⟧/g, "$1")
    .replace(/…/g, "...")
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
  const json = (await res.json()) as { data?: any; errors?: unknown }
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 2000))
  return json.data
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

async function translateOne(text: string, to: string): Promise<string> {
  // Keep product/brand title as-is for page titles that should stay branded
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

/** Shopify Liquid does not accept backslash-escaped quotes in assign strings. */
function liquidAssign(key: string, value: string): string {
  const cleaned = value.replace(/\u2026/g, "...").replace(/\r?\n/g, " ")
  if (!cleaned.includes("'")) {
    return `    {% assign ${key} = '${cleaned.replace(/\\/g, "\\\\")}' %}`
  }
  if (!cleaned.includes('"')) {
    return `    {% assign ${key} = "${cleaned.replace(/\\/g, "\\\\")}" %}`
  }
  // Both quote types present — strip double quotes (rare in these pages)
  const safe = cleaned.replace(/"/g, "'")
  return `    {% assign ${key} = "${safe.replace(/\\/g, "\\\\")}" %}`
}

function buildWhenBlock(
  lang: string,
  map: Record<string, string>,
): string {
  const lines = [`  {% when '${lang}' %}`]
  for (const [key, value] of Object.entries(map)) {
    lines.push(liquidAssign(key, value))
  }
  return lines.join("\n")
}

function injectWhenBlocks(liquid: string, blocks: string): string {
  const marker = "{% endcase %}"
  const idx = liquid.indexOf(marker)
  if (idx < 0) throw new Error("endcase not found")
  // Insert before first endcase (the language case)
  return liquid.slice(0, idx) + blocks + "\n" + liquid.slice(idx)
}

function mapFromCache(
  en: Record<string, string>,
  pack: string,
  cache: Record<string, Record<string, string>>,
  prefix: string,
): Record<string, string> {
  const out: Record<string, string> = {}
  const packCache = cache[pack] ?? {}
  for (const [key, value] of Object.entries(en)) {
    const ck = `${prefix}:${key}`
    if (key === "vat_title") {
      out[key] = packCache[ck] || "B2B & 0% VAT Guide"
      continue
    }
    const cached = packCache[ck]
    if (!cached) {
      throw new Error(`Missing cache ${pack}.${ck}`)
    }
    out[key] = unprotect(cached)
  }
  return out
}

async function translateMap(
  en: Record<string, string>,
  pack: string,
  cache: Record<string, Record<string, string>>,
  prefix: string,
): Promise<Record<string, string>> {
  cache[pack] ??= {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(en)) {
    const ck = `${prefix}:${key}`
    if (cache[pack][ck]) {
      out[key] = unprotect(cache[pack][ck])
      continue
    }
    // Keep official page title brand-style for B2B guide
    if (key === "vat_title") {
      out[key] = "B2B & 0% VAT Guide"
    } else {
      out[key] = await translateOne(value, pack)
      await new Promise((r) => setTimeout(r, 200))
    }
    cache[pack][ck] = out[key]
  }
  saveCache(cache)
  return out
}

async function upsertThemeFile(
  domain: string,
  token: string,
  filename: string,
  body: string,
) {
  if (DRY) {
    console.log(`  dry-run upsert ${filename} (${body.length} bytes)`)
    return
  }
  const data = await gql(
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
      files: [
        {
          filename,
          body: { type: "TEXT", value: body },
        },
      ],
    },
  )
  const errs = data.themeFilesUpsert.userErrors
  if (errs?.length) throw new Error(JSON.stringify(errs))
  console.log(`  upserted ${filename}`)
}

async function main() {
  const creds = loadCreds()
  const token = await getToken(creds)
  const cache = loadCache()

  const b2bPath = join(ROOT, "shopify/sections/b2b-vat-guide.liquid")
  const cbPath = join(ROOT, "shopify/sections/custom-branding.liquid")
  let b2b = readFileSync(b2bPath, "utf8")
  let cb = readFileSync(cbPath, "utf8")

  const b2bBlocks: string[] = []
  const cbBlocks: string[] = []

  for (const pack of MISSING) {
    console.log(`\n${FROM_CACHE ? "Loading" : "Translating"} ${pack}…`)
    const b2bMap = FROM_CACHE
      ? mapFromCache(B2B_EN, pack, cache, "b2b")
      : await translateMap(B2B_EN, pack, cache, "b2b")
    const cbMap = FROM_CACHE
      ? mapFromCache(CB_EN, pack, cache, "cb")
      : await translateMap(CB_EN, pack, cache, "cb")
    b2bBlocks.push(buildWhenBlock(pack, b2bMap))
    cbBlocks.push(buildWhenBlock(pack, cbMap))
    console.log(`  B2B lead: ${b2bMap.vat_lead.slice(0, 60)}`)
    console.log(`  CB title: ${cbMap.cb_title}`)
  }

  // Only inject if not already present
  for (const pack of MISSING) {
    if (b2b.includes(`{% when '${pack}' %}`)) {
      console.warn(`B2B already has ${pack}, skipping inject`)
    }
  }
  const needB2b = MISSING.some((p) => !b2b.includes(`{% when '${p}' %}`))
  const needCb = MISSING.some((p) => !cb.includes(`{% when '${p}' %}`))

  if (needB2b) {
    // Remove any partial missing whens if re-run — only inject missing ones
    const toAdd = b2bBlocks.filter((block) => {
      const m = block.match(/when '(\w+)'/)
      return m && !b2b.includes(`{% when '${m[1]}' %}`)
    })
    b2b = injectWhenBlocks(b2b, toAdd.join("\n"))
    writeFileSync(b2bPath, b2b)
    console.log("\nUpdated local b2b-vat-guide.liquid")
  }
  if (needCb) {
    const toAdd = cbBlocks.filter((block) => {
      const m = block.match(/when '(\w+)'/)
      return m && !cb.includes(`{% when '${m[1]}' %}`)
    })
    cb = injectWhenBlocks(cb, toAdd.join("\n"))
    writeFileSync(cbPath, cb)
    console.log("Updated local custom-branding.liquid")
  }

  // Re-read after write
  b2b = readFileSync(b2bPath, "utf8")
  cb = readFileSync(cbPath, "utf8")

  console.log("\nPushing theme files…")
  await upsertThemeFile(creds.domain, token, "sections/b2b-vat-guide.liquid", b2b)
  await upsertThemeFile(
    creds.domain,
    token,
    "sections/custom-branding.liquid",
    cb,
  )

  // Page titles (+ B2B body)
  console.log("\nRegistering page translations…")
  const pages = [
    {
      id: "gid://shopify/Page/164880089431",
      titles: {
        // keep brand-style title; localize where natural
        bg: "B2B & 0% VAT Guide",
        hr: "B2B & 0% VAT Guide",
        cs: "B2B & 0% VAT Guide",
        da: "B2B & 0% VAT Guide",
        nl: "B2B & 0% VAT Guide",
        et: "B2B & 0% VAT Guide",
        fi: "B2B & 0% VAT Guide",
        fr: "Guide B2B et TVA 0%",
        de: "B2B- und 0%-MwSt.-Leitfaden",
        el: "B2B & 0% VAT Guide",
        hu: "B2B és 0% áfa útmutató",
        it: "Guida B2B e IVA 0%",
        lv: "B2B un 0% PVN rokasgrāmata",
        lt: "B2B ir 0% PVM vadovas",
        pl: "Przewodnik B2B i 0% VAT",
        pt: "Guia B2B e IVA 0%",
        ro: "Ghid B2B și TVA 0%",
        sk: "Sprievodca B2B a 0 % DPH",
        es: "Guía B2B y IVA 0%",
        sv: "B2B & 0% moms Guide",
      } as Record<string, string>,
    },
    {
      id: "gid://shopify/Page/164969218391",
      titles: {
        bg: "Custom Branding",
        hr: "Custom Branding",
        cs: "Vlastní branding",
        da: "Custom Branding",
        nl: "Custom Branding",
        et: "Custom Branding",
        fi: "Custom Branding",
        fr: "Custom Branding",
        de: "Individuelles Branding",
        el: "Custom Branding",
        hu: "Egyedi branding",
        it: "Branding personalizzato",
        lv: "Custom Branding",
        lt: "Custom Branding",
        pl: "Własny branding",
        pt: "Custom Branding",
        ro: "Custom Branding",
        sk: "Vlastný branding",
        es: "Branding personalizado",
        sv: "Custom Branding",
      } as Record<string, string>,
    },
  ]

  // Prefer localized Custom Branding titles from translation cache
  for (const pack of [...EXISTING, ...MISSING]) {
    const cached = cache[pack]?.["cb:cb_title"]
    if (cached) pages[1].titles[pack] = unprotect(cached)
  }

  for (const page of pages) {
    const meta = await gql(
      creds.domain,
      token,
      `query($id:ID!){translatableResource(resourceId:$id){translatableContent{key value digest}}}`,
      { id: page.id },
    )
    const titleContent = meta.translatableResource.translatableContent.find(
      (c: { key: string }) => c.key === "title",
    )
    const bodyContent = meta.translatableResource.translatableContent.find(
      (c: { key: string }) => c.key === "body_html",
    )

    const allPacks = [...EXISTING, ...MISSING]
    for (const pack of allPacks) {
      const locale = shopifyLocale(pack)
      const translations: {
        key: string
        value: string
        locale: string
        translatableContentDigest: string
      }[] = []
      if (titleContent && page.titles[pack]) {
        translations.push({
          key: "title",
          value: page.titles[pack],
          locale,
          translatableContentDigest: titleContent.digest,
        })
      }
      // Page body is unused — copy lives in theme section case blocks.
      void bodyContent
      if (!translations.length || DRY) continue
      const data = await gql(
        creds.domain,
        token,
        `mutation($resourceId:ID!,$translations:[TranslationInput!]!){translationsRegister(resourceId:$resourceId,translations:$translations){userErrors{message}}}`,
        { resourceId: page.id, translations },
      )
      const errs = data.translationsRegister.userErrors
      if (errs?.length) console.warn(`  ${pack} page errs`, errs)
      else console.log(`  ${pack} page ok (${translations.length})`)
    }
  }

  console.log(DRY ? "\n(dry-run done)" : "\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
