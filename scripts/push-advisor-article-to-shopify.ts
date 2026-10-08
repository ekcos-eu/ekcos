/**
 * Create/update the urinal-screen advisor article on Shopify Online Store blog.
 *
 * Source: scripts/tmp/advisor-content/{locale}.json
 * Skips Slovenian (not enabled on the eshop). pt → Shopify pt-PT.
 *
 *   bun scripts/push-advisor-article-to-shopify.ts
 */
import {readFileSync, readdirSync, existsSync} from 'node:fs'
import {join} from 'node:path'
import {
  buildAdvisorHtml,
  linkifyHtml,
  type LocaleContent,
} from './lib/advisor-shopify-html'

const ROOT = join(import.meta.dir, '..')
const MCP = join(ROOT, '.cursor/mcp.json')
const CONTENT_DIR = join(ROOT, 'scripts/tmp/advisor-content')
const API = '2025-01'
const BLOG_HANDLE = 'articles'
const BLOG_TITLE = 'Articles'
const ARTICLE_HANDLE = 'how-to-choose-the-right-urinal-screen'
const AUTHOR_NAME = 'ëkcos innovations'

const SKIP = new Set(['sl'])
const SHOPIFY_LOCALE: Record<string, string> = {pt: 'pt-PT'}

function shopLocale(pack: string): string {
  return SHOPIFY_LOCALE[pack] ?? pack
}

function bodyToHtml(locale: string, content: LocaleContent): string {
  return buildAdvisorHtml(locale, content)
}

function loadLocale(locale: string): LocaleContent {
  return JSON.parse(
    readFileSync(join(CONTENT_DIR, `${locale}.json`), 'utf8'),
  ) as LocaleContent
}

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

async function ensureBlog(domain: string, token: string): Promise<string> {
  const found = await gq<{
    blogs: {nodes: {id: string; handle: string}[]}
  }>(
    domain,
    token,
    `{ blogs(first: 20) { nodes { id handle title } } }`,
  )
  const existing = found.blogs.nodes.find((b) => b.handle === BLOG_HANDLE)
  if (existing) {
    console.log('blog exists', existing.id)
    return existing.id
  }

  const created = await gq<{
    blogCreate: {
      blog: {id: string; handle: string} | null
      userErrors: {message: string}[]
    }
  }>(
    domain,
    token,
    `mutation ($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) {
        blog { id handle title }
        userErrors { field message }
      }
    }`,
    {
      blog: {
        title: BLOG_TITLE,
        handle: BLOG_HANDLE,
        commentPolicy: 'MODERATED',
      },
    },
  )
  if (created.blogCreate.userErrors?.length) {
    throw new Error(JSON.stringify(created.blogCreate.userErrors))
  }
  const id = created.blogCreate.blog?.id
  if (!id) throw new Error('blogCreate failed')
  console.log('blog created', id)
  return id
}

async function findArticle(
  domain: string,
  token: string,
): Promise<string | null> {
  const data = await gq<{
    articles: {nodes: {id: string; handle: string}[]}
  }>(
    domain,
    token,
    `{ articles(first: 50, query: "handle:${ARTICLE_HANDLE}") {
      nodes { id handle title }
    } }`,
  )
  return data.articles.nodes[0]?.id ?? null
}

async function createOrUpdateArticle(
  domain: string,
  token: string,
  blogId: string,
  en: LocaleContent,
): Promise<string> {
  const body = bodyToHtml('en', en)
  const summary = `<p>${linkifyHtml(en.excerpt)}</p>`
  const existingId = await findArticle(domain, token)

  if (existingId) {
    const upd = await gq<{
      articleUpdate: {
        article: {id: string} | null
        userErrors: {message: string}[]
      }
    }>(
      domain,
      token,
      `mutation ($id: ID!, $article: ArticleUpdateInput!) {
        articleUpdate(id: $id, article: $article) {
          article { id handle title }
          userErrors { field message }
        }
      }`,
      {
        id: existingId,
        article: {
          title: en.title,
          body,
          summary,
          tags: ['guide', 'urinal screen', 'advisor'],
          isPublished: true,
        },
      },
    )
    if (upd.articleUpdate.userErrors?.length) {
      throw new Error(JSON.stringify(upd.articleUpdate.userErrors))
    }
    console.log('article updated', existingId)
    return existingId
  }

  const created = await gq<{
    articleCreate: {
      article: {id: string; handle: string} | null
      userErrors: {message: string}[]
    }
  }>(
    domain,
    token,
    `mutation ($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article { id handle title }
        userErrors { field message }
      }
    }`,
    {
      article: {
        blogId,
        title: en.title,
        handle: ARTICLE_HANDLE,
        body,
        summary,
        author: {name: AUTHOR_NAME},
        tags: ['guide', 'urinal screen', 'advisor'],
        isPublished: true,
      },
    },
  )
  if (created.articleCreate.userErrors?.length) {
    throw new Error(JSON.stringify(created.articleCreate.userErrors))
  }
  const id = created.articleCreate.article?.id
  if (!id) throw new Error('articleCreate failed')
  console.log('article created', id, created.articleCreate.article?.handle)
  return id
}

