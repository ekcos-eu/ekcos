/**
 * Translate App Hero / Sales Motivator free-gift UI metafields.
 * Campaign banner "Spend 60€…" lives on AppHero CDN — not editable via API;
 * translations for that are written to scripts/tmp/apphero-campaign-i18n.json
 * for paste in the App Hero admin.
 *
 *   bun scripts/sync-shopify-apphero-i18n.ts
 */
import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { translate } from "google-translate-api-x"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const CACHE = join(ROOT, "scripts/tmp/shopify-apphero-i18n-cache.json")
const CAMPAIGN_OUT = join(ROOT, "scripts/tmp/apphero-campaign-i18n.json")
const API = "2025-01"
const DRY = process.argv.includes("--dry-run")

const SHOPIFY_LOCALE: Record<string, string> = { pt: "pt-PT" }
const PACK = [
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

const PLACEHOLDERS = [
  "GIFT_NAME",
  "PRODUCT_NAME",
  "TYPE_VALUES",
  "ORDER_MINIMUM",
  "TO_SPEND",
  "CONDITIONAL_PRODUCTS",
  "UNTIL_DATE",
]

/** Curated campaign banner + popup (App Hero admin paste). */
const CAMPAIGN_CURATED: Record<
  string,
  { banner: string; popupTitle: string; popupSub: string; freeGift: string }
> = {
  cs: {
    banner: "Utraťte 60€ a získejte frësh drop base + insert",
    popupTitle: "<b>Gratulujeme! Odemkli jste dárek!</b>",
    popupSub: "Vyzvedněte si dárek zdarma!",
    freeGift: "Dárek zdarma",
  },
  nl: {
    banner: "Besteed 60€ en krijg frësh drop base + insert",
    popupTitle: "<b>Gefeliciteerd! Je hebt een cadeau ontgrendeld!</b>",
    popupSub: "Claim nu je gratis cadeau!",
    freeGift: "Gratis cadeau",
  },
  de: {
    banner: "Gib 60€ aus und erhalte frësh drop base + insert",
    popupTitle: "<b>Glückwunsch! Du hast ein Geschenk freigeschaltet!</b>",
    popupSub: "Hol dir jetzt dein Gratisgeschenk!",
    freeGift: "Gratisgeschenk",
  },
  sk: {
    banner: "Minite 60€ a získajte frësh drop base + insert",
    popupTitle: "<b>Gratulujeme! Odomkli ste darček!</b>",
    popupSub: "Vyzdvihnite si darček zadarmo!",
    freeGift: "Darček zadarmo",
  },
  fr: {
    banner: "Dépensez 60€ et obtenez frësh drop base + insert",
    popupTitle: "<b>Bravo ! Vous avez débloqué un cadeau !</b>",
    popupSub: "Réclamez votre cadeau gratuit !",
    freeGift: "Cadeau gratuit",
  },
  es: {
    banner: "Gasta 60€ y consigue frësh drop base + insert",
    popupTitle: "<b>¡Enhorabuena! Has desbloqueado un regalo!</b>",
    popupSub: "¡Reclama tu regalo gratis!",
    freeGift: "Regalo gratis",
  },
  it: {
    banner: "Spendi 60€ e ricevi frësh drop base + insert",
    popupTitle: "<b>Congratulazioni! Hai sbloccato un regalo!</b>",
    popupSub: "Richiedi subito il tuo regalo gratis!",
    freeGift: "Regalo gratis",
  },
  pl: {
    banner: "Wydaj 60€ i otrzymaj frësh drop base + insert",
    popupTitle: "<b>Gratulacje! Odblokowałeś prezent!</b>",
    popupSub: "Odbierz darmowy prezent!",
    freeGift: "Darmowy prezent",
  },
  pt: {
    banner: "Gaste 60€ e receba frësh drop base + insert",
    popupTitle: "<b>Parabéns! Desbloqueou um presente!</b>",
    popupSub: "Receba o seu presente grátis!",
    freeGift: "Presente grátis",
  },
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
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 1500))
  return json.data
}

function shopifyLocale(pack: string) {
  return SHOPIFY_LOCALE[pack] ?? pack
}

function protect(s: string): string {
  let out = s
  for (const p of PLACEHOLDERS) {
    out = out.replaceAll(p, `⟦${p}⟧`)
  }
  return out
    .replace(/frësh drop/gi, "⟦FRESHDROP⟧")
    .replace(/ëkcos/gi, "⟦EKCOS⟧")
    .replace(/60€/g, "⟦60EUR⟧")
    .replace(/<\/?[a-z][^>]*>/gi, (m) => `⟦${Buffer.from(m).toString("base64")}⟧`)
}

function unprotect(s: string): string {
  return s
    .replace(/⟦FRESHDROP⟧/gi, "frësh drop")
    .replace(/⟦EKCOS⟧/gi, "ëkcos")
    .replace(/⟦60EUR⟧/g, "60€")
    .replace(/⟦([A-Z0-9_]+)⟧/g, (_, p) =>
      PLACEHOLDERS.includes(p) ? p : _,
    )
    .replace(/⟦([A-Za-z0-9+/=]+)⟧/g, (_, b64) => {
      try {
        const decoded = Buffer.from(b64, "base64").toString("utf8")
        if (decoded.startsWith("<")) return decoded
        return PLACEHOLDERS.includes(b64) ? b64 : decoded
      } catch {
        return _
      }
    })
}

async function translateOne(text: string, to: string): Promise<string> {
  if (typeof text !== "string" || !text.trim()) return text
  // skip pure numbers / flags
  if (/^\d+$/.test(text)) return text
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
    } catch (e) {
      attempt++
      if (attempt >= 5) return text
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
}

