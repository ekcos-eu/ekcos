import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export const proxy = createMiddleware(routing)

export const config = {
  // Skip API, Studio, Next internals, and files with extensions
  // (robots.txt, sitemap.xml, images) so [locale] cannot treat them as a language.
  matcher: ['/((?!api|_next|_vercel|studio|.*\\..*).*)'],
}
