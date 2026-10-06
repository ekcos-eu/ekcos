import { PageContainer } from '@/components/layout/page-container'
import { PageHero } from '@/components/layout/page-hero'
import { FadeIn } from '@/components/ui/fade-in'
import { Link } from '@/i18n/routing'
import { linkifyPlainText } from '@/lib/article-product-links'
import { getTranslations } from 'next-intl/server'
import { ChevronRight } from 'lucide-react'

export async function FaqHubView() {
  const t = await getTranslations('faq')

  const cards = [
    {
      href: '/faq/distributors' as const,
      title: t('nav.distributors'),
      description: t('hub.distributorsDescription'),
    },
    {
      href: '/faq/eshop' as const,
      title: t('nav.eshop'),
      description: t('hub.eshopDescription'),
    },
  ]

  return (
    <div className="overflow-x-hidden bg-white text-[#2c2c2c]">
      <PageHero>
        <FadeIn>
          <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a] text-balance sm:text-5xl">
            {t('hub.title')}
          </h1>
          <p className="mt-5 text-xl font-bold leading-snug text-[#0F68B2] text-balance sm:text-2xl">
            {t('hub.tagline')}
          </p>
          <p className="mt-6 text-justify text-base leading-relaxed text-[#575756] sm:text-lg sm:leading-[1.7]">
            {linkifyPlainText(t('hub.intro'))}
          </p>
        </FadeIn>
      </PageHero>

      <PageContainer className="grid gap-4 py-12 sm:gap-6 sm:py-16">
        {cards.map((card) => (
          <FadeIn key={card.href}>
            <Link
              href={card.href}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-black/[0.08] bg-white px-5 py-6 transition-colors hover:border-[#0F68B2]/35 hover:bg-[#eef6fc]/40 sm:px-7 sm:py-8"
            >
              <div>
                <h2 className="text-xl font-bold text-[#1a1a1a] group-hover:text-[#0F68B2] sm:text-2xl">
                  {card.title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-[#575756]">
                  {card.description}
                </p>
              </div>
              <ChevronRight
                className="mt-1 h-6 w-6 shrink-0 text-[#0F68B2] transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </FadeIn>
        ))}
      </PageContainer>
    </div>
  )
}
