import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '../../i18n/routing'
import type { Metadata } from 'next'
import { SiteShell } from '@/components/layout/site-shell'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ekcos.eu'

  return {
    metadataBase: new URL(base),
    title: { default: t('title'), template: '%s | ëkcos' },
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`]))
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale,
      type: 'website',
      images: [
        {
          url: '/og.png',
          width: 1024,
          height: 536,
          alt: 'ëkcos product lineup'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og.png']
    }
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const messages = await getMessages()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ekcos.eu'
  // Chatfuel sometimes calls console.error(null), which Next.js devtools turns into a blocking overlay.
  const loadChatfuel =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_CHATFUEL_IN_DEV === '1'
  const organizationLdJson = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EKCOS',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: ['https://eshop.ekcos.eu']
  }

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <SiteShell>{children}</SiteShell>
      </NextIntlClientProvider>
      <Script
        id='ldjson-organization'
        type='application/ld+json'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationLdJson)
        }}
      />
      {loadChatfuel ? (
        <Script
          id='chatfuel-widget'
          src='https://panel.chatfuel.com/widgets/chat-widget/chat-widget.js'
          data-bot='69cd017874eb4a6d547fe271'
          data-zindex='99999'
          strategy='afterInteractive'
        />
      ) : null}
    </>
  )
}
