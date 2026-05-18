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

const localeLabels: Record<string, string> = {
  en: 'EN',
  de: 'DE',
  it: 'IT',
  es: 'ES',
  fr: 'FR',
  cs: 'CS'
}

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

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
          {localeLabels[locale] ?? locale.toUpperCase()}
          <ChevronDown className='h-4 w-4 opacity-60' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='min-w-40'
      >
        {routing.locales.map((loc) => (
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
            <span className='mr-2 w-6 text-xs text-[#575756]/60'>
              {localeLabels[loc]}
            </span>
            {t(loc as 'en' | 'de' | 'it' | 'es' | 'fr' | 'cs')}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
