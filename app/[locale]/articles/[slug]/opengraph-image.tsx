import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import {
  getArticleBySlug,
  type ArticlesLocale,
} from '@/lib/articles'
import { OG_SIZE, createArticleOgImage } from '@/lib/og-image'
import { urlFor } from '@/sanity/lib/image'

export const alt = 'ëkcos article'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale
  const article = await getArticleBySlug(locale as ArticlesLocale, slug)

  const imageSrc = article?.coverImage?.asset?._ref
    ? urlFor(article.coverImage).width(1200).height(630).fit('crop').url()
    : undefined

  return createArticleOgImage({
    title: article?.title ?? 'ëkcos',
    imageSrc,
  })
}
