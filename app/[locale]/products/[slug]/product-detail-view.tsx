'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Check } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { ProductHeroImage } from '@/components/products/product-hero-image'
import { SHOP_BASE_URL } from '@/lib/brand'
import type { CsvProductDetail } from '@/lib/csv-products'
import { cn } from '@/lib/utils'

const ECO_ONE_LINK_CLASS =
  'font-medium text-[#0F68B2] underline decoration-[#0F68B2]/35 underline-offset-2 transition-colors hover:decoration-[#0F68B2]'

/** Phrases in Key benefits that should link to the Eco-One page */
const ECO_ONE_LINK_PATTERN =
  /Eco[-\s]?One(?:™|®)?|100%\s+recyclable\s+and\s+also\s+biodegradable|100%\s+recyklovatelné\s+a\s+také\s+biologicky\s+odbouratelné/gi

function linkifyEcoOne(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  const pattern = new RegExp(ECO_ONE_LINK_PATTERN.source, ECO_ONE_LINK_PATTERN.flags)

  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    nodes.push(
      <Link
        key={`eco-one-${match.index}`}
        href="/eco-one"
        className={ECO_ONE_LINK_CLASS}
      >
        {match[0]}
      </Link>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex === 0) return text
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LocalizedProduct = {
  name: string
  shortDescription: string
  longDescription: string
  benefits: string[]
  colorLabels: Record<string, string>
}

type Props = {
  detail: CsvProductDetail
  localizedProduct: LocalizedProduct
  slug: string
}

// ---------------------------------------------------------------------------
// Color swatch button
// ---------------------------------------------------------------------------

function ColorSwatch({
  hex,
  label,
  active,
  onClick,
}: {
  hex: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'relative h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F68B2] focus-visible:ring-offset-2',
        active ? 'border-[#0F68B2] scale-110' : 'border-transparent',
      )}
      style={{ backgroundColor: hex }}
    >
      {active && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Check className="h-3 w-3 text-white drop-shadow" aria-hidden />
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function ProductDetailView({ detail, localizedProduct, slug }: Props) {
  const t = useTranslations('productDetail')
  const [activeImg, setActiveImg] = React.useState(0)
  const [activeVariant, setActiveVariant] = React.useState(0)
  const [autoplayPaused, setAutoplayPaused] = React.useState(false)
  const [userPausedUntil, setUserPausedUntil] = React.useState(0)
  const shopUrl = `${SHOP_BASE_URL}${detail.shopPath}`

  const currentVariant = detail.variants[activeVariant]
  const displayImg =
    currentVariant?.imageSrc && detail.images.length === 0
      ? currentVariant.imageSrc
      : (detail.images[activeImg] ?? detail.images[0])

  const pauseAutoplayBriefly = React.useCallback(() => {
    setUserPausedUntil(Date.now() + 8000)
  }, [])

  const syncVariantFromImage = React.useCallback(
    (imgIdx: number) => {
      const src = detail.images[imgIdx]
      if (!src) return
      const match = detail.variants.findIndex((v) => v.imageSrc === src)
      if (match !== -1) setActiveVariant(match)
    },
    [detail.images, detail.variants],
  )

  const applyVariant = React.useCallback(
    (idx: number) => {
      setActiveVariant(idx)
      const varSrc = detail.variants[idx]?.imageSrc
      if (varSrc) {
        const imgIdx = detail.images.indexOf(varSrc)
        if (imgIdx !== -1) setActiveImg(imgIdx)
      }
    },
    [detail.images, detail.variants],
  )

  const handleVariantSelect = (idx: number) => {
    pauseAutoplayBriefly()
    applyVariant(idx)
  }

  const handleThumbnailSelect = (idx: number) => {
    pauseAutoplayBriefly()
    setActiveImg(idx)
    syncVariantFromImage(idx)
  }

  const hasMultipleVariants = detail.variants.length > 1
  const canAutoplayColors = detail.images.length > 1

  // Clear manual pause after the cooldown
  React.useEffect(() => {
    if (userPausedUntil <= 0) return
    const remaining = userPausedUntil - Date.now()
    if (remaining <= 0) {
      setUserPausedUntil(0)
      return
    }
    const id = window.setTimeout(() => setUserPausedUntil(0), remaining)
    return () => window.clearTimeout(id)
  }, [userPausedUntil])

  // Auto-rotate gallery colors every 4s
  React.useEffect(() => {
    if (!canAutoplayColors) return
    if (autoplayPaused || userPausedUntil > Date.now()) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const id = window.setInterval(() => {
      setActiveImg((prev) => {
        const next = (prev + 1) % detail.images.length
        const src = detail.images[next]
        const match = detail.variants.findIndex((v) => v.imageSrc === src)
        if (match !== -1) setActiveVariant(match)
        return next
      })
    }, 4000)

    return () => window.clearInterval(id)
  }, [
    autoplayPaused,
    canAutoplayColors,
    detail.images,
    detail.variants,
    userPausedUntil,
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#575756] transition-colors hover:text-[#0F68B2]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('backToMap')}
      </Link>


      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        {/* Left: Gallery */}
        <div
          className="flex flex-col gap-4"
          onPointerEnter={() => setAutoplayPaused(true)}
          onPointerLeave={() => setAutoplayPaused(false)}
        >
          {/* Main image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f0f4f8]">
            <AnimatePresence mode="wait">
              <motion.div
                key={displayImg}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductHeroImage
                  src={displayImg}
                  alt={`${localizedProduct.name} — ${detail.images.indexOf(displayImg) + 1}`}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail rail */}
          {detail.images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {detail.images.map((src, idx) => (
                <motion.button
                  key={src}
                  type="button"
                  onClick={() => handleThumbnailSelect(idx)}
                  aria-label={`${localizedProduct.name} — image ${idx + 1}`}
                  whileHover={{ y: -3, scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors',
                    activeImg === idx
                      ? 'border-[#0F68B2] ring-1 ring-[#0F68B2]/30'
                      : 'border-black/10 hover:border-[#0F68B2]/40',
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold leading-tight text-[#0F68B2] sm:text-4xl">
              {localizedProduct.name}
            </h1>
          </div>

          {/* Price */}
          {detail.price && (
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-[#575756]/70">{t('from')}</span>
              <span className="text-2xl font-bold text-[#0F68B2]">
                €{detail.price}
              </span>
            </div>
          )}

          {/* Color / variant swatches */}
          {hasMultipleVariants && (
            <div
              onPointerEnter={() => setAutoplayPaused(true)}
              onPointerLeave={() => setAutoplayPaused(false)}
            >
              <p className="mb-2 text-sm font-medium text-[#575756]">
                {t('colors')}
              </p>
              <div className="flex flex-wrap gap-2">
                {detail.variants.map((v, idx) => {
                  // Find matching swatchHex from variant image path SKU
                  const swatchHex = getSwatchHexFromSku(v.sku)
                  const label = v.title ?? v.sku
                  return (
                    <ColorSwatch
                      key={v.sku}
                      hex={swatchHex}
                      label={label}
                      active={activeVariant === idx}
                      onClick={() => handleVariantSelect(idx)}
                    />
                  )
                })}
              </div>
              {currentVariant && (
                <p className="mt-1.5 text-xs text-[#575756]/70">
                  {currentVariant.title}
                  {currentVariant.scent ? ` · ${currentVariant.scent}` : ''}
                </p>
              )}
            </div>
          )}

          {/* Long description (from page bottom → above benefits) */}
          {detail.bodyHtml ? (
            <div
              className="prose prose-sm max-w-none text-[#575756] prose-headings:text-[#0F68B2] prose-strong:text-[#575756] prose-li:marker:text-[#0F68B2]"
              dangerouslySetInnerHTML={{ __html: detail.bodyHtml }}
            />
          ) : localizedProduct.longDescription ? (
            <p className="text-base leading-relaxed text-[#575756] text-justify">
              {linkifyEcoOne(localizedProduct.longDescription)}
            </p>
          ) : null}

          {/* Benefits */}
          {localizedProduct.benefits.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-[#575756]">
                {t('benefits')}
              </p>
              <ul className="space-y-1.5">
                {localizedProduct.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-[#575756]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F68B2]" aria-hidden />
                    <span>{linkifyEcoOne(b)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={shopUrl} target="_blank" rel="noopener noreferrer">
              {t('buyNow')}
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helper: SKU → swatch colour (matches URINAL_VARIANT_DIMS in product-variants.ts)
// ---------------------------------------------------------------------------

const SKU_SWATCH: Record<string, string> = {
  '1P': '#7B4397',
  '2G': '#8BC34A',
  '3B': '#0F68B2',
  '4O': '#F57C00',
  '6C': '#CFD8DC',
  '7BK': '#212121',
  '8BM': '#E64A19',
  '9G': '#2E7D32',
  '10R': '#C62828',
  '12P': '#5E35B1',
  '13C': '#F9A825',
  '02B': '#0F68B2',
  '01W': '#ECEFF1',
  '01': '#0F68B2',
  '00': '#575756',
}

function getSwatchHexFromSku(sku: string): string {
  // SKU format: PREFIX-COLORCODE, e.g. XHD-3B, XPU-02B, EZT-01
  const parts = sku.split('-')
  const colorCode = parts.slice(1).join('-').toUpperCase()
  return SKU_SWATCH[colorCode] ?? '#0F68B2'
}
