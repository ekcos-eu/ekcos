import type {ReactNode} from 'react'
import {PageContainer} from '@/components/layout/page-container'
import {cn} from '@/lib/utils'

const PAGE_HERO_BG =
  'bg-[linear-gradient(165deg,#eef6fc_0%,#f7fafc_42%,#ffffff_100%)]'

type PageHeroProps = {
  children: ReactNode
  className?: string
}

export function PageHero({children, className}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative border-b border-black/[0.06] ekcos-noise',
        PAGE_HERO_BG,
      )}
    >
      <PageContainer className={cn('py-16 sm:py-20 lg:py-24', className)}>
        {children}
      </PageContainer>
    </section>
  )
}

export {PAGE_HERO_BG}
