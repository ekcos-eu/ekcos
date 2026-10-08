/**
 * Update product PDP FAQ accordion (4 key Q&As from content/faq/eshop)
 * + "View all FAQ" button → /pages/faq. Localizes from FAQ JSON (not Google Translate).
 *
 *   bun scripts/update-shopify-product-faq.ts
 *   bun scripts/update-shopify-product-faq.ts --dry-run
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dir, '..')
const MCP = join(ROOT, '.cursor/mcp.json')
const FAQ_DIR = join(ROOT, 'content/faq/eshop')
const API = '2025-01'
const DRY = process.argv.includes('--dry-run')
const THEME_ID = 'gid://shopify/OnlineStoreTheme/196215472471'
const RESOURCE_ID =
  'gid://shopify/OnlineStoreThemeJsonTemplate/product.product-landing?theme_id=196215472471'

const SHOPIFY_LOCALE: Record<string, string> = { pt: 'pt-PT' }
const SKIP = new Set(['sl'])

const ITEM_IDS = [
  'about-2',
  'urinal-screens-2',
  'urinal-screens-4',
  'materials-3',
] as const

const ROW_IDS = [
  'collapsible_row_MxwqD7',
  'collapsible_row_EcaLVM',
  'collapsible_row_hAYLLq',
  'collapsible_row_PydxKU',
] as const

const BUTTON_LABELS: Record<string, string> = {
  en: 'View all FAQ',
  cs: 'Zobrazit celou FAQ',
  sk: 'Zobraziť celú FAQ',
  de: 'Alle FAQ anzeigen',
  pl: 'Zobacz wszystkie FAQ',
  fr: 'Voir toutes les FAQ',
  es: 'Ver todas las FAQ',
  it: 'Vedi tutte le FAQ',
  nl: 'Bekijk alle FAQ',
  pt: 'Ver todas as FAQ',
  sv: 'Visa alla FAQ',
  da: 'Se alle FAQ',
  fi: 'Näytä kaikki UKK',
  el: 'Δείτε όλες τις συχνές ερωτήσεις',
  hu: 'Összes GYIK megtekintése',
  ro: 'Vezi toate întrebările',
  bg: 'Виж всички ЧЗВ',
  hr: 'Prikaži cijeli FAQ',
  et: 'Vaata kõiki KKK',
  lv: 'Skatīt visus BUJ',
  lt: 'Žiūrėti visus DUK',
}

type FaqBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'chart'; caption?: string }

type FaqItem = { id: string; question: string; answer: FaqBlock[] }
type FaqContent = { categories: { items: FaqItem[] }[] }

type Creds = { clientId: string; clientSecret: string; domain: string }

function loadCreds(): Creds {
  const cfg = JSON.parse(readFileSync(MCP, 'utf8')) as {
    mcpServers: { shopify: { args: string[] } }
  }
  const args = cfg.mcpServers.shopify.args
  const after = (f: string) => args[args.indexOf(f) + 1]
  return {
    clientId: after('--clientId'),
    clientSecret: after('--clientSecret'),
    domain: after('--domain'),
  }
}

async function getToken(c: Creds): Promise<string> {
  const res = await fetch(`https://${c.domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
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
  const res = await fetch(`https://${domain}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = (await res.json()) as {
    data?: Record<string, unknown>
    errors?: unknown
  }
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 2000))
  return json.data as Record<string, unknown>
}

function loadFaq(locale: string): FaqContent {
  const path = join(FAQ_DIR, `${locale}.json`)
  if (!existsSync(path)) throw new Error(`Missing FAQ ${locale}`)
  return JSON.parse(readFileSync(path, 'utf8')) as FaqContent
}

function findItem(content: FaqContent, id: string): FaqItem {
  for (const cat of content.categories) {
    const item = cat.items.find((i) => i.id === id)
    if (item) return item
  }
  throw new Error(`FAQ item ${id} not found`)
}

function blocksToHtml(blocks: FaqBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'paragraph') return `<p>${escapeMinimal(b.text)}</p>`
      if (b.type === 'list') {
        return `<ul>${b.items.map((i) => `<li>${escapeMinimal(i)}</li>`).join('')}</ul>`
      }
      // skip table/chart on PDP teaser
      return ''
    })
    .filter(Boolean)
    .join('')
}

function escapeMinimal(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function headingHtml(question: string): string {
  return `<strong>${escapeMinimal(question)}</strong>`
}

async function fetchThemeFile(
  domain: string,
  token: string,
  filename: string,
): Promise<string> {
  const data = (await gql(
    domain,
    token,
    `query($id:ID!,$names:[String!]!){
      theme(id:$id){
        files(filenames:$names, first:5){
          nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } }
        }
      }
    }`,
    { id: THEME_ID, names: [filename] },
  )) as {
    theme: {
      files: { nodes: { filename: string; body: { content?: string } }[] }
    }
  }
  const content = data.theme.files.nodes[0]?.body?.content
  if (!content) throw new Error(`Missing theme file ${filename}`)
  return content
}

async function upsertThemeFiles(
  domain: string,
  token: string,
  files: { filename: string; body: string }[],
) {
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
      files: files.map((f) => ({
        filename: f.filename,
        body: { type: 'TEXT', value: f.body },
      })),
    },
  )) as {
    themeFilesUpsert: {
      upsertedThemeFiles: { filename: string }[]
      userErrors: { message: string }[]
    }
  }
  if (data.themeFilesUpsert.userErrors?.length) {
    throw new Error(JSON.stringify(data.themeFilesUpsert.userErrors))
  }
  console.log(
    'Pushed:',
    data.themeFilesUpsert.upsertedThemeFiles.map((f) => f.filename).join(', '),
  )
}

function patchCollapsibleLiquid(src: string): string {
  if (src.includes('button_label') && src.includes('faq-product-cta')) {
    return src
  }

  const cta = `
    {%- if section.settings.button_label != blank -%}
      <div class="faq-product-cta" style="margin-top: 2.4rem; text-align: {{ section.settings.heading_alignment }};">
        <a
          href="{{ section.settings.button_link | default: '/pages/faq' }}"
          class="button"
          style="background:#0F68B2;color:#fff;border-color:#0F68B2;"
        >
          {{ section.settings.button_label | escape }}
        </a>
      </div>
    {%- endif -%}
`

  // Insert CTA before closing page-width div (after product-details)
  let out = src
  if (!out.includes('faq-product-cta')) {
    out = out.replace(
      /(\{%- endif -%\}\s*)(<\/div>\s*<\/div>\s*\{%- if section\.settings\.enable_faq_schema)/,
      `$1${cta}$2`,
    )
    if (!out.includes('faq-product-cta')) {
      // fallback: before enable_faq_schema block
      out = out.replace(
        '{%- if section.settings.enable_faq_schema -%}',
        `${cta}\n{%- if section.settings.enable_faq_schema -%}`,
      )
    }
  }

  // Add schema settings before the padding header
  if (!/"id":\s*"button_label"/.test(out)) {
    const buttonSettings = `{
      "type": "header",
      "content": "FAQ button"
    },
    {
      "type": "text",
      "id": "button_label",
      "label": "Button label",
      "default": "View all FAQ"
    },
    {
      "type": "text",
      "id": "button_link",
      "label": "Button link",
      "default": "/pages/faq"
    },
    `
    if (
      out.includes(
        '"content": "t:sections.all.padding.header.content"',
      )
    ) {
      out = out.replace(
        /(\{\s*"type":\s*"header",\s*"content":\s*"t:sections\.all\.padding\.header\.content"\s*\},)/,
        `${buttonSettings}$1`,
      )
    } else {
      // fallback: before first padding_top range setting
      out = out.replace(
        /(\{\s*"type":\s*"range",\s*"id":\s*"padding_top")/,
        `${buttonSettings}$1`,
      )
    }
  }

  return out
}

function updateProductLandingJson(raw: string, en: FaqContent): string {
  const commentMatch = raw.match(/^\/\*[\s\S]*?\*\/\s*/)
  const headerComment = commentMatch?.[0] ?? ''
  const jsonBody = raw.slice(headerComment.length)
  const tpl = JSON.parse(jsonBody) as {
    sections: Record<
      string,
      {
        type?: string
        blocks?: Record<
          string,
          { type: string; settings: Record<string, unknown> }
        >
        settings?: Record<string, unknown>
      }
    >
    order?: string[]
  }

  const section = tpl.sections.collapsible_content_iGUxFe
  if (!section?.blocks) throw new Error('FAQ section not found')

  for (let i = 0; i < ITEM_IDS.length; i++) {
    const item = findItem(en, ITEM_IDS[i])
    const rowId = ROW_IDS[i]
    const row = section.blocks[rowId]
    if (!row) throw new Error(`Missing block ${rowId}`)
    row.settings.heading = headingHtml(item.question)
    row.settings.row_content = blocksToHtml(item.answer)
  }

  section.settings = {
    ...section.settings,
    heading: 'FAQ',
    button_label: BUTTON_LABELS.en,
    button_link: '/pages/faq',
    enable_faq_schema: true,
  }

  return `${headerComment}${JSON.stringify(tpl, null, 2)}\n`
}

