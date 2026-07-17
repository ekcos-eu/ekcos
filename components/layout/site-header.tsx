'use client'

import * as React from 'react'
import Image from 'next/image'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { Button } from '@/components/ui/button'
import { SHOP_BASE_URL } from '@/lib/brand'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { motion } from 'framer-motion'

const navKeys = [
  'articles',
  'ecoOne',
  'customBranding',
] as const

export function SiteHeader() {
  const t = useTranslations('nav')
  const common = useTranslations('common')
  const [open, setOpen] = React.useState(false)

  const links = navKeys.map((key) => ({
    key,
    href:
      key === 'articles' ? '/articles'
      : key === 'ecoOne' ? '/eco-one'
      : '/custom-branding',
    label: t(`${key}.label`)
  }))

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className='sticky top-0 z-40 border-b border-black/[0.06] bg-white/95 backdrop-blur-sm'
    >
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8'>
        <Link
          href='/'
          className='flex shrink-0 items-center gap-2 py-2'
        >
          <Image
            src='/logo.png'
            alt={t('logoAlt')}
            width={140}
            height={40}
            className='h-9 w-auto object-contain sm:h-10'
            priority
          />
        </Link>

        <nav
          className='hidden items-center gap-1.5 lg:flex'
          aria-label={t('aria')}
        >
          {links.map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              className='rounded-lg px-3 py-2 text-sm font-medium text-[#575756] transition-colors hover:bg-black/[0.03] hover:text-[#0F68B2]'
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2'>
          <Button
            asChild
            size='sm'
            className='hidden lg:inline-flex'
          >
            <a
              href={SHOP_BASE_URL}
              target='_blank'
              rel='noopener noreferrer'
            >
              <ShoppingBag
                className='mr-1.5 h-4 w-4'
                aria-hidden
              />
              {common('shop')}
            </a>
          </Button>
          <LocaleSwitcher />
          <Dialog
            open={open}
            onOpenChange={setOpen}
          >
            <DialogTrigger asChild>
              <Button variant='ghost' size='icon' className='lg:hidden' aria-label={t('openMenu')}>
                <Menu className='h-6 w-6' />
              </Button>
            </DialogTrigger>
            <DialogContent className='fixed inset-0 top-0 left-0 flex h-full max-h-none w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 lg:hidden [&>button]:hidden'>
              <VisuallyHidden>
                <DialogTitle>{t('mobileMenuTitle')}</DialogTitle>
              </VisuallyHidden>
              <div className='flex items-center justify-between border-b border-black/10 px-4 py-4'>
                <Image
                  src='/logo.png'
                  alt=''
                  width={120}
                  height={36}
                  className='h-8 w-auto object-contain'
                />
                <div className='flex items-center gap-2'>
                  <LocaleSwitcher />
                  <DialogClose asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Close menu'
                    >
                      <X className='h-5 w-5' />
                    </Button>
                  </DialogClose>
                </div>
              </div>
              <nav className='flex flex-col gap-1 p-5' aria-label={t('aria')}>
                {links.map(({ href, label, key }) => (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setOpen(false)}
                    className='rounded-lg px-4 py-3 text-lg font-medium text-[#575756] hover:bg-black/[0.03] hover:text-[#0F68B2]'
                  >
                    {label}
                  </Link>
                ))}
                <Button
                  asChild
                  className='mt-4 w-full justify-center'
                >
                  <a
                    href={SHOP_BASE_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => setOpen(false)}
                  >
                    <ShoppingBag
                      className='mr-2 h-4 w-4'
                      aria-hidden
                    />
                    {common('shop')}
                  </a>
                </Button>
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.header>
  )
}
