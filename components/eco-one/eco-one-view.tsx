import {ComparisonChart} from '@/components/eco-one/comparison-chart'
import {PageHero} from '@/components/layout/page-hero'
import {FadeIn} from '@/components/ui/fade-in'
import {Button} from '@/components/ui/button'
import {SHOP_BASE_URL} from '@/lib/brand'
import {ExternalLink} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import Script from 'next/script'

export async function EcoOneView() {
  const t = await getTranslations('ecoOne')

  const metrics = [
    {value: t('metrics.additive.value'), label: t('metrics.additive.label')},
    {value: t('metrics.measured.value'), label: t('metrics.measured.label')},
    {value: t('metrics.projected.value'), label: t('metrics.projected.label')},
  ] as const

  const ecoOneLdJson = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('hero.title'),
    description: t('hero.tagline'),
    about: ['Eco One additive', 'biodegradable washroom products', 'landfill biodegradation'],
  }

  return (
    <div className="overflow-x-hidden bg-white">
      <PageHero>
        <FadeIn>
          <h1 className="text-4xl font-bold tracking-tight text-[#575756] text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {t('hero.title')}
          </h1>
          <p className="mt-5 text-xl font-medium leading-snug text-[#0F68B2] text-balance sm:text-2xl">
            {t('hero.tagline')}
          </p>
          <p className="mt-6 text-base leading-relaxed text-[#575756]/88 text-justify sm:text-lg">
            {t('hero.body')}
          </p>
        </FadeIn>
      </PageHero>

      <section className="border-b border-black/[0.06]">
        <div className="mx-auto grid max-w-3xl gap-px bg-black/[0.06] sm:grid-cols-3">
          {metrics.map((metric, index) => (
            <FadeIn key={metric.label} delay={index * 0.06}>
              <div className="bg-white px-5 py-7 text-center sm:px-6">
                <p className="text-3xl font-bold tracking-tight text-[#0F68B2]">{metric.value}</p>
                <p className="mt-2 text-sm leading-snug text-[#575756]/75 text-pretty">{metric.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <FadeIn>
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F68B2] text-balance sm:text-3xl">
              {t('problem.title')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#575756]/88 text-justify sm:text-lg">
              {t('problem.body')}
            </p>
            <ComparisonChart className="mt-8" />
          </section>
        </FadeIn>

        <FadeIn delay={0.08}>
          <section className="mt-14 border-t border-black/[0.06] pt-14 sm:mt-16 sm:pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-[#0F68B2] text-balance sm:text-3xl">
              {t('solution.title')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#575756]/88 text-justify sm:text-lg">
              {t('solution.body1')}
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#575756]/88 text-justify sm:text-lg">
              {t('solution.body2')}
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#575756]/88 text-justify sm:text-lg">
              {t('solution.body3')}
            </p>
          </section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className="mt-14 border-t border-black/[0.06] pt-14 sm:mt-16 sm:pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-[#0F68B2] text-balance sm:text-3xl">
              {t('testing.title')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#575756]/88 text-justify sm:text-lg">
              {t('testing.body')}
            </p>
          </section>
        </FadeIn>

        <FadeIn delay={0.12}>
          <section className="mt-14 rounded-2xl bg-[#0F68B2] px-6 py-10 text-white sm:mt-16 sm:px-10 sm:py-12">
            <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{t('closing.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-white/90 text-justify sm:text-lg">{t('closing.body')}</p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-white text-[#0F68B2] hover:bg-white/90">
                <a href={SHOP_BASE_URL} target="_blank" rel="noopener noreferrer">
                  {t('closing.shopCta')}
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </Button>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.14}>
          <p className="mt-10 text-xs leading-relaxed text-[#575756]/55 text-pretty">{t('footnote')}</p>
        </FadeIn>
      </article>

      <Script id="ldjson-eco-one" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ecoOneLdJson) }} />
    </div>
  )
}
