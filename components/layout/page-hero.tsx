import type {ReactNode} from 'react'
import {cn} from '@/lib/utils'

const PAGE_HERO_BG =
  'bg-[linear-gradient(165deg,#eef6fc_0%,#f7fafc_42%,#ffffff_100%)]'

type PageHeroProps = {
  children: ReactNode
  className?: string
  /** Inner content max width */
  size?: 'md' | 'lg'
}

export function PageHero({children, className, size = 'md'}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative border-b border-black/[0.06] ekcos-noise',
        PAGE_HERO_BG,
      )}
    >
      <div
        className={cn(
          'mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:py-24',
          size === 'md' ? 'max-w-3xl' : 'max-w-5xl',
          className,
        )}
      >
        {children}
      </div>
    </section>
  )
}

export {PAGE_HERO_BG}
