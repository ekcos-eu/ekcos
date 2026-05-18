import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { EcoOneView } from '@/components/eco-one/eco-one-view'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: t('ecoOneTitle'),
    description: t('ecoOneDescription'),
    alternates: {
      canonical: `/${locale}/eco-one`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/eco-one`])),
    },
  }
}

export default function EcoOnePage() {
  return <EcoOneView />
}
