'use client'

import { usePathname } from '@/i18n/routing'

export function ConditionalFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/') return null
  return children
}
