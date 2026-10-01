import type {PortableTextBlock} from '@portabletext/types'
import {client} from '@/sanity/lib/client'
import {locales} from '@/i18n/locales'

export type ArticlesLocale = string

export type ArticleCoverImage = {
  asset?: {_ref: string}
  alt?: string
}

export type ArticleListItem = {
  _id: string
  publishedAt?: string
  title: string
  slug: {current: string}
  coverImage?: ArticleCoverImage
}

export type ArticleItem = ArticleListItem & {
  excerpt?: string
  content: PortableTextBlock[]
}

function groqSelect(field: string, fallback = `en.${field}`): string {
  const cases = locales
    .map((locale) => `$locale == "${locale}" => ${locale}.${field}`)
    .join(',\n      ')
  return `coalesce(
    select(
      ${cases}
    ),
    ${fallback}
  )`
}

const localeTitle = groqSelect('title')
const localeSlug = groqSelect('slug')
const localeCover = groqSelect('mainImage')
const localeExcerpt = groqSelect('excerpt')
const localeBody = `coalesce(
  select(
    ${locales.map((locale) => `$locale == "${locale}" => ${locale}.body`).join(',\n    ')}
  ),
  en.body,
  []
)`

const slugMatch = locales
  .map((locale) => `${locale}.slug.current == $slug`)
  .join(' ||\n    ')

const articlesListQuery = `
*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc){
  _id,
  publishedAt,
  "title": ${localeTitle},
  "slug": ${localeSlug},
  "coverImage": ${localeCover}
}
`

const articleBySlugQuery = `
*[
  _type == "post" &&
  (
    ${slugMatch}
  )
][0]{
  _id,
  publishedAt,
  "title": ${localeTitle},
  "slug": ${localeSlug},
  "excerpt": ${localeExcerpt},
  "coverImage": ${localeCover},
  "content": ${localeBody}
}
`

const articleSlugsQuery = `
*[_type == "post"]{
  "slugs": [${locales.map((locale) => `${locale}.slug.current`).join(', ')}]
}.slugs[]
`

export async function getArticles(locale: ArticlesLocale): Promise<ArticleListItem[]> {
  return client.fetch<ArticleListItem[]>(articlesListQuery, {locale})
}

export async function getArticleBySlug(
  locale: ArticlesLocale,
  slug: string,
): Promise<ArticleItem | null> {
  return client.fetch<ArticleItem | null>(articleBySlugQuery, {locale, slug})
}

export async function getArticleSlugs(): Promise<string[]> {
  const slugs = await client.fetch<(string | null)[]>(articleSlugsQuery)
  return [...new Set(slugs.filter((slug): slug is string => Boolean(slug)))]
}

export type ArticleSitemapItem = {
  _updatedAt?: string
  slugs: Partial<Record<ArticlesLocale, string | null>>
}

const articleSitemapQuery = `
*[_type == "post"]{
  _updatedAt,
  "slugs": {
    ${locales
      .map(
        (locale) =>
          `"${locale}": coalesce(${locale}.slug.current, en.slug.current)`,
      )
      .join(',\n    ')}
  }
}
`

export async function getArticleSitemapEntries(): Promise<ArticleSitemapItem[]> {
  return client.fetch<ArticleSitemapItem[]>(articleSitemapQuery)
}
