import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { ContactForm } from '@/components/contact/contact-form'
import { CompanyDetailsBlock } from '@/components/company/company-details-block'
import { FadeIn } from '@/components/ui/fade-in'
import Script from 'next/script'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/contact`])),
    },
  }
}

export default async function ContactPage() {
  const t = await getTranslations('contact')
  const contactLdJson = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: t('hero.title'),
    description: t('hero.subtitle'),
  }

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
        </FadeIn>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#575756]">{t('details.title')}</h2>
            <dl className="mt-6 space-y-4 text-sm text-[#575756]/88">
              <div className="border-b border-black/[0.06] pb-4">
                <dt className="font-medium text-[#575756]">{t('details.email')}</dt>
                <dd className="mt-1">
                  <a className="text-[#0F68B2] underline-offset-4 hover:underline" href="mailto:info@ekcos.eu">
                    info@ekcos.eu
                  </a>
                </dd>
              </div>
              <div className="border-b border-black/[0.06] pb-4">
                <dt className="font-medium text-[#575756]">{t('details.phone')}</dt>
                <dd className="mt-1">
                  <a className="text-[#0F68B2] underline-offset-4 hover:underline" href="tel:+000000000">
                    +00 00 000 0000
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[#575756]">{t('details.hours')}</dt>
                <dd className="mt-1">{t('details.hoursValue')}</dd>
              </div>
            </dl>
            <CompanyDetailsBlock
              className="mt-8 rounded-xl border border-black/[0.08] bg-[#f8fafc] p-6"
              labels={{
                title: t('company.title'),
                registryCode: t('company.registryCode'),
                vatIdCz: t('company.vatIdCz'),
              }}
            />
          </FadeIn>
          <FadeIn delay={0.2} className="rounded-xl border border-black/[0.08] bg-white p-6 sm:p-8">
            <ContactForm />
          </FadeIn>
        </div>
      </div>
      <Script id="ldjson-contact" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLdJson) }} />
    </div>
  )
}
