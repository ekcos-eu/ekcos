import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

const OG_IMAGE = {
  url: '/og.png',
  width: 1024,
  height: 536,
  alt: 'ëkcos product lineup',
} as const

/** Path after the locale prefix. Use `'/'` for the homepage. */
export function localizedPath(locale: string, path = '/'): string {
  return path === '/' || path === '' ? `/${locale}` : `/${locale}${path}`
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

export function localeSeo(
  locale: string,
  path = '/',
): Pick<Metadata, 'alternates' | 'openGraph'> {
  const url = localizedPath(locale, path)
  return {
    alternates: localeAlternates(locale, path),
    openGraph: {
      url,
      type: 'website',
      locale,
      images: [OG_IMAGE],
    },
  }
}
