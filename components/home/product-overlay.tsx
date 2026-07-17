'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'
import type { Product } from '@/lib/types/product'
import { SHOP_BASE_URL } from '@/lib/brand'
import { getConfiguratorThumbnailSrc } from '@/lib/product-variants'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ProductOverlayProps = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductOverlay({ product, open, onOpenChange }: ProductOverlayProps) {
  const t = useTranslations()
  const home = useTranslations('home.overlay')

  if (!product) return null

  const imageSrc = getConfiguratorThumbnailSrc(product)
  const colorCount = product.colors.length
  const fragranceCount = product.fragrances?.length ?? 0
  const shopUrl = `${SHOP_BASE_URL}${product.shopPath}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <div className="relative aspect-[4/3] bg-[#f4f7fa]">
          <Image
            src={imageSrc}
            alt={t(product.nameKey)}
            fill
            className="object-contain p-6"
            sizes="(max-width: 640px) 100vw, 28rem"
            priority
          />
        </div>

        <div className="space-y-4 p-6 pt-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold text-[#0F68B2]">
              {t(product.nameKey)}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#575756]">
              {t(product.shortDescriptionKey)}
            </DialogDescription>
          </DialogHeader>

          {(colorCount > 1 || fragranceCount > 0) && (
            <p className="text-xs leading-relaxed text-[#575756]/70">
              {home('moreVariants')}
            </p>
          )}

          <Button asChild size="lg" className="w-full">
            <a href={shopUrl} target="_blank" rel="noopener noreferrer">
              {home('shopCta')}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
