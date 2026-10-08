/**
 * Linkify bare Eco-One™ mentions in Shopify product descriptions (EN + translations)
 * to /blogs/articles/eco-one.
 *
 *   bun scripts/linkify-shopify-eco-one.ts
 *   bun scripts/linkify-shopify-eco-one.ts --dry-run
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {
  ECO_ONE_ARTICLE_PATH,
  linkifyEcoOneMentions,
} from './lib/eco-one-shopify-html'

const MCP = join(import.meta.dir, '..', '.cursor/mcp.json')
const API = '2025-01'
const DRY = process.argv.includes('--dry-run')

const LOCALES = [
  'cs',
  'sk',
  'de',
  'pl',
  'fr',
  'es',
  'it',
  'nl',
  'pt-PT',
  'sv',
  'da',
  'fi',
  'el',
  'hu',
  'ro',
  'bg',
  'hr',
  'et',
  'lv',
  'lt',
] as const

async function getToken(): Promise<{domain: string; token: string}> {
  const cfg = JSON.parse(readFileSync(MCP, 'utf8')) as {
    mcpServers: {shopify: {args: string[]}}
  }
  const args = cfg.mcpServers.shopify.args
  const after = (f: string) => args[args.indexOf(f) + 1]
  const domain = after('--domain')
  const tokenRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: after('--clientId'),
      client_secret: after('--clientSecret'),
    }),
  })
  const tokenData = (await tokenRes.json()) as {access_token?: string}
  if (!tokenData.access_token) throw new Error(JSON.stringify(tokenData))
  return {domain, token: tokenData.access_token}
}

async function gq<T>(
  domain: string,
  token: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`https://${domain}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({query, variables}),
  })
  const json = (await res.json()) as {data?: T; errors?: unknown}
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  if (!json.data) throw new Error('No data')
  return json.data
}

function needsLinkify(text: string | null | undefined): boolean {
  if (!text || !text.includes('Eco-One™')) return false
  const bare = text.replace(
    new RegExp(
      `<a[^>]*href="${ECO_ONE_ARTICLE_PATH}"[^>]*>Eco-One™</a>`,
      'g',
    ),
    '',
  )
  return bare.includes('Eco-One™')
}

type ProductNode = {
  id: string
  handle: string
  descriptionHtml: string
}

async function fetchAllProducts(
  domain: string,
  token: string,
): Promise<ProductNode[]> {
  const out: ProductNode[] = []
  let cursor: string | null = null
  for (;;) {
    const data = await gq<{
      products: {
        pageInfo: {hasNextPage: boolean; endCursor: string | null}
        nodes: ProductNode[]
      }
    }>(
      domain,
      token,
      `query ($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id handle descriptionHtml }
        }
      }`,
      {cursor},
    )
    out.push(...data.products.nodes)
    if (!data.products.pageInfo.hasNextPage) break
    cursor = data.products.pageInfo.endCursor
  }
  return out
}

async function updateProductDescription(
  domain: string,
  token: string,
  id: string,
  descriptionHtml: string,
) {
  const res = await gq<{
    productUpdate: {userErrors: {message: string}[]}
  }>(
    domain,
    token,
    `mutation ($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { id }
        userErrors { field message }
      }
    }`,
    {product: {id, descriptionHtml}},
  )
  if (res.productUpdate.userErrors?.length) {
    throw new Error(JSON.stringify(res.productUpdate.userErrors))
  }
}

async function bodyDigest(
  domain: string,
  token: string,
  productId: string,
): Promise<string | null> {
  const tr = await gq<{
    translatableResource: {
      translatableContent: {key: string; digest: string}[]
    } | null
  }>(
    domain,
    token,
    `query ($id: ID!) {
      translatableResource(resourceId: $id) {
        translatableContent { key digest }
      }
    }`,
    {id: productId},
  )
  return (
    tr.translatableResource?.translatableContent.find(
      (c) => c.key === 'body_html',
    )?.digest ?? null
  )
}

async function translateBodies(
  domain: string,
  token: string,
  productId: string,
  digest: string,
): Promise<number> {
  let updated = 0
  for (const locale of LOCALES) {
    const locData = await gq<{
      translatableResource: {
        translations: {key: string; value: string}[]
      } | null
    }>(
      domain,
      token,
      `query ($id: ID!, $locale: String!) {
        translatableResource(resourceId: $id) {
          translations(locale: $locale) { key value }
        }
      }`,
      {id: productId, locale},
    )
    const body = locData.translatableResource?.translations.find(
      (t) => t.key === 'body_html',
    )?.value
    if (!body || !needsLinkify(body)) continue
    const next = linkifyEcoOneMentions(body)
    if (next === body) continue

    if (DRY) {
      console.log('  would translate body_html', locale)
      updated++
      continue
    }

    const res = await gq<{
      translationsRegister: {userErrors: {message: string}[]}
    }>(
      domain,
      token,
      `mutation ($resourceId: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $resourceId, translations: $translations) {
          userErrors { message field }
        }
      }`,
      {
        resourceId: productId,
        translations: [
          {
            key: 'body_html',
            value: next,
            locale,
            translatableContentDigest: digest,
          },
        ],
      },
    )
    if (res.translationsRegister.userErrors?.length) {
      console.warn(locale, res.translationsRegister.userErrors)
    } else {
      updated++
    }
  }
  return updated
}

async function main() {
  const {domain, token} = await getToken()
  console.log('shop', domain, DRY ? '(dry-run)' : '')
  const products = await fetchAllProducts(domain, token)
  const targets = products.filter((p) => needsLinkify(p.descriptionHtml))
  console.log('products', products.length, 'with bare Eco-One™', targets.length)

  let enUpdated = 0
  let trUpdated = 0

  for (const product of targets) {
    const next = linkifyEcoOneMentions(product.descriptionHtml)
    console.log('EN', product.handle)
    if (!DRY) {
      await updateProductDescription(domain, token, product.id, next)
    }
    enUpdated++

    const digest = DRY
      ? 'dry'
      : await bodyDigest(domain, token, product.id)
    if (!digest) {
      console.warn('no body_html digest', product.handle)
      continue
    }
    if (!DRY) {
      trUpdated += await translateBodies(domain, token, product.id, digest)
    }
  }

  console.log('done', {enUpdated, trUpdated, article: ECO_ONE_ARTICLE_PATH})
}

await main()
