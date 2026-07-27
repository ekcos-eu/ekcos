'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ZoomIn } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ProductDetailLightboxProps = {
  images: string[]
  productName: string
  className?: string
  onOpenChange?: (open: boolean) => void
}

export function ProductDetailLightbox({
  images,
  productName,
  className,
  onOpenChange,
}: ProductDetailLightboxProps) {
  const t = useTranslations('productDetail')
  const [open, setOpen] = React.useState(false)
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(1)
  const [count, setCount] = React.useState(0)
  /** Freeze gallery while open so parent color autoplay cannot swap slides mid-view. */
  const [openImages, setOpenImages] = React.useState<string[]>(images)
  const imagesKey = images.join('|')
  const prevImagesKey = React.useRef(imagesKey)

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) setOpenImages(images)
      setOpen(next)
      onOpenChange?.(next)
    },
    [images, onOpenChange],
  )

  React.useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1)
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  // Reset only when the color's image set actually changes (not on new array refs)
  React.useEffect(() => {
    if (open) return
    if (prevImagesKey.current === imagesKey) return
    prevImagesKey.current = imagesKey
    setCurrent(1)
    api?.scrollTo(0, true)
  }, [api, imagesKey, open])

  // Embla measures 0×0 while dialog is closed — reInit after open
  React.useEffect(() => {
    if (!open || !api) return
    const id = window.requestAnimationFrame(() => {
      api.reInit()
      setCount(api.scrollSnapList().length)
      setCurrent(api.selectedScrollSnap() + 1)
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, api, openImages])

  if (images.length === 0) return null

  const slides = open ? openImages : images

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={() => handleOpenChange(true)}
        className={cn(
          'absolute right-3 top-3 z-10 size-10 rounded-full border border-black/10 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white',
          className,
        )}
        aria-label={t('openDetails')}
      >
        <ZoomIn className="size-4 text-[#0F68B2]" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[min(100dvh,52rem)] w-[calc(100%-1.5rem)] max-w-3xl gap-0 overflow-hidden border-black/10 bg-white p-0 sm:rounded-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            {t('detailGallery', { name: productName })}
          </DialogTitle>

          <div className="relative px-10 py-8 sm:px-14">
            <Carousel
              setApi={setApi}
              opts={{
                loop: slides.length > 1,
                align: 'center',
                containScroll: 'trimSnaps',
                dragFree: false,
              }}
              className="w-full touch-pan-y"
            >
              <CarouselContent className="-ml-0">
                {slides.map((src, idx) => (
                  <CarouselItem key={src} className="pl-0 basis-full">
                    <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden">
                      <Image
                        src={src}
                        alt={`${productName} — ${t('detailShot')} ${idx + 1}`}
                        fill
                        draggable={false}
                        className="pointer-events-none select-none object-contain"
                        sizes="(max-width: 768px) 100vw, 36rem"
                        priority={idx === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {slides.length > 1 ? (
                <>
                  <CarouselPrevious className="left-0 z-10 border-black/10 bg-white hover:bg-white" />
                  <CarouselNext className="right-0 z-10 border-black/10 bg-white hover:bg-white" />
                </>
              ) : null}
            </Carousel>

            {slides.length > 1 ? (
              <p className="mt-4 text-center text-xs font-medium text-[#575756]/70">
                {current} / {count}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
