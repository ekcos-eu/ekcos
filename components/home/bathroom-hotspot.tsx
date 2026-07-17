'use client'

import { cn } from '@/lib/utils'
import type { BathroomHotspot } from '@/lib/bathroom-hotspots'

type BathroomHotspotButtonProps = {
  hotspot: BathroomHotspot
  label: string
  onSelect: (slug: string) => void
}

export function BathroomHotspotButton({
  hotspot,
  label,
  onSelect,
}: BathroomHotspotButtonProps) {
  const w = hotspot.w ?? 6
  const h = hotspot.h ?? 6

  return (
    <button
      type="button"
      onClick={() => onSelect(hotspot.slug)}
      className={cn(
        'group absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer',
        'rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F68B2] focus-visible:ring-offset-2',
      )}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${w}%`,
        height: `${h}%`,
        minWidth: 44,
        minHeight: 44,
      }}
      aria-label={label}
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span className="absolute h-8 w-8 animate-ping rounded-full bg-[#0F68B2]/35" />
        <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-[#0F68B2] shadow-md transition-transform group-hover:scale-125 group-focus-visible:scale-125" />
      </span>
    </button>
  )
}
