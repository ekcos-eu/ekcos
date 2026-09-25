import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import {
  detectLocaleFromHeaders,
  isAppLocale,
  LOCALE_COOKIE,
  localeCookieOptions,
  type AppLocale,
} from './i18n/locales'

const handleI18nRouting = createMiddleware(routing)

function pathLocale(pathname: string): AppLocale | null {
  const segment = pathname.split('/')[1]
  return isAppLocale(segment) ? segment : null
}

function redirectToLocale(request: NextRequest, locale: AppLocale) {
  const url = request.nextUrl.clone()
  const { pathname } = request.nextUrl
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  const response = NextResponse.redirect(url)
  response.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions)
  return response
}

/**
 * Locale resolution order:
 * 1. NEXT_LOCALE cookie (user choice — remembered in the browser)
 * 2. Explicit locale prefix in the URL (shared links)
 * 3. IP country (Vercel / Cloudflare) → Accept-Language → en
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookieRaw = request.cookies.get(LOCALE_COOKIE)?.value
  const cookieLocale = isAppLocale(cookieRaw) ? cookieRaw : null
  const urlLocale = pathLocale(pathname)

  // Remembered preference: send bare `/` (etc.) to the saved locale
  if (cookieLocale) {
    if (!urlLocale) {
      return redirectToLocale(request, cookieLocale)
    }
    return handleI18nRouting(request)
  }

  // Shared / bookmarked URL with a locale — adopt and remember it
  if (urlLocale) {
    const response = handleI18nRouting(request)
    response.cookies.set(LOCALE_COOKIE, urlLocale, localeCookieOptions)
    return response
  }

  // First visit without a locale prefix — detect from IP / Accept-Language
  const detected = detectLocaleFromHeaders(request.headers)
  return redirectToLocale(request, detected)
}

export const config = {
  // Skip API, Studio, Next internals, and files with extensions
  // (robots.txt, sitemap.xml, images) so [locale] cannot treat them as a language.
  matcher: [
    '/((?!api|_next|_vercel|studio|.*/opengraph-image|.*/twitter-image|.*\\..*).*)',
  ],
}
