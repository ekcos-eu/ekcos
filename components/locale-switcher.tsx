'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import {
  LOCALE_COOKIE,
  localeCookieOptions,
  localeMeta,
  type AppLocale,
} from '@/i18n/locales'

const sortedLocales = [...routing.locales].sort((a, b) =>
  localeMeta[a as AppLocale].endonym.localeCompare(
    localeMeta[b as AppLocale].endonym,
    'en',
  ),
)

function persistLocale(locale: AppLocale) {
  const maxAge = localeCookieOptions.maxAge
  document.cookie = `${LOCALE_COOKIE}=${locale};path=${localeCookieOptions.path};max-age=${maxAge};SameSite=${localeCookieOptions.sameSite}`
}

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  // Defer Radix until after mount so SSR/client useId trees stay in sync.
  const [menuReady, setMenuReady] = useState(false)

  useEffect(() => {
    setMenuReady(true)
  }, [])

  const current = localeMeta[locale as AppLocale] ?? {
    endonym: locale.toUpperCase(),
    flag: '🌐',
  }

  const trigger = (
    <Button
      variant="secondary"
      size="sm"
      className="min-w-18 border-black/10 font-medium"
      disabled={isPending}
      aria-label={t('label')}
    >
      <span className="text-base leading-none" aria-hidden>
        {current.flag}
      </span>
      {locale.toUpperCase()}
      <ChevronDown className="h-4 w-4 opacity-60" />
    </Button>
  )

  if (!menuReady) {
    return trigger
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-80 min-w-48 overflow-y-auto"
      >
        {sortedLocales.map((loc) => {
          const meta = localeMeta[loc as AppLocale]
          return (
            <DropdownMenuItem
              key={loc}
              className={
                loc === locale
                  ? 'bg-[#0F68B2]/8 font-medium text-[#0F68B2]'
                  : ''
              }
              onSelect={() => {
                persistLocale(loc as AppLocale)
                startTransition(() => {
                  router.replace(pathname, { locale: loc })
                })
              }}
            >
              <span className="mr-2 text-base leading-none" aria-hidden>
                {meta.flag}
              </span>
              {meta.endonym}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
