import Image from 'next/image'
import Script from 'next/script'
import { getTranslations } from 'next-intl/server'
import type { LucideIcon } from 'lucide-react'
import { Check, Download, ExternalLink, FlaskConical, Leaf, Recycle, ShieldCheck } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { DocumentPreviewCard } from '@/components/eco-one/document-preview-card'
import { Section, SectionHeading } from '@/components/section'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/fade-in'

const PDF_HREF = '/technical/eco-one.pdf'

export async function EcoOneView() {
  const t = await getTranslations('ecoOne')

  const ecoOneLdJson = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('hero.title'),
    description: t('hero.subtitle'),
    about: ['biodegradation technology', 'odor control science', 'eco cleaning evidence'],
  }

  const metrics = [
    { value: t('hero.metrics.degradation.value'), label: t('hero.metrics.degradation.label') },
    { value: t('hero.metrics.duration.value'), label: t('hero.metrics.duration.label') },
    { value: t('hero.metrics.standards.value'), label: t('hero.metrics.standards.label') },
    { value: t('hero.metrics.additive.value'), label: t('hero.metrics.additive.label') },
  ]

  const evidenceCards = [
    {
      src: '/technical/eco-one-pages/evidence-certificate.jpg',
      alt: t('evidence.cards.certificate.alt'),
      title: t('evidence.cards.certificate.title'),
      body: t('evidence.cards.certificate.body'),
    },
    {
      src: '/technical/eco-one-pages/evidence-biodegrad-chart.jpg',
      alt: t('evidence.cards.chart.alt'),
      title: t('evidence.cards.chart.title'),
      body: t('evidence.cards.chart.body'),
    },
    {
      src: '/technical/eco-one-pages/evidence-results-conclusion.jpg',
      alt: t('evidence.cards.table.alt'),
      title: t('evidence.cards.table.title'),
      body: t('evidence.cards.table.body'),
    },
  ]

  const documentCards = [
    {
      src: '/technical/eco-one-pages/enhanced-biodegradation-certification.jpg',
      alt: t('documents.cards.enhanced.alt'),
      title: t('documents.cards.enhanced.title'),
      body: t('documents.cards.enhanced.body'),
    },
    {
      src: '/technical/eco-one-pages/technical-data-sheet.jpg',
      alt: t('documents.cards.dataSheet.alt'),
      title: t('documents.cards.dataSheet.title'),
      body: t('documents.cards.dataSheet.body'),
    },
    {
      src: '/technical/eco-one-pages/faq-sheet.jpg',
      alt: t('documents.cards.faq.alt'),
      title: t('documents.cards.faq.title'),
      body: t('documents.cards.faq.body'),
    },
  ]

  const regulatoryCards = [
    {
      src: '/technical/eco-one-pages/fda-regulatory-status.jpg',
      alt: t('regulatory.cards.fda.alt'),
      title: t('regulatory.cards.fda.title'),
      body: t('regulatory.cards.fda.body'),
    },
    {
      src: '/technical/eco-one-pages/proposition-65.jpg',
      alt: t('regulatory.cards.prop65.alt'),
      title: t('regulatory.cards.prop65.title'),
      body: t('regulatory.cards.prop65.body'),
    },
    {
      src: '/technical/eco-one-pages/safe-water-system.jpg',
      alt: t('regulatory.cards.safeWater.alt'),
      title: t('regulatory.cards.safeWater.title'),
      body: t('regulatory.cards.safeWater.body'),
    },
  ]

  const howSteps = [t('how.steps.0'), t('how.steps.1'), t('how.steps.2')]
  const faqItems = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ]
  const highlights = [
    t('summary.highlights.0'),
    t('summary.highlights.1'),
    t('summary.highlights.2'),
    t('summary.highlights.3'),
  ]

  return (
    <div className="overflow-x-hidden">
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-[linear-gradient(165deg,#f0f7fc_0%,#f8fafc_45%,#ffffff_100%)] ekcos-noise">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14 lg:py-20">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0F68B2]">{t('hero.eyebrow')}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#575756] text-balance sm:text-5xl">{t('hero.title')}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#575756]/90 text-pretty">{t('hero.subtitle')}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#575756]/75 text-pretty">{t('hero.body')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={PDF_HREF} target="_blank" rel="noopener noreferrer">
                  <Download className="size-4" aria-hidden />
                  {t('cta.download')}
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/products">{t('cta.products')}</Link>
              </Button>
            </div>
          </FadeIn>
          <FadeIn delay={0.15} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-lg ring-1 ring-black/[0.04]">
              <Image
                src="/technical/eco-one-pages/cover.jpg"
                alt={t('hero.coverAlt')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 480px"
                priority
              />
            </div>
          </FadeIn>
        </div>
        <div className="border-t border-black/[0.06] bg-white/80 backdrop-blur-sm">
          <div className="mx-auto grid max-w-6xl gap-px bg-black/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-white px-4 py-5 sm:px-6">
                <p className="text-2xl font-bold tracking-tight text-[#0F68B2]">{metric.value}</p>
                <p className="mt-1.5 text-xs leading-snug text-[#575756]/80 text-pretty">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-5 lg:grid-cols-3">
          <IntroCard icon={Leaf} title={t('what.title')} body={t('what.body')} delay={0} />
          <IntroCard icon={Recycle} title={t('how.title')} steps={howSteps} delay={0.08} />
          <IntroCard icon={ShieldCheck} title={t('value.title')} body={t('value.body')} delay={0.16} />
        </div>
      </Section>

      <Section variant="muted" id="documents">
        <FadeIn>
          <SectionHeading
            align="left"
            eyebrow={t('summary.eyebrow')}
            title={t('summary.title')}
            description={t('summary.description')}
          />
        </FadeIn>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <FadeIn delay={0.1}>
            <h3 className="text-sm font-semibold text-[#575756]">{t('summary.highlightsTitle')}</h3>
            <ul className="mt-4 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#575756]/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#0F68B2]" aria-hidden />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6" variant="secondary">
              <a href={PDF_HREF} target="_blank" rel="noopener noreferrer">
                <Download className="size-4" aria-hidden />
                {t('reference.linkLabel')}
              </a>
            </Button>
          </FadeIn>
          <FadeIn delay={0.15}>
            <aside className="rounded-xl border border-[#0F68B2]/15 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0F68B2]">{t('summary.noteEyebrow')}</p>
              <h3 className="mt-2 text-base font-semibold text-[#575756]">{t('summary.noteTitle')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#575756]/80 text-pretty">{t('summary.noteBody')}</p>
              <p className="mt-4 text-sm leading-relaxed text-[#575756]/80 text-pretty">{t('claims.body')}</p>
            </aside>
          </FadeIn>
        </div>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading eyebrow={t('evidence.eyebrow')} title={t('evidence.title')} description={t('evidence.description')} />
        </FadeIn>
        <FadeIn delay={0.1} className="mt-10 rounded-xl border border-black/[0.08] bg-[#f0f7fc] p-6 sm:p-8">
          <MethodologyPanel t={t} />
        </FadeIn>
        <FadeIn delay={0.2} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {evidenceCards.map((card) => (
            <DocumentPreviewCard key={card.title} {...card} />
          ))}
        </FadeIn>
      </Section>

      <Section variant="muted">
        <FadeIn>
          <SectionHeading eyebrow={t('documents.eyebrow')} title={t('documents.title')} description={t('documents.description')} />
        </FadeIn>
        <FadeIn delay={0.15} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {documentCards.map((card) => (
            <DocumentPreviewCard key={card.title} {...card} />
          ))}
        </FadeIn>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading
            eyebrow={t('regulatory.eyebrow')}
            title={t('regulatory.title')}
            description={t('regulatory.description')}
          />
        </FadeIn>
        <FadeIn delay={0.15} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {regulatoryCards.map((card) => (
            <DocumentPreviewCard key={card.title} {...card} />
          ))}
        </FadeIn>
      </Section>

      <Section variant="muted">
        <FadeIn className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0F68B2]">{t('breakdown.eyebrow')}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#575756] text-balance sm:text-3xl">{t('breakdown.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-[#575756]/85 text-pretty">{t('breakdown.body')}</p>
            <div className="mt-6 rounded-xl border border-black/[0.08] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#575756]">{t('reference.externalLabel')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#575756]/80 text-pretty">{t('reference.disclaimer')}</p>
              <Button asChild variant="secondary" className="mt-4">
                <a href="https://ecologic-llc.com/product/how-eco-one-works" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" aria-hidden />
                  {t('reference.externalLabel')}
                </a>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm">
            <Image
              src="/technical/eco-one-pages/final-breakdown.jpg"
              alt={t('breakdown.imageAlt')}
              fill
              className="object-contain p-2"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </FadeIn>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading title={t('faq.title')} />
        </FadeIn>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {faqItems.map((item, i) => (
            <FadeIn key={item.q} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-black/[0.08] bg-white p-5">
                <h3 className="text-sm font-semibold text-[#575756]">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#575756]/80 text-pretty">{item.a}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section variant="dark" className="!py-12 sm:!py-14">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white text-balance sm:text-3xl">{t('claims.title')}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/82 text-pretty">{t('claims.body')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-[#0F68B2] hover:bg-white/90">
              <a href={PDF_HREF} target="_blank" rel="noopener noreferrer">
                <Download className="size-4" aria-hidden />
                {t('cta.download')}
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/products">{t('cta.products')}</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/70">
            <Link href="/contact" className="font-medium text-[#9ed0ff] underline-offset-4 hover:underline">
              {t('cta.contact')}
            </Link>
          </p>
        </FadeIn>
      </Section>

      <Script id="ldjson-eco-one" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ecoOneLdJson) }} />
    </div>
  )
}

function IntroCard({
  icon: Icon,
  title,
  body,
  steps,
  delay,
}: {
  icon: LucideIcon
  title: string
  body?: string
  steps?: string[]
  delay: number
}) {
  return (
    <FadeIn delay={delay}>
      <div className="flex h-full flex-col rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#0F68B2]/10 text-[#0F68B2]">
          <Icon className="size-5" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[#575756]">{title}</h2>
        {body ? (
          <p className="mt-3 text-sm leading-relaxed text-[#575756]/85 text-pretty">{body}</p>
        ) : (
          <ol className="mt-3 space-y-2.5">
            {steps?.map((step, idx) => (
              <li key={step} className="flex gap-2.5 text-sm leading-relaxed text-[#575756]/85">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0F68B2]/12 text-xs font-semibold text-[#0F68B2]">
                  {idx + 1}
                </span>
                <span className="text-pretty">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </FadeIn>
  )
}

function MethodologyPanel({ t }: { t: Awaited<ReturnType<typeof getTranslations<'ecoOne'>>> }) {
  return (
    <div className="flex gap-4">
      <div className="hidden size-11 shrink-0 items-center justify-center rounded-lg bg-[#0F68B2]/12 text-[#0F68B2] sm:flex">
        <FlaskConical className="size-5" aria-hidden />
      </div>
      <div>
        <h3 className="text-base font-semibold text-[#575756]">{t('evidence.methodology.title')}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#575756]/85 text-pretty">{t('evidence.methodology.body')}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-[#575756]">{t('evidence.methodology.sample')}</dt>
          </div>
          <div>
            <dt className="font-medium text-[#575756]">{t('evidence.methodology.date')}</dt>
            <dd className="mt-0.5 text-[#575756]/75">{t('evidence.methodology.author')}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
