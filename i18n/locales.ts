/**
 * Site locales, endonyms, flags, and IP-country → locale mapping.
 * Product copy exists for all of these; UI chrome falls back to English
 * until full translations are added.
 */

export const locales = [
  'en',
  'cs',
  'sk',
  'de',
  'pl',
  'fr',
  'es',
  'it',
  'nl',
  'pt',
  'sv',
  'da',
  'fi',
  'el',
  'hu',
  'ro',
  'bg',
  'hr',
  'sl',
  'et',
  'lv',
  'lt',
] as const

export type AppLocale = (typeof locales)[number]

export const defaultLocale: AppLocale = 'en'

export const localeMeta: Record<
  AppLocale,
  { endonym: string; flag: string; ogLocale: string }
> = {
  en: { endonym: 'English', flag: '🇬🇧', ogLocale: 'en_GB' },
  cs: { endonym: 'Čeština', flag: '🇨🇿', ogLocale: 'cs_CZ' },
  sk: { endonym: 'Slovenčina', flag: '🇸🇰', ogLocale: 'sk_SK' },
  de: { endonym: 'Deutsch', flag: '🇩🇪', ogLocale: 'de_DE' },
  pl: { endonym: 'Polski', flag: '🇵🇱', ogLocale: 'pl_PL' },
  fr: { endonym: 'Français', flag: '🇫🇷', ogLocale: 'fr_FR' },
  es: { endonym: 'Español', flag: '🇪🇸', ogLocale: 'es_ES' },
  it: { endonym: 'Italiano', flag: '🇮🇹', ogLocale: 'it_IT' },
  nl: { endonym: 'Nederlands', flag: '🇳🇱', ogLocale: 'nl_NL' },
  pt: { endonym: 'Português', flag: '🇵🇹', ogLocale: 'pt_PT' },
  sv: { endonym: 'Svenska', flag: '🇸🇪', ogLocale: 'sv_SE' },
  da: { endonym: 'Dansk', flag: '🇩🇰', ogLocale: 'da_DK' },
  fi: { endonym: 'Suomi', flag: '🇫🇮', ogLocale: 'fi_FI' },
  el: { endonym: 'Ελληνικά', flag: '🇬🇷', ogLocale: 'el_GR' },
  hu: { endonym: 'Magyar', flag: '🇭🇺', ogLocale: 'hu_HU' },
  ro: { endonym: 'Română', flag: '🇷🇴', ogLocale: 'ro_RO' },
  bg: { endonym: 'Български', flag: '🇧🇬', ogLocale: 'bg_BG' },
  hr: { endonym: 'Hrvatski', flag: '🇭🇷', ogLocale: 'hr_HR' },
  sl: { endonym: 'Slovenščina', flag: '🇸🇮', ogLocale: 'sl_SI' },
  et: { endonym: 'Eesti', flag: '🇪🇪', ogLocale: 'et_EE' },
  lv: { endonym: 'Latviešu', flag: '🇱🇻', ogLocale: 'lv_LV' },
  lt: { endonym: 'Lietuvių', flag: '🇱🇹', ogLocale: 'lt_LT' },
}

/** ISO 3166-1 alpha-2 → site locale (EU + common markets). */
export const countryToLocale: Record<string, AppLocale> = {
  GB: 'en',
  UK: 'en',
  IE: 'en',
  US: 'en',
  CA: 'en',
  AU: 'en',
  NZ: 'en',
  MT: 'en',
  CY: 'el',

  CZ: 'cs',
  SK: 'sk',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  LI: 'de',

  PL: 'pl',
  FR: 'fr',
  BE: 'fr',
  LU: 'fr',
  MC: 'fr',

  ES: 'es',
  AD: 'es',
  MX: 'es',
  AR: 'es',
  CL: 'es',
  CO: 'es',
  PE: 'es',

  IT: 'it',
  SM: 'it',
  VA: 'it',

  NL: 'nl',
  PT: 'pt',
  BR: 'pt',

  SE: 'sv',
  DK: 'da',
  FI: 'fi',
  GR: 'el',
  HU: 'hu',
  RO: 'ro',
  BG: 'bg',
  HR: 'hr',
  SI: 'sl',
  EE: 'et',
  LV: 'lv',
  LT: 'lt',
}

export const LOCALE_COOKIE = 'NEXT_LOCALE'

export const localeCookieOptions = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: 'lax' as const,
}

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return !!value && (locales as readonly string[]).includes(value)
}

/** Prefer Vercel, then Cloudflare country headers. */
export function countryFromHeaders(headers: Headers): string | null {
  const raw =
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    headers.get('cloudfront-viewer-country')
  if (!raw || raw === 'XX' || raw === 'T1') return null
  return raw.toUpperCase()
}

/**
 * Best locale from Accept-Language (e.g. "cs-CZ,cs;q=0.9,en;q=0.8").
 */
export function localeFromAcceptLanguage(header: string | null): AppLocale | null {
  if (!header) return null
  const parts = header.split(',').map((part) => {
    const [tag, ...params] = part.trim().split(';')
    const q = params.find((p) => p.trim().startsWith('q='))
    const quality = q ? Number(q.split('=')[1]) || 0 : 1
    return { tag: tag.toLowerCase(), quality }
  })
  parts.sort((a, b) => b.quality - a.quality)

  for (const { tag } of parts) {
    const primary = tag.split('-')[0]
    if (isAppLocale(primary)) return primary
    // zh-CN etc. — ignore; pt-BR → pt
    if (tag.startsWith('pt') && isAppLocale('pt')) return 'pt'
  }
  return null
}

export function detectLocaleFromHeaders(headers: Headers): AppLocale {
  const country = countryFromHeaders(headers)
  if (country && countryToLocale[country]) {
    return countryToLocale[country]
  }
  return localeFromAcceptLanguage(headers.get('accept-language')) ?? defaultLocale
}
