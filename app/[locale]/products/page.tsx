import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/routing'
import { ProductConfigurator } from '@/components/products/product-configurator'
import { products } from '@/lib/products'
import { routing } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { SHOP_BASE_URL } from '@/lib/brand'
import { ConfiguratorBoundary } from '@/components/error-boundaries/configurator-boundary'
import { FadeIn } from '@/components/ui/fade-in'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: t('productsTitle'),
    description: t('productsDescription'),
    alternates: {
      canonical: `/${locale}/products`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/products`])),
    },
  }
}

export default async function ProductsPage() {
  const t = await getTranslations('products.page')
  const common = await getTranslations('common')

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-[#f8fafc] ekcos-noise">
        <div className="absolute inset-0 z-0 opacity-[0.15] mix-blend-multiply pointer-events-none">
          <video autoPlay loop muted playsInline className="h-full w-full object-cover">
            <source src="/videos/background.mp4" type="video/mp4" />
          </video>
        </div>
        <FadeIn className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-14 lg:px-8 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0F68B2]">{t('heroEyebrow')}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#575756] text-balance sm:text-5xl">{t('heroTitle')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#575756]/88 text-pretty text-balance">{t('heroSubtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href={SHOP_BASE_URL} target="_blank" rel="noopener noreferrer">
                {common('shopCta')}
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/eco-one">{t('heroLinkEco')}</Link>
            </Button>
          </div>
        </FadeIn>
      </section>
      <FadeIn delay={0.2}>
        <ConfiguratorBoundary>
          <ProductConfigurator products={products} initialSlug="xcren-hd" />
        </ConfiguratorBoundary>
      </FadeIn>
    </div>
  )
}
