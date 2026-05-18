'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Product, ProductColor } from '@/lib/types/product'
import { getConfiguratorThumbnailSrc, getDefaultColorId } from '@/lib/product-variants'
import { SHOP_BASE_URL } from '@/lib/brand'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type Props = {
  products: Product[]
  initialSlug: string
  /** When true, uses section height suited for homepage embed (not full viewport). */
  embedded?: boolean
}

function resolveColor(product: Product, colorId: string): ProductColor | undefined {
  return product.colors.find((c) => c.id === colorId) ?? product.colors[0]
}

function splitBenefitHighlight(copy: string) {
  const normalized = copy.replace(/\s+/g, ' ').trim()

  if (!normalized) {
    return { title: '', body: '' }
  }

  const punctuationMatch = normalized.match(/^(.{22,70}?)([,:;])\s+(.+)$/)

  if (punctuationMatch) {
    return {
      title: punctuationMatch[1].trim(),
      body: punctuationMatch[3].trim(),
    }
  }

  const words = normalized.split(' ')

  if (words.length <= 6) {
    return {
      title: normalized,
      body: '',
    }
  }

  const titleWordCount = words.length >= 14 ? 6 : 5

  return {
    title: words.slice(0, titleWordCount).join(' '),
    body: words.slice(titleWordCount).join(' '),
  }
}

