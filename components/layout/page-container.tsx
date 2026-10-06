import type {ElementType, ReactNode} from 'react'
import {cn} from '@/lib/utils'

/** Matches site header/footer: max-w-6xl + responsive horizontal padding. */
export const PAGE_CONTAINER_CLASS =
  'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8'

type PageContainerProps = {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function PageContainer({
  children,
  className,
  as: Tag = 'div',
}: PageContainerProps) {
  return <Tag className={cn(PAGE_CONTAINER_CLASS, className)}>{children}</Tag>
}
