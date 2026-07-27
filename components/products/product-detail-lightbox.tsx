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
}

export function ProductDetailLightbox({
  images,
  productName,
  className,
}: ProductDetailLightboxProps) {
  const t = useTranslations('productDetail')
  const [open, setOpen] = React.useState(false)
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(1)
  const [count, setCount] = React.useState(0)

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

  // Reset slide index when the color’s detail set changes
  React.useEffect(() => {
    setCurrent(1)
    api?.scrollTo(0, true)
  }, [api, images])

  if (images.length === 0) return null

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={() => setOpen(true)}
        className={cn(
          'absolute right-3 top-3 z-10 size-10 rounded-full border border-black/10 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white',
          className,
        )}
        aria-label={t('openDetails')}
      >
        <ZoomIn className="size-4 text-[#0F68B2]" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden border-black/10 bg-white p-0 sm:rounded-2xl">
          <DialogTitle className="sr-only">
            {t('detailGallery', { name: productName })}
          </DialogTitle>

          <div className="relative px-12 py-8 sm:px-14">
            <Carousel
              setApi={setApi}
              opts={{ loop: images.length > 1, align: 'start' }}
              className="w-full"
            >
              <CarouselContent className="-ml-0">
                {images.map((src, idx) => (
                  <CarouselItem key={src} className="pl-0">
                    <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden">
                      <Image
                        src={src}
                        alt={`${productName} — ${t('detailShot')} ${idx + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 36rem"
                        priority={idx === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 ? (
                <>
                  <CarouselPrevious className="left-0 border-black/10 bg-white hover:bg-white" />
                  <CarouselNext className="right-0 border-black/10 bg-white hover:bg-white" />
                </>
              ) : null}
            </Carousel>

            {images.length > 1 ? (
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
