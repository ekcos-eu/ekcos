'use client'

import {getImageProps} from 'next/image'
import {useTranslations} from 'next-intl'
import {useRouter} from '@/i18n/routing'
import {
  desktopBathroomHotspots,
  mobileBathroomHotspots,
  type BathroomHotspot,
} from '@/lib/bathroom-hotspots'
import {getProductBySlug} from '@/lib/products'
import {BathroomHotspotButton} from '@/components/home/bathroom-hotspot'

const MOBILE_MEDIA = '(max-width: 767px)'

export function BathroomMap() {
  const t = useTranslations()
  const home = useTranslations('home.map')
  const router = useRouter()
  const alt = home('imageAlt')

  const {
    props: {srcSet: mobileSrcSet, sizes: mobileSizes},
  } = getImageProps({
    src: '/home/bathroom-map-mobile.jpg',
    alt,
    width: 700,
    height: 1024,
    priority: false,
    sizes: '100vw',
  })
  const {
    props: {srcSet: desktopSrcSet, src: desktopSrc, sizes: desktopSizes},
  } = getImageProps({
    src: '/home/bathroom-map.jpg',
    alt,
    width: 2160,
    height: 1080,
    priority: false,
    sizes: '100vw',
  })

  const handleSelect = (slug: string) => {
    router.push(`/products/${slug}`)
  }

  const renderHotspots = (hotspots: BathroomHotspot[]) =>
    hotspots.map((hotspot) => {
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
    })

  return (
    <section
      className="w-full scroll-mt-16 overflow-x-hidden bg-[#e8ecef] sm:scroll-mt-[4.25rem]"
      id="washroom"
      aria-label={home('aria')}
    >
      <div className="relative w-full aspect-[700/1024] md:aspect-[2/1]">
        <picture>
          <source media={MOBILE_MEDIA} srcSet={mobileSrcSet} sizes={mobileSizes} />
          <img
            src={desktopSrc}
            srcSet={desktopSrcSet}
            sizes={desktopSizes}
            alt={alt}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
          />
        </picture>

        <div className="absolute inset-0 md:hidden">{renderHotspots(mobileBathroomHotspots)}</div>
        <div className="absolute inset-0 hidden md:block">
          {renderHotspots(desktopBathroomHotspots)}
        </div>
      </div>
    </section>
  )
}
