import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { FaqView } from '@/components/faq/faq-view'
import { getFaqContent } from '@/lib/faq'
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
    path: '/faq/distributors',
    title: t('faqDistributorsTitle'),
    description: t('faqDistributorsDescription'),
  })
}

export default async function FaqDistributorsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const content = getFaqContent('distributors', locale)
  return <FaqView audience="distributors" content={content} />
}
