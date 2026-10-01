/**
 * Translate product modal / featured-product leftovers on the homepage:
 * Shipping information accordion, Share, guarantee body texts, View full details.
 *
 *   bun scripts/sync-shopify-product-modal-i18n.ts
 *   bun scripts/sync-shopify-product-modal-i18n.ts --dry-run
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { translate } from "google-translate-api-x"

const ROOT = join(import.meta.dir, "..")
const MCP = join(ROOT, ".cursor/mcp.json")
const CACHE_PATH = join(ROOT, "scripts/tmp/shopify-product-modal-i18n-cache.json")
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

const TARGET_ENS = new Set([
  "Shipping information",
  "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>",
  "Share",
  "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>",
  "<p>Delivers a cleaner, more comfortable experience by minimizing urine splashback and unpleasant odors.</p>",
  "<p>Up to 60 days of freshness means fewer cleanings and reduced expenses.</p><p></p><p></p>",
  "<p>Up to 60 days of freshness means fewer cleanings and reduced expenses.</p>",
  "<p>Direct access to original Ekcos products with fast delivery and fair pricing</p>",
  "View full details",
  "<p>Fast delivery options with tracking<br/>No EU import duties</p>",
])

/** Hand-tuned for key shop locales. */
const CURATED: Record<string, Partial<Record<string, string>>> = {
  cs: {
    "Shipping information": "Informace o dopravě",
    Share: "Sdílet",
    "View full details": "Zobrazit všechny detaily",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Bez dovozních cel v EU.<br/>- Odesíláme do 1–2 pracovních dnů.<br/>- Posíláme v plně recyklovatelných a biologicky rozložitelných boxech.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Vyrobeno z recyklovaného EVA plastu a až z 99 % biologicky rozložitelné díky Eco-One™.</p>",
    "<p>Fast delivery options with tracking<br/>No EU import duties</p>":
      "<p>Rychlé dodání se sledováním<br/>Bez dovozních cel v EU</p>",
  },
  nl: {
    "Shipping information": "Verzendinformatie",
    Share: "Delen",
    "View full details": "Bekijk alle details",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Geen EU-invoerrechten.<br/>- Verzending binnen 1-2 werkdagen.<br/>- Verzonden in onze volledig recyclebare en biologisch afbreekbare signature boxen.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Gemaakt van gerecycled EVA-plastic en tot 99% biologisch afbreekbaar met Eco-One™.</p>",
    "<p>Fast delivery options with tracking<br/>No EU import duties</p>":
      "<p>Snelle leveringsopties met tracking<br/>Geen EU-invoerrechten</p>",
  },
  de: {
    "Shipping information": "Versandinformationen",
    Share: "Teilen",
    "View full details": "Alle Details anzeigen",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Keine EU-Einfuhrzölle.<br/>- Versand innerhalb von 1–2 Werktagen.<br/>- Versand in unseren vollständig recyclingfähigen und biologisch abbaubaren Signature-Boxen.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Hergestellt aus recyceltem EVA-Kunststoff und bis zu 99 % biologisch abbaubar mit Eco-One™.</p>",
  },
  sk: {
    "Shipping information": "Informácie o doprave",
    Share: "Zdieľať",
    "View full details": "Zobraziť všetky detaily",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Bez dovozných ciel v EÚ.<br/>- Odosielame do 1–2 pracovných dní.<br/>- Posielame v plne recyklovateľných a biologicky rozložiteľných boxoch.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Vyrobené z recyklovaného EVA plastu a až z 99 % biologicky rozložiteľné vďaka Eco-One™.</p>",
  },
  fr: {
    "Shipping information": "Informations de livraison",
    Share: "Partager",
    "View full details": "Voir tous les détails",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Pas de droits de douane UE.<br/>- Expédition sous 1 à 2 jours ouvrés.<br/>- Expédié dans nos boîtes signature entièrement recyclables et biodégradables.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Fabriqué à partir de plastique EVA recyclé et jusqu’à 99 % biodégradable avec Eco-One™.</p>",
  },
  es: {
    "Shipping information": "Información de envío",
    Share: "Compartir",
    "View full details": "Ver todos los detalles",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Sin aranceles de importación en la UE.<br/>- Envío en 1-2 días laborables.<br/>- Enviado en nuestras cajas signature totalmente reciclables y biodegradables.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Fabricado con plástico EVA reciclado y hasta un 99 % biodegradable con Eco-One™.</p>",
  },
  it: {
    "Shipping information": "Informazioni sulla spedizione",
    Share: "Condividi",
    "View full details": "Vedi tutti i dettagli",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Nessun dazio di importazione UE.<br/>- Spedizione entro 1-2 giorni lavorativi.<br/>- Spedito nelle nostre scatole signature completamente riciclabili e biodegradabili.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Realizzato in plastica EVA riciclata e fino al 99% biodegradabile con Eco-One™.</p>",
  },
  pl: {
    "Shipping information": "Informacje o wysyłce",
    Share: "Udostępnij",
    "View full details": "Zobacz wszystkie szczegóły",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Bez ceł importowych w UE.<br/>- Wysyłka w ciągu 1–2 dni roboczych.<br/>- Wysyłamy w w pełni nadających się do recyklingu i biodegradowalnych opakowaniach signature.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Wykonane z recyclowanego tworzywa EVA i do 99% biodegradowalne dzięki Eco-One™.</p>",
  },
  pt: {
    "Shipping information": "Informações de envio",
    Share: "Partilhar",
    "View full details": "Ver todos os detalhes",
    "<p>- No EU import duties.<br/>- Ships within 1-2 business days.<br/>- Ships in our fully recyclable and biodegradable signature boxes.</p>":
      "<p>- Sem direitos aduaneiros de importação na UE.<br/>- Envio em 1-2 dias úteis.<br/>- Enviado nas nossas caixas signature totalmente recicláveis e biodegradáveis.</p>",
    "<p>Made from recycled EVA plastic and up to 99% biodegradable with EcoOne™.</p>":
      "<p>Fabricado em plástico EVA reciclado e até 99% biodegradável com Eco-One™.</p>",
  },
}

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

