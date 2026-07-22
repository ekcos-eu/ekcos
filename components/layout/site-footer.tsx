import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Separator } from '@/components/ui/separator'
import { FooterNewsletterForm } from '@/components/newsletter/footer-newsletter-form'
import { CompanyDetailsBlock } from '@/components/company/company-details-block'
import { NewsletterBoundary } from '@/components/error-boundaries/newsletter-boundary'
import { FadeIn } from '@/components/ui/fade-in'
import { SHOP_BASE_URL } from '@/lib/brand'

type ExploreLink =
  | { kind: 'internal'; href: '/' | '/articles' | '/eco-one' | '/private-label'; label: string }
  | { kind: 'external'; href: string; label: string }

export async function SiteFooter() {
  const t = await getTranslations('footer')
  const nav = await getTranslations('nav')

  const links: ExploreLink[] = [
    { kind: 'internal', href: '/', label: nav('home.label') },
    { kind: 'internal', href: '/articles', label: nav('articles.label') },
    { kind: 'internal', href: '/eco-one', label: nav('ecoOne.label') },
    { kind: 'internal', href: '/private-label', label: nav('privateLabel.label') },
    { kind: 'external', href: `${SHOP_BASE_URL}/pages/faq`, label: nav('faq.label') },
    { kind: 'external', href: `${SHOP_BASE_URL}/pages/contact`, label: nav('contact.label') },
  ]

  return (
    <footer className="border-t border-black/[0.06] bg-[#fcfcfd]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <FadeIn className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Image
              src="/logo.png"
              alt={nav('logoAlt')}
              width={140}
              height={40}
              className="mb-4 h-9 w-auto object-contain"
            />
            <p className="max-w-sm text-sm leading-relaxed text-[#575756]/90">{t('tagline')}</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#575756]">
              {t('explore')}
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  {link.kind === 'internal' ? (
                    <Link
                      href={link.href}
                      className="text-sm text-[#575756] transition-colors hover:text-[#0F68B2]"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#575756] transition-colors hover:text-[#0F68B2]"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <CompanyDetailsBlock
            labels={{
              title: t('company.title'),
              registryCode: t('company.registryCode'),
              vatIdCz: t('company.vatIdCz'),
            }}
          />
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#575756]">
              {t('newsletterTitle')}
            </h3>
            <p className="mb-3 text-sm text-[#575756]/85">{t('newsletterHint')}</p>
            <NewsletterBoundary>
              <FooterNewsletterForm />
            </NewsletterBoundary>
          </div>
        </FadeIn>
        <Separator className="my-8 bg-black/[0.08]" />
        <div className="flex flex-col gap-3 text-sm text-[#575756]/75 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          <p className="text-xs">{t('legalNote')}</p>
        </div>
      </div>
    </footer>
  )
}
