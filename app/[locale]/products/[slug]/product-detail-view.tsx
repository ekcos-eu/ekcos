'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Check } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { ProductHeroImage } from '@/components/products/product-hero-image'
import { ProductDetailLightbox } from '@/components/products/product-detail-lightbox'
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
  /** Localized "Color / Scent" labels keyed by imageSrc */
  colorLabelsByImage: Record<string, string>
}

type Props = {
  detail: CsvProductDetail
  localizedProduct: LocalizedProduct
  slug: string
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function ProductDetailView({ detail, localizedProduct, slug }: Props) {
  const t = useTranslations('productDetail')
  const tProducts = useTranslations('products')
  const [activeImg, setActiveImg] = React.useState(0)
  const [activeVariant, setActiveVariant] = React.useState(0)
  const [autoplayPaused, setAutoplayPaused] = React.useState(false)
  const [userPausedUntil, setUserPausedUntil] = React.useState(0)
  const shopUrl = `${SHOP_BASE_URL}${detail.shopPath}`

  // Prefer product.colors-backed gallery; synthesize variants from images when CSV parse failed
  const galleryImages =
    detail.images.length > 0
      ? detail.images
      : detail.variants.map((v) => v.imageSrc).filter(Boolean)

  const variants =
    detail.variants.length > 0
      ? detail.variants
      : galleryImages.map((imageSrc, idx) => ({
          sku: skuFromImageSrc(imageSrc) ?? `variant-${idx}`,
          title: '',
          price: detail.price,
          imageSrc,
        }))

  const currentVariant = variants[activeVariant]
  const displayImg = galleryImages[activeImg] ?? galleryImages[0] ?? currentVariant?.imageSrc ?? ''

  const activeColorKey = colorKeyFromImageSrc(displayImg)
  const detailImagesForColor = activeColorKey
    ? detail.detailImages.filter(
        (src) => colorKeyFromImageSrc(src) === activeColorKey,
      )
    : []

  const colorScentLabel = resolveColorScentLabel(
    displayImg,
    currentVariant,
    localizedProduct.colorLabelsByImage,
    tProducts,
  )

  const pauseAutoplayBriefly = React.useCallback(() => {
    setUserPausedUntil(Date.now() + 8000)
  }, [])

  const syncVariantFromImage = React.useCallback(
    (imgIdx: number) => {
      const src = galleryImages[imgIdx]
      if (!src) return
      const match = variants.findIndex((v) => v.imageSrc === src)
      if (match !== -1) setActiveVariant(match)
      else setActiveVariant(imgIdx)
    },
    [galleryImages, variants],
  )

  const handleThumbnailSelect = (idx: number) => {
    pauseAutoplayBriefly()
    setActiveImg(idx)
    syncVariantFromImage(idx)
  }

  const canAutoplayColors = galleryImages.length > 1

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
        const next = (prev + 1) % galleryImages.length
        const src = galleryImages[next]
        const match = variants.findIndex((v) => v.imageSrc === src)
        setActiveVariant(match !== -1 ? match : next)
        return next
      })
    }, 4000)

    return () => window.clearInterval(id)
  }, [
    autoplayPaused,
    canAutoplayColors,
    galleryImages,
    variants,
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
                  alt={`${localizedProduct.name} — ${galleryImages.indexOf(displayImg) + 1}`}
                />
              </motion.div>
            </AnimatePresence>

            {colorScentLabel ? (
              <AnimatePresence mode="wait">
                <motion.p
                  key={colorScentLabel}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute left-4 top-4 z-10 text-xs font-medium lowercase tracking-wide text-[#575756]/80 sm:left-5 sm:top-5 sm:text-sm"
                >
                  {colorScentLabel}
                </motion.p>
              </AnimatePresence>
            ) : null}

            <ProductDetailLightbox
              key={activeColorKey ?? 'none'}
              images={detailImagesForColor}
              productName={localizedProduct.name}
            />
          </div>

          {/* Thumbnail rail */}
          {galleryImages.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {galleryImages.map((src, idx) => (
                <motion.button
                  key={src}
                  type="button"
                  onClick={() => handleThumbnailSelect(idx)}
                  aria-label={`${localizedProduct.name} — image ${idx + 1}`}
                  whileHover={{ y: -3, scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    'relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition-colors',
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

          {/* Localized long description (CSV bodyHtml is English-only — do not prefer it) */}
          {localizedProduct.longDescription ? (
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
// Helpers: color / scent label from SKU + i18n
// ---------------------------------------------------------------------------

/** Filename stem before -V… — matches PhotoStock + Detail (e.g. PWR-3B, XPU-1P). */
function colorKeyFromImageSrc(src: string): string | null {
  const file = decodeURIComponent(src.split('/').pop() ?? '').replace(/\s+/g, '')
  const match = file.match(/^([A-Za-z]+-[0-9A-Za-z]+)-V/i)
  return match ? match[1].toUpperCase() : null
}

/** Extract SKU like PWR-3B / XPU-02B from a PhotoStock path. */
function skuFromImageSrc(src: string): string | null {
  const file = decodeURIComponent(src.split('/').pop() ?? '')
  const match = file.match(/^([A-Za-z]+)-([0-9A-Za-z]+)/)
  if (!match) return null
  const line = match[1].toUpperCase()
  const mid = match[2].toUpperCase()
  // Puck PhotoStock uses XPU-1P / XPU-2G filenames for SKUs XPU-02B / XPU-01W
  if (line === 'XPU') {
    if (mid === '1P') return 'XPU-02B'
    if (mid === '2G') return 'XPU-01W'
  }
  return `${line}-${mid}`
}

const SKU_MID_TO_LABEL_KEY: Record<string, string> = {
  '1P': 'variantLabels.x1p',
  '2G': 'variantLabels.x2g',
  '3B': 'variantLabels.x3b',
  '4O': 'variantLabels.x4o',
  '6C': 'variantLabels.x6c',
  '7BK': 'variantLabels.x7bk',
  '8BM': 'variantLabels.x8bm',
  '9G': 'variantLabels.x9g',
  '10R': 'variantLabels.x10r',
  '12P': 'variantLabels.x12p',
  '13C': 'variantLabels.x13c',
  '02B': 'xcrenPuck.variants.blueFresh',
  '01W': 'xcrenPuck.variants.whiteFresh',
}

type TranslateProducts = (key: string) => string

/** Always resolve via i18n — never fall back to English CSV color codes. */
function resolveColorScentLabel(
  imageSrc: string,
  variant: CsvProductDetail['variants'][number] | undefined,
  colorLabelsByImage: Record<string, string>,
  tProducts: TranslateProducts,
): string | null {
  const fromMap =
    colorLabelsByImage[imageSrc] ??
    (variant?.imageSrc ? colorLabelsByImage[variant.imageSrc] : undefined)
  if (fromMap) return fromMap.toLowerCase()

  const sku = variant?.sku || skuFromImageSrc(imageSrc)
  if (!sku) return null

  const mid = sku.split('-').slice(1).join('-').toUpperCase()
  const labelKey = SKU_MID_TO_LABEL_KEY[mid]
  if (!labelKey) return null

  try {
    return tProducts(labelKey).toLowerCase()
  } catch {
    return null
  }
}
