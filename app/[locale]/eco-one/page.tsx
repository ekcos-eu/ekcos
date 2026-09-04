import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { EcoOneView } from '@/components/eco-one/eco-one-view'
import { pageSeo } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return pageSeo({
    locale,
    path: '/eco-one',
    title: t('ecoOneTitle'),
    description: t('ecoOneDescription'),
  })
}

export default function EcoOnePage() {
  return <EcoOneView />
}
