import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { isAppLocale } from './locales'

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  if (!isAppLocale(locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../dictionaries/${locale}.json`)).default,
  }
})