async function translateLabelsJson(
  en: Record<string, unknown>,
  pack: string,
  cache: Record<string, Record<string, string>>,
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = { ...en }
  cache[pack] ??= {}
  for (const [k, v] of Object.entries(en)) {
    if (typeof v !== "string") {
      out[k] = v
      continue
    }
    const cacheKey = `label:${k}:${v}`
    if (cache[pack][cacheKey]) {
      out[k] = cache[pack][cacheKey]
      continue
    }
    const tr = await translateOne(v, pack)
    cache[pack][cacheKey] = tr
    out[k] = tr
    await new Promise((r) => setTimeout(r, 250))
  }
  return out
}

async function main() {
  const creds = loadCreds()
  const token = await getToken(creds)
  const cache: Record<string, Record<string, string>> = existsSync(CACHE)
    ? JSON.parse(readFileSync(CACHE, "utf8"))
    : {}
  const save = () => {
    mkdirSync(join(ROOT, "scripts/tmp"), { recursive: true })
    writeFileSync(CACHE, JSON.stringify(cache, null, 2))
  }

  // Load EN metafields
  const shop = await gql(
    creds.domain,
    token,
    `{ shop { metafield(namespace:"sales_motivator", key:"sm_translations_labels"){id value} design: metafield(namespace:"sales_motivator", key:"sm_desing_settings"){id value} } }`,
  )
  const labelsMf = shop.shop.metafield
  const designMf = shop.shop.design
  const labelsEn = JSON.parse(labelsMf.value) as Record<string, unknown>
  const designEn = JSON.parse(designMf.value) as Record<string, unknown>

  const labelsDigest = createHash("sha256")
    .update(labelsMf.value, "utf8")
    .digest("hex")
  const designDigest = createHash("sha256")
    .update(designMf.value, "utf8")
    .digest("hex")

  // Verify digests via API
  const trLabels = await gql(
    creds.domain,
    token,
    `query($id:ID!){translatableResource(resourceId:$id){translatableContent{digest value}}}`,
    { id: labelsMf.id },
  )
  const trDesign = await gql(
    creds.domain,
    token,
    `query($id:ID!){translatableResource(resourceId:$id){translatableContent{digest value}}}`,
    { id: designMf.id },
  )
  const labelsApiDigest =
    trLabels.translatableResource.translatableContent[0].digest
  const designApiDigest =
    trDesign.translatableResource.translatableContent[0].digest

  console.log("labels digest ok", labelsDigest === labelsApiDigest)
  console.log("design digest ok", designDigest === designApiDigest)

  const campaignOut: Record<string, unknown> = {
    note: "Paste these into App Hero → Free Gift campaign content (banner/popup). CDN-hosted; not writable via Shopify Admin API.",
    en: {
      banner: "Spend 60€ and get frësh drop base + insert",
      popupTitle: "<b>Congrats! You've unlocked a gift!</b>",
      popupSub: "Claim your free gift now!",
      freeGift: "Free Gift",
    },
  }

  for (const pack of PACK) {
    const locale = shopifyLocale(pack)
    console.log(`\n== ${pack} (${locale}) ==`)

    const labelsTr = await translateLabelsJson(labelsEn, pack, cache)
    save()

    const designTr = { ...designEn }
    const freeGift =
      CAMPAIGN_CURATED[pack]?.freeGift ??
      (await translateOne(String(designEn.giftIconTextValue ?? "Free Gift"), pack))
    designTr.giftIconTextValue = freeGift
    if (typeof designEn.propertyKey === "string") {
      designTr.propertyKey =
        cache[pack][`design:propertyKey`] ??
        (await translateOne(designEn.propertyKey, pack))
      cache[pack][`design:propertyKey`] = String(designTr.propertyKey)
    }
    save()

    const camp =
      CAMPAIGN_CURATED[pack] ??
      ({
        banner: await translateOne(
          "Spend 60€ and get frësh drop base + insert",
          pack,
        ),
        popupTitle: await translateOne(
          "<b>Congrats! You've unlocked a gift!</b>",
          pack,
        ),
        popupSub: await translateOne("Claim your free gift now!", pack),
        freeGift,
      } as const)
    campaignOut[pack] = camp
    console.log(`  banner: ${camp.banner}`)
    console.log(`  Free Gift → ${freeGift}`)

    if (DRY) continue

    for (const [resourceId, digest, value] of [
      [labelsMf.id, labelsApiDigest, JSON.stringify(labelsTr)],
      [designMf.id, designApiDigest, JSON.stringify(designTr)],
    ] as const) {
      const data = await gql(
        creds.domain,
        token,
        `mutation($resourceId:ID!,$translations:[TranslationInput!]!){translationsRegister(resourceId:$resourceId,translations:$translations){userErrors{message} translations{locale}}}`,
        {
          resourceId,
          translations: [
            {
              key: "value",
              value,
              locale,
              translatableContentDigest: digest,
            },
          ],
        },
      )
      const errs = data.translationsRegister.userErrors
      if (errs?.length) console.warn("  errs", errs)
      else console.log(`  registered metafield ${resourceId.slice(-8)}`)
    }
  }

  mkdirSync(join(ROOT, "scripts/tmp"), { recursive: true })
  writeFileSync(CAMPAIGN_OUT, JSON.stringify(campaignOut, null, 2))
  console.log(`\nWrote campaign paste pack → ${CAMPAIGN_OUT}`)
  console.log(
    "App Hero banner/popup must be set in the App Hero admin (or per-market campaigns) — API cannot write their CDN files.",
  )
  console.log(DRY ? "(dry-run)" : "Done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
