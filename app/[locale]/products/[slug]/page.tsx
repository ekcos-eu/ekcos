import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { getProductDetailBySlug, getAllProductSlugs } from '@/lib/csv-products'
import { getProductBySlug } from '@/lib/products'
import { ProductDetailBoundary } from '@/components/error-boundaries/product-detail-boundary'
import { HOME_OG_IMAGE, pageSeo } from '@/lib/seo'
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

  const product = getProductBySlug(slug)
  const tProducts = await getTranslations({ locale })
  const localizedTitle = product
    ? tProducts(product.nameKey)
    : detail.title

  return pageSeo({
    locale,
    path: `/products/${slug}`,
    title: localizedTitle,
    description: product
      ? tProducts(product.shortDescriptionKey)
      : t('productsDescription'),
    image: product
      ? {
          url: product.heroImageSrc,
          alt: localizedTitle,
        }
      : HOME_OG_IMAGE,
  })
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
  const tDetail = await getTranslations({ locale, namespace: 'productDetail' })

  const localizedProduct = {
    name: t(product.nameKey),
    shortDescription: t(product.shortDescriptionKey),
    longDescription: t(product.longDescriptionKey),
    benefits: product.benefitKeys.map((k) => t(k)),
    /** Localized "color / scent" label keyed by imageSrc */
    colorLabelsByImage: Object.fromEntries(
      product.colors.map((c) => [c.imageSrc, t(c.labelKey)]),
    ),
  }

  return (
    <ProductDetailBoundary fallbackMessage={tDetail('boundaryError')}>
      <ProductDetailView
        detail={detail}
        localizedProduct={localizedProduct}
        slug={slug}
      />
    </ProductDetailBoundary>
  )
}
