'use client'

import { linkifyPlainText } from '@/lib/article-product-links'
import type { FaqChartBlock } from '@/lib/faq'

type GetImageAlt = (slug: string) => string

export function FaqBiodegradationChart({
  block,
  getImageAlt,
}: {
  block: FaqChartBlock
  getImageAlt: GetImageAlt
}) {
  return (
    <figure
      className="mt-4 space-y-4"
      aria-label={block.caption}
    >
      <div className="space-y-4">
        {block.rows.map((row) => {
          const filled = Math.max(0, Math.min(100, row.value))
          const isZero = filled === 0
          return (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-[#0F68B2] sm:text-base">
                  {linkifyPlainText(row.label, getImageAlt)}
                </span>
                <span
                  className={
                    isZero
                      ? 'shrink-0 text-sm font-bold text-[#9ca3af] sm:text-base'
                      : 'shrink-0 text-sm font-bold text-[#0F68B2] sm:text-base'
                  }
                >
                  {row.display}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#e8eef4] sm:h-3.5">
                {isZero ? (
                  <div
                    className="h-full w-3 rounded-full bg-[#9ca3af]"
                    aria-hidden
                  />
                ) : (
                  <div
                    className="h-full rounded-full bg-[#0F68B2] transition-[width] duration-500"
                    style={{ width: `${filled}%` }}
                    aria-hidden
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
      <figcaption className="text-sm leading-snug text-[#9ca3af]">
        {block.caption}
      </figcaption>
    </figure>
  )
}
