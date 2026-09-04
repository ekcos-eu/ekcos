import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { EcoOneView } from '@/components/eco-one/eco-one-view'
import { localeSeo } from '@/lib/seo'

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
    ...localeSeo(locale, '/eco-one'),
  }
}

export default function EcoOnePage() {
  return <EcoOneView />
}
