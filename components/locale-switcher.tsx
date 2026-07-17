'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

const localeMeta: Record<string, { code: string; flag: string }> = {
  en: { code: 'EN', flag: '🇬🇧' },
  de: { code: 'DE', flag: '🇩🇪' },
  it: { code: 'IT', flag: '🇮🇹' },
  es: { code: 'ES', flag: '🇪🇸' },
  fr: { code: 'FR', flag: '🇫🇷' },
  cs: { code: 'CS', flag: '🇨🇿' },
}

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const current = localeMeta[locale] ?? { code: locale.toUpperCase(), flag: '🌐' }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='secondary'
          size='sm'
          className='min-w-18 border-black/10 font-medium'
          disabled={isPending}
          aria-label={t('label')}
        >
          <span className='text-base leading-none' aria-hidden>
            {current.flag}
          </span>
          {current.code}
          <ChevronDown className='h-4 w-4 opacity-60' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='min-w-44'
      >
        {routing.locales.map((loc) => {
          const meta = localeMeta[loc] ?? { code: loc.toUpperCase(), flag: '🌐' }
          return (
            <DropdownMenuItem
              key={loc}
              className={
                loc === locale ? 'bg-[#0F68B2]/8 font-medium text-[#0F68B2]' : ''
              }
              onSelect={() => {
                startTransition(() => {
                  router.replace(pathname, { locale: loc })
                })
              }}
            >
              <span className='mr-2 text-base leading-none' aria-hidden>
                {meta.flag}
              </span>
              {t(loc as 'en' | 'de' | 'it' | 'es' | 'fr' | 'cs')}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
