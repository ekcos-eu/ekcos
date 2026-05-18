const LOCALE_TO_COUNTRY_CODE: Record<string, string> = {
  cs: 'CZ',
  de: 'DE',
  en: 'GB',
  es: 'ES',
  fr: 'FR',
  it: 'IT',
}

export function getCountryCodeFromLocale(locale: string): string {
  const normalizedLocale = locale.toLowerCase().split('-')[0]
  return LOCALE_TO_COUNTRY_CODE[normalizedLocale] ?? LOCALE_TO_COUNTRY_CODE.en
}
