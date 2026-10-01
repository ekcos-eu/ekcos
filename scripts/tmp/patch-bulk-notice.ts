import { readFileSync, writeFileSync } from "fs"

const cfg = JSON.parse(readFileSync(".cursor/mcp.json", "utf8"))
const args = cfg.mcpServers.shopify.args as string[]
const after = (f: string) => args[args.indexOf(f) + 1]
const domain = after("--domain")
const clientId = after("--clientId")
const clientSecret = after("--clientSecret")

const tokRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }),
})
const { access_token: token } = (await tokRes.json()) as { access_token: string }

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  })
  const j = (await res.json()) as { data?: T; errors?: unknown }
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 2000))
  return j.data as T
}

const themeId = "gid://shopify/OnlineStoreTheme/196215472471"
const blockId = "custom_liquid_YrNjX7"

type ThemeFiles = {
  theme: {
    files: {
      nodes: Array<{
        filename: string
        body: { content?: string }
      }>
    }
  }
}

const data = await gql<ThemeFiles>(
  `query($id:ID!,$names:[String!]!){
    theme(id:$id){
      files(filenames:$names, first:5){
        nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } }
      }
    }
  }`,
  { id: themeId, names: ["templates/product.product-landing.json"] },
)

const content = data.theme.files.nodes[0]?.body?.content
if (!content) throw new Error("Missing product-landing template")

writeFileSync("scripts/tmp/product-landing-raw.json", content)

const commentMatch = content.match(/^\/\*[\s\S]*?\*\/\s*/)
const headerComment = commentMatch?.[0] ?? ""
const jsonBody = content.slice(headerComment.length)

const tpl = JSON.parse(jsonBody) as {
  sections: Record<
    string,
    {
      blocks?: Record<
        string,
        { type: string; settings: { custom_liquid?: string } }
      >
    }
  >
}

let block: { type: string; settings: { custom_liquid?: string } } | undefined
let sectionKey = ""
for (const [sk, section] of Object.entries(tpl.sections)) {
  if (section.blocks?.[blockId]) {
    block = section.blocks[blockId]
    sectionKey = sk
    break
  }
}
if (!block?.settings.custom_liquid) {
  throw new Error(`Block ${blockId} not found`)
}

const liveLiquid = block.settings.custom_liquid
writeFileSync("scripts/tmp/quantity-discount-live.liquid", liveLiquid)
console.log("section", sectionKey, "liquid len", liveLiquid.length)

const localizedNotice = `{% assign _loc = request.locale.iso_code | default: 'en' %}
{% if _loc == 'pt-PT' or _loc == 'pt' %}
  {% assign _loc = 'pt' %}
{% endif %}
  <div class="bulk-order-notice">
    {% case _loc %}
    {% when 'bg' %}
      За по-големи поръчки (<strong>{{ bulk_qty }}+ бр.</strong>) се свържете с нас на
    {% when 'hr' %}
      Za veće narudžbe (<strong>{{ bulk_qty }}+ kom.</strong>) kontaktirajte nas na
    {% when 'cs' %}
      Pro větší objednávky (<strong>{{ bulk_qty }}+ ks</strong>) nás kontaktujte na
    {% when 'da' %}
      Ved større ordrer (<strong>{{ bulk_qty }}+ stk.</strong>) kontakt os på
    {% when 'nl' %}
      Voor grotere bestellingen (<strong>{{ bulk_qty }}+ stuks</strong>) neem contact op via
    {% when 'et' %}
      Suuremate tellimuste (<strong>{{ bulk_qty }}+ tk</strong>) korral võtke meiega ühendust
    {% when 'fi' %}
      Suuremmissa tilauksissa (<strong>{{ bulk_qty }}+ kpl</strong>) ota yhteyttä
    {% when 'fr' %}
      Pour les commandes en volume (<strong>{{ bulk_qty }}+ pcs</strong>), contactez-nous à
    {% when 'de' %}
      Bei größeren Bestellungen (<strong>{{ bulk_qty }}+ Stk.</strong>) kontaktieren Sie uns unter
    {% when 'el' %}
      Για μαζικές παραγγελίες (<strong>{{ bulk_qty }}+ τεμ.</strong>) επικοινωνήστε στο
    {% when 'hu' %}
      Nagyobb rendelésnél (<strong>{{ bulk_qty }}+ db</strong>) írjon nekünk:
    {% when 'it' %}
      Per ordini maggiori (<strong>{{ bulk_qty }}+ pz</strong>) contattaci a
    {% when 'lv' %}
      Lielākiem pasūtījumiem (<strong>{{ bulk_qty }}+ gab.</strong>) sazinieties ar mums:
    {% when 'lt' %}
      Didesniems užsakymams (<strong>{{ bulk_qty }}+ vnt.</strong>) susisiekite:
    {% when 'pl' %}
      Przy większych zamówieniach (<strong>{{ bulk_qty }}+ szt.</strong>) napisz do nas:
    {% when 'pt' %}
      Para encomendas maiores (<strong>{{ bulk_qty }}+ un.</strong>), contacte-nos em
    {% when 'ro' %}
      Pentru comenzi mai mari (<strong>{{ bulk_qty }}+ buc.</strong>) contactați-ne la
    {% when 'sk' %}
      Pri väčších objednávkach (<strong>{{ bulk_qty }}+ ks</strong>) nás kontaktujte na
    {% when 'es' %}
      Para pedidos mayores (<strong>{{ bulk_qty }}+ uds.</strong>), contáctenos en
    {% when 'sv' %}
      Vid större beställningar (<strong>{{ bulk_qty }}+ st</strong>) kontakta oss på
    {% else %}
      For bulk orders (<strong>{{ bulk_qty }}+ pcs</strong>), please contact us at
    {% endcase %}
    <a href="mailto:support@ekcos.eu">support@ekcos.eu</a>
  </div>`

const oldNoticeRe =
  /<div class="bulk-order-notice">[\s\S]*?<\/div>/

if (!oldNoticeRe.test(liveLiquid)) {
  throw new Error("bulk-order-notice div not found in live liquid")
}

const patched = liveLiquid.replace(oldNoticeRe, localizedNotice.trim())
if (patched === liveLiquid) throw new Error("No change applied")
if (!patched.includes("{% when 'bg' %}")) throw new Error("BG locale missing after patch")

block.settings.custom_liquid = patched
writeFileSync("scripts/tmp/quantity-discount-patched.liquid", patched)

const newContent = `${headerComment}${JSON.stringify(tpl, null, 2)}\n`
writeFileSync("scripts/tmp/product-landing-patched.json", newContent)

type UpsertResult = {
  themeFilesUpsert: {
    upsertedThemeFiles: Array<{ filename: string }> | null
    userErrors: Array<{ field: string[]; message: string }>
  }
}

const upsert = await gql<UpsertResult>(
  `mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
    themeFilesUpsert(themeId: $themeId, files: $files) {
      upsertedThemeFiles { filename }
      userErrors { field message }
    }
  }`,
  {
    themeId,
    files: [
      {
        filename: "templates/product.product-landing.json",
        body: { type: "TEXT", value: newContent },
      },
    ],
  },
)

console.log(JSON.stringify(upsert.themeFilesUpsert, null, 2))
console.log("done")
