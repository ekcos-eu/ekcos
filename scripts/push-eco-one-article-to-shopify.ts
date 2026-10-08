/**
 * Create/update the Eco-One™ article on Shopify Online Store blog.
 * Source: dictionaries/{locale}.json → ecoOne (same copy as the marketing Eco-One page).
 * Skips Slovenian (not enabled on the eshop). pt → Shopify pt-PT.
 *
 *   bun scripts/push-eco-one-article-to-shopify.ts
 *   bun scripts/push-eco-one-article-to-shopify.ts --delete-advisor
 */
import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {
  buildEcoOneHtml,
  ecoOneArticleSummary,
  ecoOneArticleTitle,
} from './lib/eco-one-shopify-html'

const ROOT = join(import.meta.dir, '..')
const MCP = join(ROOT, '.cursor/mcp.json')
const API = '2025-01'
const BLOG_HANDLE = 'articles'
const BLOG_TITLE = 'Articles'
const ARTICLE_HANDLE = 'eco-one'
const AUTHOR_NAME = 'ëkcos innovations'
const ADVISOR_HANDLE = 'how-to-choose-the-right-urinal-screen'

const SKIP = new Set(['sl'])
const SHOPIFY_LOCALE: Record<string, string> = {pt: 'pt-PT'}

function shopLocale(pack: string): string {
  return SHOPIFY_LOCALE[pack] ?? pack
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
  }>(domain, token, `{ blogs(first: 20) { nodes { id handle title } } }`)
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

async function findArticleByHandle(
  domain: string,
  token: string,
  handle: string,
): Promise<string | null> {
  const data = await gq<{
    articles: {nodes: {id: string; handle: string}[]}
  }>(
    domain,
    token,
    `{ articles(first: 50, query: "handle:${handle}") {
      nodes { id handle title }
    } }`,
  )
  return data.articles.nodes[0]?.id ?? null
}

async function createOrUpdateArticle(
  domain: string,
  token: string,
  blogId: string,
): Promise<string> {
  const title = ecoOneArticleTitle('en')
  const body = buildEcoOneHtml('en')
  const summary = ecoOneArticleSummary('en')
  const existingId = await findArticleByHandle(domain, token, ARTICLE_HANDLE)

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
          title,
          body,
          summary,
          tags: ['Eco-One', 'materials', 'biodegradation'],
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
        title,
        handle: ARTICLE_HANDLE,
        body,
        summary,
        author: {name: AUTHOR_NAME},
        tags: ['Eco-One', 'materials', 'biodegradation'],
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
    const dictPath = join(ROOT, 'dictionaries', `${pack}.json`)
    if (!existsSync(dictPath)) {
      console.warn('missing dictionary', pack)
      continue
    }
    const locale = shopLocale(pack)
    const map: Record<string, string> = {
      title: ecoOneArticleTitle(pack),
      body_html: buildEcoOneHtml(pack),
      summary_html: ecoOneArticleSummary(pack),
    }

    const translations: {
      key: string
      value: string
      locale: string
      translatableContentDigest: string
    }[] = []

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

async function deleteAdvisorArticle(domain: string, token: string) {
  const id = await findArticleByHandle(domain, token, ADVISOR_HANDLE)
  if (!id) {
    console.log('advisor article not found, skip delete')
    return
  }
  const res = await gq<{
    articleDelete: {
      deletedArticleId: string | null
      userErrors: {message: string}[]
    }
  }>(
    domain,
    token,
    `mutation ($id: ID!) {
      articleDelete(id: $id) {
        deletedArticleId
        userErrors { field message }
      }
    }`,
    {id},
  )
  if (res.articleDelete.userErrors?.length) {
    throw new Error(JSON.stringify(res.articleDelete.userErrors))
  }
  console.log('advisor article deleted', res.articleDelete.deletedArticleId)
}

async function main() {
  const locales = readdirSync(join(ROOT, 'dictionaries'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .filter((l) => !SKIP.has(l))
    .sort()

  const {domain, token} = await getToken()
  console.log('shop', domain)

  if (process.argv.includes('--delete-advisor')) {
    await deleteAdvisorArticle(domain, token)
  }

  const blogId = await ensureBlog(domain, token)
  await translateBlogTitle(domain, token, blogId)
  const articleId = await createOrUpdateArticle(domain, token, blogId)
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