async function registerTranslations(
  domain: string,
  token: string,
  resourceId: string,
  locales: string[],
) {
  const tr = await gq<{
    translatableResource: {
      translatableContent: {key: string; digest: string; locale: string}[]
    } | null
  }>(
    domain,
    token,
    `query ($id: ID!) {
      translatableResource(resourceId: $id) {
        translatableContent { key value digest locale }
      }
    }`,
    {id: resourceId},
  )

  const digests = new Map(
    (tr.translatableResource?.translatableContent ?? []).map((c) => [
      c.key,
      c.digest,
    ]),
  )
  console.log('translatable keys', [...digests.keys()])

  for (const pack of locales) {
    if (pack === 'en' || SKIP.has(pack)) continue
    const path = join(CONTENT_DIR, `${pack}.json`)
    if (!existsSync(path)) {
      console.warn('missing content', pack)
      continue
    }
    const loc = loadLocale(pack)
    const locale = shopLocale(pack)
    const translations: {
      key: string
      value: string
      locale: string
      translatableContentDigest: string
    }[] = []

    // Keep a single EN handle for all locales (Shopify rejects duplicate handles).
    const map: Record<string, string> = {
      title: loc.title,
      body_html: bodyToHtml(pack, loc),
      summary_html: `<p>${linkifyHtml(loc.excerpt)}</p>`,
    }

    for (const [key, value] of Object.entries(map)) {
      const digest = digests.get(key)
      if (!digest) continue
      translations.push({
        key,
        value,
        locale,
        translatableContentDigest: digest,
      })
    }

    if (!translations.length) {
      console.warn('no digests for', pack)
      continue
    }

    const res = await gq<{
      translationsRegister: {
        translations: {key: string; locale: string}[]
        userErrors: {message: string; field?: string[]}[]
      }
    }>(
      domain,
      token,
      `mutation ($resourceId: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $resourceId, translations: $translations) {
          translations { key locale }
          userErrors { message field }
        }
      }`,
      {resourceId, translations},
    )
    if (res.translationsRegister.userErrors?.length) {
      console.warn(pack, res.translationsRegister.userErrors)
    } else {
      console.log(
        'translated',
        pack,
        '→',
        locale,
        res.translationsRegister.translations.map((t) => t.key).join(','),
      )
    }
  }
}

async function translateBlogTitle(
  domain: string,
  token: string,
  blogId: string,
) {
  const titles: Record<string, string> = {
    cs: 'Články',
    sk: 'Články',
    de: 'Artikel',
    pl: 'Artykuły',
    fr: 'Articles',
    es: 'Artículos',
    it: 'Articoli',
    nl: 'Artikelen',
    pt: 'Artigos',
    sv: 'Artiklar',
    da: 'Artikler',
    fi: 'Artikkelit',
    el: 'Άρθρα',
    hu: 'Cikkek',
    ro: 'Articole',
    bg: 'Статии',
    hr: 'Članci',
    et: 'Artiklid',
    lv: 'Raksti',
    lt: 'Straipsniai',
  }

  const tr = await gq<{
    translatableResource: {
      translatableContent: {key: string; digest: string}[]
    } | null
  }>(
    domain,
    token,
    `query ($id: ID!) {
      translatableResource(resourceId: $id) {
        translatableContent { key value digest locale }
      }
    }`,
    {id: blogId},
  )
  const titleDigest = tr.translatableResource?.translatableContent.find(
    (c) => c.key === 'title',
  )?.digest
  if (!titleDigest) {
    console.warn('no blog title digest')
    return
  }

  const translations = Object.entries(titles).map(([pack, value]) => ({
    key: 'title',
    value,
    locale: shopLocale(pack),
    translatableContentDigest: titleDigest,
  }))

  const res = await gq<{
    translationsRegister: {userErrors: {message: string}[]}
  }>(
    domain,
    token,
    `mutation ($resourceId: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $resourceId, translations: $translations) {
        translations { key locale }
        userErrors { message field }
      }
    }`,
    {resourceId: blogId, translations},
  )
  if (res.translationsRegister.userErrors?.length) {
    console.warn('blog title', res.translationsRegister.userErrors)
  } else {
    console.log('blog titles translated', translations.length)
  }
}

async function main() {
  if (!existsSync(join(CONTENT_DIR, 'en.json'))) {
    throw new Error(`Missing ${CONTENT_DIR}/en.json`)
  }
  const locales = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .filter((l) => !SKIP.has(l))
    .sort()

  const en = loadLocale('en')
  const {domain, token} = await getToken()
  console.log('shop', domain)

  const blogId = await ensureBlog(domain, token)
  await translateBlogTitle(domain, token, blogId)
  const articleId = await createOrUpdateArticle(domain, token, blogId, en)
  await registerTranslations(domain, token, articleId, locales)

  const check = await gq<{
    article: {
      id: string
      title: string
      handle: string
      blog: {handle: string}
    } | null
  }>(
    domain,
    token,
    `query ($id: ID!) {
      article(id: $id) { id title handle blog { handle } }
    }`,
    {id: articleId},
  )
  const a = check.article
  console.log('done', a)
  if (a) {
    console.log(
      `url https://eshop.ekcos.eu/blogs/${a.blog.handle}/${a.handle}`,
    )
  }
}

await main()
