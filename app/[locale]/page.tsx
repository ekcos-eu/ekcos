import { HomeView } from '@/components/home/home-view'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { localeSeo } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
    ...localeSeo(locale),
  }
}

export default async function HomePage() {
  return <HomeView />
}
