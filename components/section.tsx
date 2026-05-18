import { cn } from '@/lib/utils'

type SectionVariant = 'default' | 'muted' | 'dark' | 'gradient'

type Props = {
  children: React.ReactNode
  className?: string
  id?: string
  /** @deprecated Use variant="muted" */
  muted?: boolean
  variant?: SectionVariant
  /** Wider content like Relace/Iru marketing pages */
  wide?: boolean
}

export function Section({
  children,
  className,
  id,
  muted,
  variant,
  wide
}: Props) {
  const resolvedVariant: SectionVariant =
    variant ?? (muted ? 'muted' : 'default')

  return (
    <section
      id={id}
      className={cn(
        'py-14 sm:py-16 lg:py-20',
        resolvedVariant === 'muted' && 'bg-[#f8fafc]',
        resolvedVariant === 'default' && 'bg-white',
        resolvedVariant === 'dark' && 'ekcos-surface-hero text-white',
        resolvedVariant === 'gradient' &&
          'bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto px-4 sm:px-6 lg:px-8',
          wide ? 'max-w-352' : 'max-w-6xl'
        )}
      >
        {children}
      </div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  dark
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        align === 'left' && 'text-left'
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'text-xs font-semibold tracking-wider text-balance uppercase',
            dark ? 'text-[#9ed0ff]' : 'text-[#0F68B2]'
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl',
          dark ? 'text-white' : 'text-[#575756]'
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed text-pretty',
            dark ? 'text-white/82' : 'text-[#575756]/85'
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
