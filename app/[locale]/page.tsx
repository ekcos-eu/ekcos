import { HomeView } from '@/components/home/home-view'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { HOME_OG_IMAGE, pageSeo } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return pageSeo({
    locale,
    title: t('title'),
    description: t('description'),
    image: HOME_OG_IMAGE,
  })
}

export default async function HomePage() {
  return <HomeView />
}