function StudioHero({
  productName,
  heroSrc,
  colorKey,
}: {
  productName: string
  heroSrc: string
  colorKey: string
}) {
  const fade = { duration: 0.22 }
  return (
    <div className="relative h-full min-h-[min(48vh,420px)] w-full min-w-0 flex-1 lg:min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={`hero-${colorKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          className="absolute inset-0 p-2 sm:p-4 lg:p-6"
        >
          <Image
            src={heroSrc}
            alt={productName}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 38vw"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function ProductConfigurator({ products, initialSlug, embedded = false }: Props) {
  const t = useTranslations()
  const [slug, setSlug] = React.useState(initialSlug)
  const product = products.find((p) => p.slug === slug) ?? products[0]
  const [colorId, setColorId] = React.useState(() => getDefaultColorId(product))

  React.useEffect(() => {
    const next = products.find((p) => p.slug === slug) ?? products[0]
    setColorId(getDefaultColorId(next))
  }, [slug, products])

  const color = resolveColor(product, colorId)
  const shopUrl = `${SHOP_BASE_URL}${product.shopPath}`

  const heroSrc = color?.imageSrc ?? product.heroImageSrc

  const badgeKey = product.badgeKey ?? product.categoryKey
  const highlightBenefitKeys = product.benefitKeys.slice(0, 3)

  const pickerId = embedded ? 'studio-product-picker-home' : 'studio-product-picker'

  const studioHeight = embedded
    ? 'min-h-[680px] sm:min-h-[760px] lg:h-[min(92vh,1100px)] lg:max-h-[min(92vh,1100px)]'
    : 'min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-4.5rem)] lg:h-[calc(100dvh-4.5rem)] lg:max-h-[calc(100dvh-4.5rem)]'

  return (
    <div
      className={cn(
        'w-full max-w-[100vw] overflow-x-hidden',
        embedded && 'overflow-hidden rounded-xl border border-black/[0.08] bg-white',
      )}
    >
      <section
        className={cn(
          'relative flex w-full max-w-[100vw] flex-col overflow-x-hidden overflow-y-auto',
          'bg-[#f8fafc]',
          studioHeight,
          !embedded && 'lg:overflow-hidden',
        )}
        aria-label={t('products.page.title')}
      >
        <header className="relative z-10 flex shrink-0 flex-col gap-2 border-b border-black/[0.08] bg-white px-4 py-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-6">
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-[#575756] sm:text-xl lg:text-2xl">
              {t(product.nameKey)}
            </p>
            <p className="text-xs text-[#575756]/75">{t('products.configurator.byBrand')}</p>
          </div>
          <p className="max-w-xl text-sm text-[#575756] sm:text-right">
            <span className="font-medium text-[#0F68B2]">{t(badgeKey)}</span>
          </p>
        </header>

        <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-6">
          <div className="order-1 flex min-h-0 flex-col rounded-xl border border-black/[0.08] bg-white lg:col-span-5 lg:min-h-0">
            <p id={pickerId} className="sr-only">
              {t('products.configurator.selectProduct')}
            </p>
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 lg:min-h-[min(58vh,680px)] lg:flex-row lg:items-stretch lg:gap-4">
              <nav
                aria-labelledby={pickerId}
                className="flex shrink-0 flex-row items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:h-full lg:w-[76px] lg:shrink-0 lg:flex-col lg:gap-1 lg:overflow-hidden lg:pb-0 [&::-webkit-scrollbar]:hidden"
              >
                {products.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setSlug(p.slug)}
                    aria-pressed={p.slug === slug}
                    aria-label={t(p.nameKey)}
                    className={cn(
                      'group relative shrink-0 overflow-hidden rounded-lg border-2 bg-[#fafafa] transition-colors',
                      'aspect-square size-[52px] sm:size-14',
                      'lg:flex lg:min-h-0 lg:flex-1 lg:items-center lg:justify-center lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:ring-0',
                      p.slug === slug
                        ? 'border-[#0F68B2] ring-2 ring-[#0F68B2]/20'
                        : 'border-black/[0.08] hover:border-[#0F68B2]/45',
                    )}
                  >
                    <span
                      className={cn(
                        'relative block size-full min-h-0 min-w-0',
                        'lg:aspect-square lg:h-full lg:w-auto lg:max-w-full lg:overflow-hidden lg:rounded-lg lg:border-2 lg:bg-[#fafafa]',
                        p.slug === slug
                          ? 'lg:border-[#0F68B2] lg:ring-2 lg:ring-[#0F68B2]/20'
                          : 'lg:border-black/[0.08] lg:group-hover:border-[#0F68B2]/45',
                      )}
                    >
                      <Image
                        src={getConfiguratorThumbnailSrc(p)}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </span>
                  </button>
                ))}
              </nav>
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-black/[0.07] bg-[#fbfcfd]">
                <StudioHero
                  productName={t(product.nameKey)}
                  heroSrc={heroSrc}
                  colorKey={`${product.slug}-${colorId}`}
                />
              </div>
            </div>
          </div>

          <div className="order-2 flex min-h-0 flex-col gap-4 overflow-y-auto lg:col-span-4">
            <div className="rounded-xl border border-black/[0.08] bg-white p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0F68B2]">{t(product.categoryKey)}</p>
              <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="text-base font-bold text-[#575756]">{t('products.configurator.productBenefits')}</h3>
                <p className="text-xs text-[#575756]/70 sm:max-w-[200px] sm:text-right">{t('products.configurator.sixtyDayBadge')}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#575756]/85">{t(product.shortDescriptionKey)}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#575756]/75">{t(product.longDescriptionKey)}</p>

              {product.fragrances && product.fragrances.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[#575756]">{t('products.configurator.fragrance')}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {product.fragrances.map((f) => (
                      <li
                        key={f.id}
                        className="rounded-md border border-black/[0.08] bg-[#fafafa] px-2.5 py-1 text-xs text-[#575756]"
                      >
                        {t(f.labelKey)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <ul className="mt-5 divide-y divide-black/[0.06] border-t border-black/[0.06]">
                {highlightBenefitKeys.map((key, index) => {
                  const highlight = splitBenefitHighlight(t(key))
                  const supportingCopy = highlight.body || t(product.shortDescriptionKey)

                  return (
                    <li key={key}>
                      <article className="flex gap-3 py-4 first:pt-4">
                        <span className="mt-0.5 w-6 shrink-0 text-xs font-semibold tabular-nums text-[#0F68B2]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 border-l-2 border-[#0F68B2]/25 pl-4">
                          <h4 className="text-sm font-semibold leading-snug text-[#575756]">{highlight.title}</h4>
                          <p className="mt-1.5 text-sm leading-relaxed text-[#575756]/75">{supportingCopy}</p>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>

              {product.useCaseKeys.length > 0 ? (
                <div className="mt-5 border-t border-black/[0.06] pt-4">
                  <p className="text-xs font-semibold text-[#575756]">{t('products.configurator.useCases')}</p>
                  <ul className="mt-2 space-y-1.5">
                    {product.useCaseKeys.map((k, i) => (
                      <li key={i} className="text-sm text-[#575756]/85">
                        {t(k)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="order-3 flex min-h-0 flex-col rounded-xl border border-black/[0.08] bg-white lg:col-span-3">
            <h3 className="shrink-0 border-b border-black/[0.06] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#575756]">
              {t('products.configurator.availableColorsFragrances')}
            </h3>
            <ul className="max-h-[34vh] min-h-0 flex-1 space-y-0 overflow-y-auto lg:max-h-none">
              {product.colors.map((c) => {
                const active = colorId === c.id
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setColorId(c.id)}
                      className={cn(
                        'flex w-full items-center gap-3 border-b border-black/[0.05] px-4 py-3 text-left transition-colors last:border-b-0',
                        active ? 'bg-[#0F68B2]/8' : 'hover:bg-black/[0.02]',
                      )}
                    >
                      <span
                        className="h-6 w-6 shrink-0 rounded-full border border-black/10"
                        style={{
                          backgroundColor: c.swatchHex ?? '#d4d4d4',
                        }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 text-sm font-medium text-[#575756]">{t(c.labelKey)}</span>
                      {active ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F68B2]" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-black/[0.08] bg-white px-4 py-3 sm:px-6">
          <Button asChild size="default" className="sm:h-10">
            <a href={shopUrl} target="_blank" rel="noopener noreferrer">
              {t('common.shopCta')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
                <Link href="/eco-one">{t('nav.ecoOne.label')}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
                <Link href="/custom-branding">{t('nav.customBranding.label')}</Link>
              </Button>
            </div>
            {product.brandingAvailable ? (
              <p className="max-w-sm text-xs leading-snug text-[#575756]/75">{t('products.configurator.brandingNote')}</p>
            ) : null}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#575756]/70">{t('products.configurator.siteUrl')}</span>
              <Image src="/logo.png" alt="ëkcos" width={80} height={26} className="h-6 w-auto object-contain sm:h-7" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
