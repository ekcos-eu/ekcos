import type {PortableTextBlock} from '@portabletext/types'
import {client} from '@/sanity/lib/client'

export type ArticlesLocale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'cs'

export type ArticleItem = {
  _id: string
  publishedAt?: string
  title: string
  slug: {current: string}
  excerpt?: string
  coverImage?: {
    asset?: {_ref: string}
    alt?: string
  }
  content: PortableTextBlock[]
}

const articlesQuery = `
*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc){
  _id,
  publishedAt,
  "title": coalesce(
    select(
      $locale == "cs" => cs.title,
      $locale == "en" => en.title,
      $locale == "de" => de.title,
      $locale == "fr" => fr.title,
      $locale == "it" => it.title,
      $locale == "es" => es.title
    ),
    en.title
  ),
  "slug": coalesce(
    select(
      $locale == "cs" => cs.slug,
      $locale == "en" => en.slug,
      $locale == "de" => de.slug,
      $locale == "fr" => fr.slug,
      $locale == "it" => it.slug,
      $locale == "es" => es.slug
    ),
    en.slug
  ),
  "excerpt": coalesce(
    select(
      $locale == "cs" => cs.excerpt,
      $locale == "en" => en.excerpt,
      $locale == "de" => de.excerpt,
      $locale == "fr" => fr.excerpt,
      $locale == "it" => it.excerpt,
      $locale == "es" => es.excerpt
    ),
    en.excerpt
  ),
  "coverImage": coalesce(
    select(
      $locale == "cs" => cs.mainImage,
      $locale == "en" => en.mainImage,
      $locale == "de" => de.mainImage,
      $locale == "fr" => fr.mainImage,
      $locale == "it" => it.mainImage,
      $locale == "es" => es.mainImage
    ),
    en.mainImage
  ),
  "content": coalesce(
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
}
`

export async function getArticles(locale: ArticlesLocale): Promise<ArticleItem[]> {
  return client.fetch<ArticleItem[]>(articlesQuery, {locale})
}
