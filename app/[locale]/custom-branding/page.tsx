import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { Section, SectionHeading } from '@/components/section'
import { ContactForm } from '@/components/contact/contact-form'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/fade-in'
import { SHOP_BASE_URL } from '@/lib/brand'
import {
  brandingPricingDetails,
  customMixMoqRows,
  standardBrandingMoqRows,
} from '@/data/custom-branding-content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: t('brandingTitle'),
    description: t('brandingDescription'),
    alternates: {
      canonical: `/${locale}/custom-branding`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/custom-branding`])),
    },
  }
}

export default async function CustomBrandingPage() {
  const t = await getTranslations('customBranding')
  const common = await getTranslations('common')
  const brandingLdJson = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('hero.title'),
    description: t('hero.subtitle'),
    about: ['private labeling', 'custom branding', 'commercial hygiene product branding'],
  }
  const pricingCards = (['entryFee', 'brandingCost', 'packagingLabels'] as const).map((key) => ({
    key,
    title: t(`pricing.${key}`),
    items: brandingPricingDetails[key].items,
  }))

  return (
    <div className="overflow-x-hidden">
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-[#f8fafc] ekcos-noise">
        <div className="absolute inset-0 z-0 opacity-[0.15] mix-blend-multiply pointer-events-none">
          <video autoPlay loop muted playsInline className="h-full w-full object-cover">
            <source src="/videos/background.mp4" type="video/mp4" />
          </video>
        </div>
        <FadeIn className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0F68B2]">{t('hero.eyebrow')}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#575756] text-balance sm:text-5xl">{t('hero.title')}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#575756]/88 text-pretty text-balance">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href="#inquiry">{t('inquiry.title')}</a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={SHOP_BASE_URL} target="_blank" rel="noopener noreferrer">
                {common('shopCta')}
              </a>
            </Button>
          </div>
        </FadeIn>
      </section>

      <Section variant="muted">
        <FadeIn className="grid gap-5 md:grid-cols-3">
          {(['private', 'cutouts', 'print'] as const).map((key) => (
            <div key={key} className="rounded-xl border border-black/[0.08] bg-white p-5">
              <h2 className="text-base font-semibold text-[#575756]">{t(`sections.${key}.title`)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#575756]/85">{t(`sections.${key}.body`)}</p>
            </div>
          ))}
        </FadeIn>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading title={t('pricing.title')} description={t('pricing.description')} />
        </FadeIn>
        <FadeIn delay={0.2} className="mt-10 grid gap-5 lg:grid-cols-3">
          {pricingCards.map((card) => (
            <div key={card.key} className="rounded-xl border border-black/[0.08] bg-[#f8fafc] p-5">
              <h2 className="text-base font-semibold text-[#575756]">{card.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#575756]/88">
                {card.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0F68B2]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </FadeIn>
      </Section>

      <Section variant="muted">
        <FadeIn>
          <SectionHeading title={t('standardMoq.title')} description={t('standardMoq.description')} />
        </FadeIn>
        <FadeIn delay={0.2} className="mt-8 overflow-hidden rounded-xl border border-black/[0.08] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/[0.06] text-left text-sm">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#575756]">{t('standardMoq.productLabel')}</th>
                  <th className="px-4 py-3 font-semibold text-[#575756]">{t('standardMoq.moqLabel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {standardBrandingMoqRows.map((row) => (
                  <tr key={row.product}>
                    <td className="px-4 py-3 text-[#575756]">{row.product}</td>
                    <td className="px-4 py-3 text-[#575756]/88">{row.moq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="mt-4 text-sm leading-relaxed text-[#575756]/75">{t('standardMoq.note')}</p>
        </FadeIn>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading title={t('customMix.title')} description={t('customMix.description')} />
        </FadeIn>
        <FadeIn delay={0.2} className="mt-8 overflow-hidden rounded-xl border border-black/[0.08] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/[0.06] text-left text-sm">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#575756]">{t('customMix.productLabel')}</th>
                  <th className="px-4 py-3 font-semibold text-[#575756]">{t('customMix.moqLabel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {customMixMoqRows.map((row) => (
                  <tr key={row.product}>
                    <td className="px-4 py-3 text-[#575756]">{row.product}</td>
                    <td className="px-4 py-3 text-[#575756]/88">{row.moq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="mt-4 text-sm leading-relaxed text-[#575756]/75">{t('customMix.note')}</p>
        </FadeIn>
      </Section>

      <Section id="inquiry">
        <FadeIn>
          <SectionHeading title={t('inquiry.title')} description={t('inquiry.hint')} />
        </FadeIn>
        <FadeIn delay={0.2} className="mx-auto mt-8 max-w-xl rounded-xl border border-black/[0.08] bg-[#f8fafc] p-6 sm:p-8">
          <ContactForm />
        </FadeIn>
      </Section>
      <Script id="ldjson-custom-branding" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandingLdJson) }} />
    </div>
  )
}
