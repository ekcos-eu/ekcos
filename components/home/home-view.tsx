import Image from 'next/image'
import Script from 'next/script'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Section, SectionHeading } from '@/components/section'
import { Button } from '@/components/ui/button'
import { ProductConfigurator } from '@/components/products/product-configurator'
import { ConfiguratorBoundary } from '@/components/error-boundaries/configurator-boundary'
import { SHOP_BASE_URL } from '@/lib/brand'
import { getHomeHeroImages } from '@/lib/home-hero-images'
import { products } from '@/lib/products'
import { cn, shuffled } from '@/lib/utils'
import { ArrowRight, Clock, Leaf, ShieldCheck, Truck } from 'lucide-react'
import heroMarqueeStyles from './hero-product-marquee.module.css'
import { FadeIn } from '@/components/ui/fade-in'

const BENEFIT_ICONS = [Leaf, ShieldCheck, Clock, Truck] as const
const BENEFIT_KEYS = ['eco', 'hygiene', 'costs', 'distributor'] as const

const HERO_MARQUEE_ROW_COUNT = 7
const HERO_MARQUEE_DURATION_BASE_S = 320
const HERO_MARQUEE_DURATION_STEP_S = 48
const HERO_MARQUEE_DELAY_STEP_S = 14

export async function HomeView() {
  const t = await getTranslations('home')
  const heroImages = await getHomeHeroImages()
  const heroRows = Array.from({ length: HERO_MARQUEE_ROW_COUNT }, () => {
    const row = heroImages.length > 0 ? shuffled(heroImages) : heroImages
    return [...row, ...row, ...row]
  })

  const homeLdJson = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('hero.title'),
    description: t('hero.body'),
    isPartOf: {
      '@type': 'WebSite',
      name: 'EKCOS',
      url: 'https://ekcos.eu',
    },
    about: ['ecological technologies', 'odor control', 'commercial hygiene solutions'],
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-[#0F68B2] ekcos-noise">
        <div className="absolute inset-0 z-0 opacity-50 mix-blend-soft-light pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            <source src="/videos/background.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 select-none" aria-hidden>
          <div
            className="absolute inset-0 flex flex-col justify-center gap-[0.35rem] overflow-hidden opacity-[0.42] [mask-image:linear-gradient(to_bottom,transparent_0%,black_4%,black_96%,transparent_100%)] sm:gap-[0.4rem] sm:opacity-[0.48]"
          >
            {heroRows.map((rowImages, rowIndex) => (
              <div
                key={`hero-row-${rowIndex}`}
                className={cn(
                  'flex w-max gap-[0.55rem]',
                  heroMarqueeStyles.animMarquee,
                  rowIndex % 2 === 1 && heroMarqueeStyles.animMarqueeReverse,
                )}
                style={{
                  animationDuration: `${HERO_MARQUEE_DURATION_BASE_S + rowIndex * HERO_MARQUEE_DURATION_STEP_S}s`,
                  animationDelay: `${-rowIndex * HERO_MARQUEE_DELAY_STEP_S}s`,
                }}
              >
                {rowImages.map((src, imageIndex) => (
                  <div
                    key={`hero-row-${rowIndex}-${src}-${imageIndex}`}
                    className="relative h-[60px] w-[80px] shrink-0 sm:h-[68px] sm:w-[92px]"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 80px, 92px"
                      className="object-contain opacity-90 saturate-[0.65]"
                      priority={rowIndex < 3 && imageIndex < 10}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-[#0F68B2]/22" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F68B2]/12 via-[#0F68B2]/28 to-[#0F68B2]/40" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-xl font-medium text-white/95 sm:text-2xl">{t('hero.tagline')}</p>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 text-pretty sm:text-lg">
              {t('hero.body')}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-10 h-12 rounded-none bg-white px-8 text-sm font-semibold tracking-[0.12em] text-[#0F68B2] uppercase hover:bg-white/92"
            >
              <Link href="/products">{t('hero.ctaProducts')}</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      <Section className="border-b border-black/[0.06] py-12 sm:py-14 lg:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {BENEFIT_KEYS.map((key, index) => {
            const Icon = BENEFIT_ICONS[index]
            return (
              <FadeIn key={key} delay={index * 0.06}>
                <article className="flex h-full flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F68B2]/10 text-[#0F68B2]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h2 className="mt-4 text-lg font-bold tracking-tight text-[#575756]">
                    {t(`benefits.${key}.title`)}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#575756]/85">
                    {t(`benefits.${key}.body`)}
                  </p>
                  {key === 'eco' && (
                    <Link
                      href="/eco-one"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#0F68B2] hover:underline"
                    >
                      {t('benefits.ecoLink')}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </article>
              </FadeIn>
            )
          })}
        </div>
      </Section>

      <Section className="py-14 sm:py-16 lg:py-20 relative">
        <FadeIn>
          <SectionHeading title={t('productsTeaser.title')} description={t('productsTeaser.body')} />
        </FadeIn>
        <FadeIn delay={0.2} className="mx-auto mt-10 max-w-[1600px]">
          <ConfiguratorBoundary>
            <ProductConfigurator products={products} initialSlug="xcren-hd" embedded />
          </ConfiguratorBoundary>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-[#575756]/75">
            <Link href="/products" className="font-medium text-[#0F68B2] underline-offset-4 hover:underline">
              {t('productsTeaser.link')}
            </Link>
          </p>
        </FadeIn>
      </Section>

      <Section className="border-t border-black/[0.06] py-14 sm:py-16 lg:py-20 relative">
        <FadeIn className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-[#575756]">{t('finalCta.title')}</h2>
          <p className="mt-3 text-[#575756]/85">{t('finalCta.body')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href={SHOP_BASE_URL} target="_blank" rel="noopener noreferrer">
                {t('finalCta.shop')}
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">{t('finalCta.contact')}</Link>
            </Button>
          </div>
        </FadeIn>
      </Section>

      <Script
        id="ldjson-homepage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeLdJson) }}
      />
    </>
  )
}
