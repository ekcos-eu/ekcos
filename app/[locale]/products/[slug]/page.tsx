import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { getProductDetailBySlug, getAllProductSlugs } from '@/lib/csv-products'
import { getProductBySlug } from '@/lib/products'
import { ProductDetailView } from './product-detail-view'

type PageParams = Promise<{ locale: string; slug: string }>

export async function generateStaticParams() {
  const slugs = getAllProductSlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: PageParams
}): Promise<Metadata> {
  const { locale, slug } = await params
  const detail = getProductDetailBySlug(slug)
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  if (!detail) {
    return { title: t('title') }
  }

  return {
    title: `${detail.title} | ëkcos`,
    description: t('productsDescription'),
    alternates: {
      canonical: `/${locale}/products/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/products/${slug}`]),
      ),
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: PageParams
}) {
  const { locale, slug } = await params
  const detail = getProductDetailBySlug(slug)
  if (!detail) notFound()

  const product = getProductBySlug(slug)
  if (!product) notFound()

  const t = await getTranslations({ locale })

  const localizedProduct = {
    name: t(product.nameKey),
    shortDescription: t(product.shortDescriptionKey),
    longDescription: t(product.longDescriptionKey),
    benefits: product.benefitKeys.map((k) => t(k)),
    colorLabels: Object.fromEntries(
      product.colors.map((c) => [c.id, t(c.labelKey)]),
    ),
  }

  return (
    <ProductDetailView
      detail={detail}
      localizedProduct={localizedProduct}
      slug={slug}
    />
  )
}
