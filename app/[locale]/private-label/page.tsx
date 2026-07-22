import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { PrivateLabelView } from '@/components/private-label/private-label-view'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: t('privateLabelTitle'),
    description: t('privateLabelDescription'),
    alternates: {
      canonical: `/${locale}/private-label`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/private-label`])
      ),
    },
  }
}

export default function PrivateLabelPage() {
  return <PrivateLabelView />
}
