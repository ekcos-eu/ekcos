'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { bathroomHotspots } from '@/lib/bathroom-hotspots'
import { getProductBySlug } from '@/lib/products'
import type { Product } from '@/lib/types/product'
import { BathroomHotspotButton } from '@/components/home/bathroom-hotspot'
import { ProductOverlay } from '@/components/home/product-overlay'

/** Native aspect of public/home/bathroom-map.jpg (2160×1080) */
const SCENE_RATIO = 2160 / 1080

export function BathroomMap() {
  const t = useTranslations()
  const home = useTranslations('home.map')
  const sectionRef = React.useRef<HTMLElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [selected, setSelected] = React.useState<Product | null>(null)
  const [open, setOpen] = React.useState(false)
  const [scene, setScene] = React.useState({ width: 2160, height: 1080 })

  React.useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const update = () => {
      const availableW = section.clientWidth
      const availableH = section.clientHeight
      if (availableW <= 0 || availableH <= 0) return

      // Fill height with correct ratio; if that is narrower than the viewport,
      // fill width instead (letterbox vertically) — never stretch.
      const widthIfFillHeight = availableH * SCENE_RATIO
      if (widthIfFillHeight >= availableW) {
        setScene({ width: widthIfFillHeight, height: availableH })
      } else {
        setScene({ width: availableW, height: availableW / SCENE_RATIO })
      }
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      el.scrollLeft += event.deltaY
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const handleSelect = (slug: string) => {
    const product = getProductBySlug(slug)
    if (!product) return
    setSelected(product)
    setOpen(true)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setSelected(null)
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#e8ecef] sm:h-[calc(100dvh-4.25rem)]"
      aria-label={home('aria')}
    >
      <div
        ref={scrollRef}
        className="flex h-full w-full items-center overflow-x-auto overflow-y-hidden"
        style={{ touchAction: 'pan-x' }}
      >
        <div
          className="relative shrink-0"
          style={{ width: scene.width, height: scene.height }}
        >
          <Image
            src="/home/bathroom-map.jpg"
            alt={home('imageAlt')}
            width={2160}
            height={1080}
            priority
            draggable={false}
            className="pointer-events-none h-full w-full select-none object-contain"
            sizes="100vw"
          />

          <div className="absolute inset-0">
            {bathroomHotspots.map((hotspot) => {
              const product = getProductBySlug(hotspot.slug)
              const label = product ? t(product.nameKey) : hotspot.slug
              return (
                <BathroomHotspotButton
                  key={hotspot.id}
                  hotspot={hotspot}
                  label={label}
                  onSelect={handleSelect}
                />
              )
            })}
          </div>
        </div>
      </div>

      <ProductOverlay product={selected} open={open} onOpenChange={handleOpenChange} />
    </section>
  )
}
