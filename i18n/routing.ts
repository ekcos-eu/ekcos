import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['en', 'es', 'fr', 'de', 'it', 'cs'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // next-intl would emit x-default without a locale (/eco-one → 404).
  // Hreflang is set in metadata instead, with x-default → /en/…
  alternateLinks: false,
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
