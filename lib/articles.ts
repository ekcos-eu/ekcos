import type {PortableTextBlock} from '@portabletext/types'
import {client} from '@/sanity/lib/client'

export type ArticlesLocale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'cs'

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

const localeTitle = `
  coalesce(
    select(
      $locale == "cs" => cs.title,
      $locale == "en" => en.title,
      $locale == "de" => de.title,
      $locale == "fr" => fr.title,
      $locale == "it" => it.title,
      $locale == "es" => es.title
    ),
    en.title
  )
`

const localeSlug = `
  coalesce(
    select(
      $locale == "cs" => cs.slug,
      $locale == "en" => en.slug,
      $locale == "de" => de.slug,
      $locale == "fr" => fr.slug,
      $locale == "it" => it.slug,
      $locale == "es" => es.slug
    ),
    en.slug
  )
`

const localeCover = `
  coalesce(
    select(
      $locale == "cs" => cs.mainImage,
      $locale == "en" => en.mainImage,
      $locale == "de" => de.mainImage,
      $locale == "fr" => fr.mainImage,
      $locale == "it" => it.mainImage,
      $locale == "es" => es.mainImage
    ),
    en.mainImage
  )
`

const localeExcerpt = `
  coalesce(
    select(
      $locale == "cs" => cs.excerpt,
      $locale == "en" => en.excerpt,
      $locale == "de" => de.excerpt,
      $locale == "fr" => fr.excerpt,
      $locale == "it" => it.excerpt,
      $locale == "es" => es.excerpt
    ),
    en.excerpt
  )
`

const localeBody = `
  coalesce(
    select(
      $locale == "cs" => cs.body,
      $locale == "en" => en.body,
      $locale == "de" => de.body,
      $locale == "fr" => fr.body,
      $locale == "it" => it.body,
      $locale == "es" => es.body
    ),
    en.body,
    []
  )
`

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
    cs.slug.current == $slug ||
    en.slug.current == $slug ||
    de.slug.current == $slug ||
    fr.slug.current == $slug ||
    it.slug.current == $slug ||
    es.slug.current == $slug
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
  "slugs": [
    cs.slug.current,
    en.slug.current,
    de.slug.current,
    fr.slug.current,
    it.slug.current,
    es.slug.current
  ]
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