/** Known translation keys for the 4 rows + heading (from prior sync). */
const TRANSLATION_KEYS = {
  heading:
    'section.product.product-landing.json.collapsible_content_iGUxFe.heading:3k6apu6ummco7',
  rows: [
    {
      heading:
        'section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_MxwqD7.heading:2v87ddenptkbe',
      content:
        'section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_MxwqD7.row_content:p5nnp1rs17qm',
    },
    {
      heading:
        'section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_EcaLVM.heading:3i6nge7nozvgq',
      content:
        'section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_EcaLVM.row_content:3q27ze8z3k60u',
    },
    {
      heading:
        'section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_hAYLLq.heading:2v9h31iv03ee3',
      content:
        'section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_hAYLLq.row_content:2itkddymxw59r',
    },
    {
      heading:
        'section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_PydxKU.heading:1c90qel18oy29',
      content:
        'section.product.product-landing.json.collapsible_content_iGUxFe.collapsible_row_PydxKU.row_content:2dfw96kl6sqth',
    },
  ],
} as const

async function main() {
  const creds = loadCreds()
  const token = await getToken(creds)
  const en = loadFaq('en')

  mkdirSync(join(ROOT, 'scripts/tmp'), { recursive: true })

  let collapsible = await fetchThemeFile(
    creds.domain,
    token,
    'sections/collapsible-content.liquid',
  )
  collapsible = patchCollapsibleLiquid(collapsible)
  writeFileSync(
    join(ROOT, 'scripts/tmp/collapsible-content.patched.liquid'),
    collapsible,
  )

  let landing = await fetchThemeFile(
    creds.domain,
    token,
    'templates/product.product-landing.json',
  )
  landing = updateProductLandingJson(landing, en)
  writeFileSync(
    join(ROOT, 'scripts/tmp/product-landing-faq-updated.json'),
    landing,
  )

  console.log('EN FAQ preview:')
  for (const id of ITEM_IDS) {
    const item = findItem(en, id)
    console.log(`  - ${item.question}`)
  }
  console.log(`  CTA: ${BUTTON_LABELS.en} → /pages/faq`)

  if (!DRY) {
    // Schema must land before the template settings that reference it
    await upsertThemeFiles(creds.domain, token, [
      {
        filename: 'sections/collapsible-content.liquid',
        body: collapsible,
      },
    ])
    await upsertThemeFiles(creds.domain, token, [
      {
        filename: 'templates/product.product-landing.json',
        body: landing,
      },
    ])
  } else {
    console.log('(dry-run: theme files not pushed)')
  }

  // Refresh digests after EN upsert
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

  // Discover FAQ CTA button_label only (not map / other sections)
  const buttonKey = [...byKey.keys()].find((k) =>
    k.includes('collapsible_content_iGUxFe.button_label'),
  )
  console.log('FAQ button_label key:', buttonKey ?? '(not yet in digests)')

  const locales = Object.keys(BUTTON_LABELS).filter(
    (l) => l !== 'en' && !SKIP.has(l),
  )

  for (const pack of locales) {
    const faqPath = join(FAQ_DIR, `${pack}.json`)
    if (!existsSync(faqPath)) {
      console.warn(`skip ${pack}: no FAQ JSON`)
      continue
    }
    const faq = loadFaq(pack)
    const locale = SHOPIFY_LOCALE[pack] ?? pack
    const translations: {
      key: string
      value: string
      locale: string
      translatableContentDigest: string
    }[] = []

    // Section heading "FAQ" — keep short local where needed
    const headingSrc = byKey.get(TRANSLATION_KEYS.heading)
    if (headingSrc) {
      const faqHeading: Record<string, string> = {
        fi: 'UKK',
        et: 'KKK',
        hu: 'GYIK',
        ro: 'Întrebări frecvente',
        bg: 'ЧЗВ',
        el: 'Συχνές ερωτήσεις',
        lv: 'BUJ',
        lt: 'DUK',
      }
      translations.push({
        key: headingSrc.key,
        value: faqHeading[pack] ?? 'FAQ',
        locale,
        translatableContentDigest: headingSrc.digest,
      })
    }

    for (let i = 0; i < ITEM_IDS.length; i++) {
      const item = findItem(faq, ITEM_IDS[i])
      const keys = TRANSLATION_KEYS.rows[i]
      const h = byKey.get(keys.heading)
      const c = byKey.get(keys.content)
      if (!h || !c) {
        console.warn(`  missing digests for row ${i} / ${pack}`)
        continue
      }
      translations.push({
        key: h.key,
        value: headingHtml(item.question),
        locale,
        translatableContentDigest: h.digest,
      })
      translations.push({
        key: c.key,
        value: blocksToHtml(item.answer),
        locale,
        translatableContentDigest: c.digest,
      })
    }

    if (buttonKey) {
      const b = byKey.get(buttonKey)
      if (b) {
        translations.push({
          key: b.key,
          value: BUTTON_LABELS[pack] ?? BUTTON_LABELS.en,
          locale,
          translatableContentDigest: b.digest,
        })
      }
    }

    console.log(`${pack}: ${translations.length} translations`)
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
    if (data.translationsRegister.userErrors?.length) {
      console.warn('  errs', data.translationsRegister.userErrors)
    } else {
      console.log('  ok')
    }
  }

  // Second pass for button_label if digests appeared after first template push
  if (!DRY && !buttonKey) {
    const meta2 = (await gql(
      creds.domain,
      token,
      `query($id:ID!){translatableResource(resourceId:$id){translatableContent{key value digest}}}`,
      { id: RESOURCE_ID },
    )) as {
      translatableResource: {
        translatableContent: { key: string; value: string; digest: string }[]
      }
    }
    const btn = meta2.translatableResource.translatableContent.find((c) =>
      c.key.includes('collapsible_content_iGUxFe.button_label'),
    )
    if (btn) {
      console.log('\nButton label second pass:', btn.key)
      for (const pack of locales) {
        const locale = SHOPIFY_LOCALE[pack] ?? pack
        await gql(
          creds.domain,
          token,
          `mutation($resourceId:ID!,$translations:[TranslationInput!]!){
            translationsRegister(resourceId:$resourceId,translations:$translations){
              userErrors{message}
            }
          }`,
          {
            resourceId: RESOURCE_ID,
            translations: [
              {
                key: btn.key,
                value: BUTTON_LABELS[pack] ?? BUTTON_LABELS.en,
                locale,
                translatableContentDigest: btn.digest,
              },
            ],
          },
        )
        console.log(`  ${pack} button ok`)
      }
    } else {
      console.warn('button_label still not in translatable content')
    }
  }

  console.log(DRY ? '\n(dry-run done)' : '\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
