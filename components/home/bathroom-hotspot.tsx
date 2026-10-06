'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { BathroomHotspot } from '@/lib/bathroom-hotspots'

type BathroomHotspotButtonProps = {
  hotspot: BathroomHotspot
  label: string
  imageSrc?: string
  showHoverCard?: boolean
  active?: boolean
  dimmed?: boolean
  onSelect: (slug: string) => void
  onHoverChange?: (id: string | null) => void
}

function cardPlacement(x: number, y: number): string {
  if (y > 72) {
    return 'bottom-full left-1/2 mb-3 -translate-x-1/2 origin-bottom'
  }
  if (x < 20) {
    return 'left-full top-1/2 ml-3 -translate-y-1/2 origin-left'
  }
  if (x > 75) {
    return 'right-full top-1/2 mr-3 -translate-y-1/2 origin-right'
  }
  if (y < 22) {
    return 'top-full left-1/2 mt-3 -translate-x-1/2 origin-top'
  }
  return 'bottom-full left-1/2 mb-3 -translate-x-1/2 origin-bottom'
}

export function BathroomHotspotButton({
  hotspot,
  label,
  imageSrc,
  showHoverCard = false,
  active = false,
  dimmed = false,
  onSelect,
  onHoverChange,
}: BathroomHotspotButtonProps) {
  const w = hotspot.w ?? 6
  const h = hotspot.h ?? 6
  const placement = cardPlacement(hotspot.x, hotspot.y)

  return (
    <div
      className={cn(
        'absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200',
        active && 'z-30',
        dimmed && 'opacity-35',
        'motion-reduce:transition-none',
      )}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${w}%`,
        height: `${h}%`,
        minWidth: 44,
        minHeight: 44,
      }}
      onMouseEnter={() => onHoverChange?.(hotspot.id)}
      onMouseLeave={() => onHoverChange?.(null)}
    >
      <button
        type="button"
        onClick={() => onSelect(hotspot.slug)}
        onFocus={() => onHoverChange?.(hotspot.id)}
        onBlur={() => onHoverChange?.(null)}
        className={cn(
          'absolute inset-0 cursor-pointer rounded-full',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F68B2] focus-visible:ring-offset-2',
        )}
        aria-label={label}
      >
        <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span
            className={cn(
              'absolute h-7 w-7 rounded-full bg-[#0F68B2]/20 transition-opacity duration-200',
              active ? 'opacity-100' : 'opacity-0',
              'motion-reduce:transition-none',
            )}
          />
          <span
            className={cn(
              'relative h-3.5 w-3.5 rounded-full border-2 border-white bg-[#0F68B2] shadow-md',
              'transition-transform duration-200',
              active ? 'scale-125' : 'scale-100',
              'motion-reduce:transition-none motion-reduce:scale-100',
            )}
          />
        </span>
      </button>

      {showHoverCard && imageSrc ? (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-20 w-32 rounded-xl border border-black/[0.08] bg-white p-2 shadow-lg sm:w-36',
            'transition-[opacity,transform] duration-200 ease-out',
            active ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            'motion-reduce:transition-none motion-reduce:scale-100',
            placement,
          )}
          aria-hidden
        >
          <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f3f6f8]">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-contain p-1.5"
              sizes="144px"
            />
          </div>
          <p className="mt-1.5 truncate text-center text-xs font-semibold leading-tight text-neutral-900">
            {label}
          </p>
        </div>
      ) : null}
    </div>
  )
}