function shopifyLocale(pack: string): string {
  return SHOPIFY_LOCALE[pack] ?? pack
}

function protect(s: string): string {
  return s
    .replace(/<\/?[a-z][^>]*>/gi, (m) => `⟦${Buffer.from(m).toString("base64")}⟧`)
    .replace(/Eco-?One™/gi, "⟦ECOONE⟧")
    .replace(/ëkcos/gi, "⟦EKCOS⟧")
    .replace(/Ekcos/g, "⟦EKCOS_CAP⟧")
}

function unprotect(s: string): string {
  return s
    .replace(/⟦ECOONE⟧/gi, "Eco-One™")
    .replace(/⟦EKCOS⟧/gi, "ëkcos")
    .replace(/⟦EKCOS_CAP⟧/g, "Ekcos")
    .replace(/⟦([A-Za-z0-9+/=]+)⟧/g, (_, b64) => {
      try {
        return Buffer.from(b64, "base64").toString("utf8")
      } catch {
        return _
      }
    })
    .replace(/EcoOne™/g, "Eco-One™")
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

function dictBodies(pack: string): {
  hygiene?: string
  costs?: string
  distributor?: string
} | null {
  const path = join(ROOT, `dictionaries/${pack}.json`)
  if (!existsSync(path)) return null
  const d = JSON.parse(readFileSync(path, "utf8")) as {
    home?: {
      benefits?: {
        hygiene?: { body?: string }
        costs?: { body?: string }
        distributor?: { body?: string }
      }
    }
  }
  const b = d.home?.benefits
  if (!b) return null
  return {
    hygiene: b.hygiene?.body,
    costs: b.costs?.body,
    distributor: b.distributor?.body,
  }
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

async function register(
  domain: string,
  token: string,
  resourceId: string,
  translations: {
    key: string
    value: string
    locale: string
    translatableContentDigest: string
  }[],
) {
  if (DRY || translations.length === 0) return []
  const errors: string[] = []
  for (let i = 0; i < translations.length; i += 25) {
    const chunk = translations.slice(i, i + 25)
    const data = (await gql(
      domain,
      token,
      `mutation($resourceId:ID!,$translations:[TranslationInput!]!){translationsRegister(resourceId:$resourceId,translations:$translations){userErrors{message}}}`,
      { resourceId, translations: chunk },
    )) as {
      translationsRegister: { userErrors: { message: string }[] }
    }
    for (const e of data.translationsRegister?.userErrors ?? []) {
      errors.push(e.message)
    }
  }
  return errors
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
    `query{translatableResources(first:1, resourceType:ONLINE_STORE_THEME_LOCALE_CONTENT){edges{node{resourceId translatableContent{key value digest}}}}}`,
  )) as {
    translatableResources: { edges: { node: Resource }[] }
  }
  const localeRes = localeData.translatableResources.edges[0].node

  const fields: {
    resourceId: string
    key: string
    value: string
    digest: string
  }[] = []

  for (const c of theme.translatableContent) {
    if (!c.value || !TARGET_ENS.has(c.value)) continue
    // Prefer modal / featured-product / product / guarantees / share labels
    const k = c.key
    const relevant =
      k.includes("product.modal") ||
      k.includes("featured-product") ||
      k.includes("product.json") ||
      k.includes("guarantees") ||
      k.includes("share_label") ||
      k.includes("product-landing") ||
      c.value === "Shipping information" ||
      c.value === "Share" ||
      c.value.startsWith("<p>- No EU import") ||
      c.value.startsWith("<p>Made from recycled") ||
      c.value.startsWith("<p>Delivers a cleaner") ||
      c.value.startsWith("<p>Up to 60 days") ||
      c.value.startsWith("<p>Direct access") ||
      c.value.startsWith("<p>Fast delivery options")
    if (relevant) {
      fields.push({
        resourceId: theme.resourceId,
        key: c.key,
        value: c.value,
        digest: c.digest,
      })
    }
  }

  for (const c of localeRes.translatableContent) {
    if (
      c.value === "View full details" &&
      c.key === "products.product.view_full_details"
    ) {
      fields.push({
        resourceId: localeRes.resourceId,
        key: c.key,
        value: c.value,
        digest: c.digest,
      })
    }
    if (
      c.value === "Share" &&
      c.key.startsWith("general.social.alt_text.share_on_")
    ) {
      fields.push({
        resourceId: localeRes.resourceId,
        key: c.key,
        value: c.value,
        digest: c.digest,
      })
    }
  }

  console.log(`Matched ${fields.length} fields`)
  const ens = [...new Set(fields.map((f) => f.value))]
  for (const en of ens) console.log(`  • ${en.slice(0, 80)}`)

  for (const pack of PACK_LOCALES) {
    const locale = shopifyLocale(pack)
    console.log(`\n== ${pack} (${locale}) ==`)
    cache[pack] ??= {}
    const dict = dictBodies(pack)
    const byRes = new Map<
      string,
      {
        key: string
        value: string
        locale: string
        translatableContentDigest: string
      }[]
    >()

    for (const en of ens) {
      let tr = cache[pack][en] ?? CURATED[pack]?.[en]
      if (!tr) {
        if (en.includes("Delivers a cleaner") && dict?.hygiene) {
          tr = `<p>${dict.hygiene}</p>`
        } else if (en.includes("Up to 60 days of freshness") && dict?.costs) {
          tr = en.includes("</p><p></p>")
            ? `<p>${dict.costs}</p><p></p><p></p>`
            : `<p>${dict.costs}</p>`
        } else if (en.includes("Direct access to original") && dict?.distributor) {
          tr = `<p>${dict.distributor}</p>`
        } else {
          tr = await translateOne(en, pack)
          await new Promise((r) => setTimeout(r, 350))
        }
        cache[pack][en] = tr
        saveCache(cache)
      }
      console.log(`  ${en.slice(0, 40)} → ${tr.slice(0, 55)}`)
      for (const f of fields.filter((x) => x.value === en)) {
        const list = byRes.get(f.resourceId) ?? []
        list.push({
          key: f.key,
          value: tr,
          locale,
          translatableContentDigest: f.digest,
        })
        byRes.set(f.resourceId, list)
      }
    }

    for (const [resourceId, translations] of byRes) {
      const errors = await register(
        creds.domain,
        token,
        resourceId,
        translations,
      )
      if (errors.length) console.warn(`  errors:`, errors)
      else
        console.log(
          `  registered ${translations.length}${DRY ? " (dry-run)" : ""}`,
        )
    }
  }

  console.log(DRY ? "\n(dry-run done)" : "\nDone.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
