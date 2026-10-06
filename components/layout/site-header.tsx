'use client'

import * as React from 'react'
import {createPortal} from 'react-dom'
import Image from 'next/image'
import {ChevronDown, Menu, ShoppingBag, X} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {Link} from '@/i18n/routing'
import {LocaleSwitcher} from '@/components/locale-switcher'
import {Button} from '@/components/ui/button'
import {SHOP_BASE_URL} from '@/lib/brand'
import {cn} from '@/lib/utils'

const navKeys = ['articles', 'ecoOne', 'privateLabel'] as const

const navHrefs = {
  articles: '/articles',
  ecoOne: '/eco-one',
  privateLabel: '/private-label',
} as const

const faqChildren = [
  {href: '/faq/distributors' as const, labelKey: 'distributors' as const},
  {href: '/faq/eshop' as const, labelKey: 'eshop' as const},
]

export function SiteHeader() {
  const t = useTranslations('nav')
  const common = useTranslations('common')
  const [open, setOpen] = React.useState(false)
  const [faqOpen, setFaqOpen] = React.useState(false)
  const [portalReady, setPortalReady] = React.useState(false)
  const faqCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = React.useRef<HTMLElement>(null)
  const [menuTop, setMenuTop] = React.useState(0)

  const links = navKeys.map((key) => ({
    key,
    href: navHrefs[key],
    label: t(`${key}.label`),
  }))

  const openFaq = () => {
    if (faqCloseTimer.current) clearTimeout(faqCloseTimer.current)
    setFaqOpen(true)
  }

  const scheduleCloseFaq = () => {
    if (faqCloseTimer.current) clearTimeout(faqCloseTimer.current)
    faqCloseTimer.current = setTimeout(() => setFaqOpen(false), 120)
  }

  const syncMenuTop = React.useCallback(() => {
    const el = headerRef.current
    if (!el) return
    setMenuTop(el.getBoundingClientRect().bottom)
  }, [])

  React.useEffect(() => {
    setPortalReady(true)
    return () => {
      if (faqCloseTimer.current) clearTimeout(faqCloseTimer.current)
    }
  }, [])

  React.useEffect(() => {
    if (!open) return
    syncMenuTop()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', syncMenuTop)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', syncMenuTop)
    }
  }, [open, syncMenuTop])

  const mobileMenu =
    open && portalReady
      ? createPortal(
          <div
            id="mobile-nav"
            className="fixed inset-x-0 bottom-0 z-[200] flex flex-col bg-white lg:hidden"
            style={{top: menuTop}}
            role="dialog"
            aria-modal="true"
            aria-label={t('mobileMenuTitle')}
          >
            <nav
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-5"
              aria-label={t('aria')}
            >
              {links.map(({href, label, key}) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-lg font-medium text-[#575756] hover:bg-black/[0.03] hover:text-[#0F68B2]"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/faq"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-lg font-medium text-[#575756] hover:bg-black/[0.03] hover:text-[#0F68B2]"
              >
                {t('faq.label')}
              </Link>
              {faqChildren.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2.5 pl-8 text-base font-medium text-[#575756] hover:bg-black/[0.03] hover:text-[#0F68B2]"
                >
                  {t(`faq.${child.labelKey}`)}
                </Link>
              ))}
              <Button asChild className="mt-4 w-full justify-center">
                <a
                  href={SHOP_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" aria-hidden />
                  {common('shop')}
                </a>
              </Button>
            </nav>
          </div>,
          document.body,
        )
      : null

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 border-b border-black/[0.06] bg-white/95 backdrop-blur-sm',
        open ? 'z-[210]' : 'z-40',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 py-2">
          <Image
            src="/logo.png"
            alt={t('logoAlt')}
            width={140}
            height={40}
            className="h-9 w-auto object-contain sm:h-10"
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-1.5 lg:flex"
          aria-label={t('aria')}
        >
          {links.map(({href, label, key}) => (
            <Link
              key={key}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#575756] transition-colors hover:bg-black/[0.03] hover:text-[#0F68B2]"
            >
              {label}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={openFaq}
            onMouseLeave={scheduleCloseFaq}
            onFocus={openFaq}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                scheduleCloseFaq()
              }
            }}
          >
            <Link
              href="/faq"
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#575756] transition-colors hover:bg-black/[0.03] hover:text-[#0F68B2]',
                faqOpen && 'bg-black/[0.03] text-[#0F68B2]',
              )}
              aria-expanded={faqOpen}
              aria-haspopup="true"
            >
              {t('faq.label')}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  faqOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </Link>
            <div
              className={cn(
                'absolute top-full left-0 z-50 min-w-[11rem] pt-1 transition-opacity',
                faqOpen
                  ? 'pointer-events-auto opacity-100'
                  : 'pointer-events-none opacity-0',
              )}
            >
              <div className="rounded-lg border border-black/[0.08] bg-white py-1.5 shadow-lg shadow-black/5">
                {faqChildren.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-3.5 py-2 text-sm font-medium text-[#575756] transition-colors hover:bg-black/[0.03] hover:text-[#0F68B2]"
                    onClick={() => setFaqOpen(false)}
                  >
                    {t(`faq.${child.labelKey}`)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden lg:inline-flex">
            <a
              href={SHOP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShoppingBag className="mr-1.5 h-4 w-4" aria-hidden />
              {common('shop')}
            </a>
          </Button>
          <LocaleSwitcher />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => {
              if (!open) syncMenuTop()
              setOpen((v) => !v)
            }}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {mobileMenu}
    </header>
  )
}
