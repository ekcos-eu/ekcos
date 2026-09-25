import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { localeMeta, type AppLocale } from '@/i18n/locales'

export const HOME_OG_IMAGE = {
  url: '/og.png',
  width: 1024,
  height: 536,
  alt: 'ëkcos product lineup',
} as const

export type OgImage = {
  url: string
  width?: number
  height?: number
  alt?: string
}

/** Path after the locale prefix. Use `'/'` for the homepage. */
export function localizedPath(locale: string, path = '/'): string {
  return path === '/' || path === '' ? `/${locale}` : `/${locale}${path}`
}

export function ogLocale(locale: string): string {
  return (
    localeMeta[locale as AppLocale]?.ogLocale ??
    `${locale}_${locale.toUpperCase()}`
  )
}

export function localeAlternates(
  locale: string,
  path = '/',
): NonNullable<Metadata['alternates']> {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localizedPath(l, path)]),
  )

  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...languages,
      'x-default': localizedPath(routing.defaultLocale, path),
    },
  }
}

function socialTitle(title: string): string {
  return /ëkcos/i.test(title) ? title : `${title} | ëkcos`
}

type PageSeoInput = {
  locale: string
  path?: string
  title: string
  description: string
  image?: OgImage | OgImage[]
  type?: 'website' | 'article'
}

export function pageSeo({
  locale,
  path = '/',
  title,
  description,
  image,
  type = 'website',
}: PageSeoInput): Metadata {
  const url = localizedPath(locale, path)
  const ogTitle = socialTitle(title)
  const images = image ? (Array.isArray(image) ? image : [image]) : undefined
  const alternateLocale = routing.locales
    .filter((l) => l !== locale)
    .map((l) => ogLocale(l))

  return {
    title: path === '/' ? { absolute: title } : title,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: {
      type,
      siteName: 'ëkcos',
      title: ogTitle,
      description,
      url,
      locale: ogLocale(locale),
      alternateLocale,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      ...(images ? { images: images.map((item) => item.url) } : {}),
    },
  }
}
