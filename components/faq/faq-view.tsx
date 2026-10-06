import { PageHero } from '@/components/layout/page-hero'
import { FadeIn } from '@/components/ui/fade-in'
import { FaqAccordion } from '@/components/faq/faq-accordion'
import { FaqBoundary } from '@/components/error-boundaries/faq-boundary'
import { Link } from '@/i18n/routing'
import {
  createProductImageAltLookup,
  linkifyPlainText,
} from '@/lib/article-product-links'
import type { FaqAudience, FaqContent } from '@/lib/faq'
import { getTranslations } from 'next-intl/server'
import Script from 'next/script'

type Props = {
  audience: FaqAudience
  content: FaqContent
}

export async function FaqView({ audience, content }: Props) {
  const t = await getTranslations('faq')
  const tProducts = await getTranslations('products')
  const getImageAlt = createProductImageAltLookup((key) => tProducts(key))
  const otherAudience = audience === 'distributors' ? 'eshop' : 'distributors'
  const otherHref =
    otherAudience === 'distributors' ? '/faq/distributors' : '/faq/eshop'
  const otherLabel =
    otherAudience === 'distributors'
      ? t('nav.distributors')
      : t('nav.eshop')

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.categories.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
            .map((block) => {
              if (block.type === 'paragraph') return block.text
              if (block.type === 'list') return block.items.join(' ')
              return block.rows.map((r) => r.join(' ')).join(' ')
            })
            .join(' '),
        },
      })),
    ),
  }

  return (
    <div className="overflow-x-hidden bg-white text-[#2c2c2c]">
      <Script
        id={`faq-schema-${audience}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <PageHero size="md">
        <FadeIn>
          <p className="text-[0.8rem] font-bold tracking-[0.14em] text-[#0F68B2] uppercase">
            {t(`audiences.${audience}.eyebrow`)}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1a1a1a] text-balance sm:text-5xl">
            {linkifyPlainText(content.hero.title, getImageAlt)}
          </h1>
          <p className="mt-4 text-xl font-bold leading-snug text-[#0F68B2] text-balance sm:text-2xl">
            {linkifyPlainText(content.hero.tagline, getImageAlt)}
          </p>
          {content.hero.intro ? (
            <p className="mt-6 text-justify text-base leading-relaxed text-[#575756] sm:text-lg sm:leading-[1.7]">
              {linkifyPlainText(content.hero.intro, getImageAlt)}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-[#575756]">
            {t('switchLabel')}{' '}
            <Link
              href={otherHref}
              className="font-semibold text-[#0F68B2] underline-offset-2 hover:underline"
            >
              {otherLabel}
            </Link>
          </p>
        </FadeIn>
      </PageHero>

      {content.metrics.length > 0 ? (
        <section className="border-b border-black/[0.06] bg-[#fcfcfd]">
          <div className="mx-auto grid max-w-3xl gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-14">
            {content.metrics.map((metric) => (
              <FadeIn key={metric.value + metric.label.slice(0, 12)}>
                <p className="text-3xl font-bold tracking-tight text-[#0F68B2] sm:text-4xl">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#575756] sm:text-base">
                  {linkifyPlainText(metric.label, getImageAlt)}
                </p>
              </FadeIn>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <FadeIn>
          <nav aria-label={t('tocLabel')} className="mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#575756]">
              {t('tocLabel')}
            </h2>
            <ol className="mt-4 flex flex-col gap-2">
              {content.categories.map((cat, i) => (
                <li key={cat.id}>
                  <a
                    href={`#${cat.id}`}
                    className="text-base font-medium text-[#0F68B2] underline-offset-2 hover:underline"
                  >
                    <span className="tabular-nums text-[#575756]">
                      {String(i + 1).padStart(2, '0')}
                    </span>{' '}
                    {cat.title}
                    <span className="ml-1 text-sm font-normal text-[#575756]">
                      ({cat.items.length})
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </FadeIn>

        <FaqBoundary fallbackMessage={t('error')}>
          <div className="space-y-14">
            {content.categories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-24">
                <FadeIn>
                  <h2 className="mb-4 text-2xl font-bold tracking-tight text-[#0F68B2] sm:text-[1.65rem]">
                    {linkifyPlainText(category.title, getImageAlt)}
                  </h2>
                  <FaqAccordion category={category} />
                </FadeIn>
              </section>
            ))}
          </div>
        </FaqBoundary>

        {(content.contact.title || content.contact.body) && (
          <FadeIn className="mt-16 rounded-2xl bg-[#0F68B2] px-6 py-8 text-white sm:px-8">
            <h2 className="text-xl font-bold sm:text-2xl">
              {linkifyPlainText(content.contact.title, getImageAlt)}
            </h2>
            {content.contact.body ? (
              <p className="mt-3 text-base leading-relaxed text-white/90 sm:text-lg">
                {linkifyPlainText(content.contact.body, getImageAlt)}
              </p>
            ) : null}
            <a
              href="mailto:support@ekcos.eu"
              className="mt-5 inline-block text-base font-semibold underline underline-offset-4"
            >
              support@ekcos.eu
            </a>
          </FadeIn>
        )}

        {content.footnote ? (
          <p className="mt-10 text-xs leading-relaxed text-[#575756]/80">
            {linkifyPlainText(content.footnote, getImageAlt)}
          </p>
        ) : null}
      </div>
    </div>
  )
}
