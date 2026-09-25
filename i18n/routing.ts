import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { defaultLocale, locales } from './locales'

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  // IP + cookie handled in proxy.ts; disable Accept-Language auto-switch.
  localeDetection: false,
  // next-intl would emit x-default without a locale (/eco-one → 404).
  // Hreflang is set in metadata instead, with x-default → /en/…
  alternateLinks: false,
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
