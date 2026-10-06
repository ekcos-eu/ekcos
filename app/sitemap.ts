import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getArticleSitemapEntries, type ArticlesLocale } from '@/lib/articles'
import { SITE_URL } from '@/lib/brand'
import { getAllProductSlugs } from '@/lib/csv-products'

const STATIC_PATHS = [
  '/',
  '/articles',
  '/eco-one',
  '/private-label',
  '/faq',
  '/faq/distributors',
  '/faq/eshop',
] as const

function localeUrl(locale: string, path: string): string {
  const prefix = `/${locale}`
  return `${SITE_URL}${path === '/' ? prefix : `${prefix}${path}`}`
}

function localizedEntry(
  path: string,
  lastModified?: string | Date,
): MetadataRoute.Sitemap[number] {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, localeUrl(locale, path)]),
  )

  return {
    url: localeUrl(routing.defaultLocale, path),
    lastModified,
    alternates: {
      languages: {
        ...languages,
        'x-default': localeUrl(routing.defaultLocale, path),
      },
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.map((path) => localizedEntry(path))
  const productEntries = getAllProductSlugs().map((slug) =>
    localizedEntry(`/products/${slug}`),
  )

  let articleEntries: MetadataRoute.Sitemap = []
  try {
    const articles = await getArticleSitemapEntries()
    articleEntries = articles.flatMap((article) => {
      const defaultSlug =
        article.slugs[routing.defaultLocale as ArticlesLocale] ??
        Object.values(article.slugs).find(Boolean)
      if (!defaultSlug) return []

      const languages = Object.fromEntries(
        routing.locales.flatMap((locale) => {
          const slug = article.slugs[locale as ArticlesLocale]
          return slug ? [[locale, localeUrl(locale, `/articles/${slug}`)]] : []
        }),
      )

      return [
        {
          url: localeUrl(routing.defaultLocale, `/articles/${defaultSlug}`),
          lastModified: article._updatedAt,
          alternates: {
            languages: {
              ...languages,
              'x-default': localeUrl(
                routing.defaultLocale,
                `/articles/${defaultSlug}`,
              ),
            },
          },
        },
      ]
    })
  } catch {
    articleEntries = []
  }

  return [...staticEntries, ...productEntries, ...articleEntries]
}
