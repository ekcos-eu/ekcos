'use client'

import { usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div
      className={cn(
        'flex flex-col',
        isHome ? 'h-dvh overflow-hidden' : 'min-h-dvh'
      )}
    >
      {children}
    </div>
  )
}
