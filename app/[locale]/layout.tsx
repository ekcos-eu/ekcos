import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '../../i18n/routing'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/brand'
import { SiteShell } from '@/components/layout/site-shell'

export const dynamicParams = false

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: { default: t('title'), template: '%s | ëkcos' },
    description: t('description'),
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
  const siteUrl = SITE_URL
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
