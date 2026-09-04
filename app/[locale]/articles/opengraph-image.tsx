import { getTranslations } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { OG_SIZE, createOgImage } from '@/lib/og-image'

export const alt = 'ëkcos Articles'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale
  const meta = await getTranslations({ locale, namespace: 'Metadata' })

  return createOgImage({
    kicker: 'ëkcos',
    title: meta('articlesTitle'),
    description: meta('articlesDescription'),
  })
}
