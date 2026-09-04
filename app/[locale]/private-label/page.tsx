import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { PrivateLabelView } from '@/components/private-label/private-label-view'
import { localeSeo } from '@/lib/seo'

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
    ...localeSeo(locale, '/private-label'),
  }
}

export default function PrivateLabelPage() {
  return <PrivateLabelView />
}
