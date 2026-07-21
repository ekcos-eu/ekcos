'use client'

import {useRef, useState} from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {useTranslations} from 'next-intl'
import {BRAND} from '@/lib/brand'
import {cn} from '@/lib/utils'

const MAX_YEARS = 1000
const WITHOUT_YEARS = 1000
const WITH_YEARS = 5
const TICKS = [0, 250, 500, 750, 1000] as const

const COLORS = {
  without: BRAND.secondaryText,
  with: BRAND.primary,
} as const

function barWidthPercent(years: number) {
  return Math.min(100, (years / MAX_YEARS) * 100)
}

export function ComparisonChart({className}: {className?: string}) {
  const t = useTranslations('ecoOne.problem.chart')
  const reduceMotion = useReducedMotion()
  const chartRef = useRef<HTMLElement>(null)
  const inView = useInView(chartRef, {once: true, margin: '-40px'})
  const [active, setActive] = useState<'without' | 'with' | null>(null)

  const withoutWidth = barWidthPercent(WITHOUT_YEARS)
  const withWidth = barWidthPercent(WITH_YEARS)

  const duration = reduceMotion ? 0 : 0.85
  const ease = [0.21, 0.47, 0.32, 0.98] as const

  return (
    <figure
      ref={chartRef}
      className={cn(
        'overflow-hidden rounded-2xl border border-black/[0.06] bg-white',
        className,
      )}
      aria-label={t('ariaLabel')}
    >
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 sm:gap-7">
          <ChartRow
            label={t('withoutLabel')}
            valueLabel={t('withoutValue')}
            detail={t('withoutDetail')}
            tone="muted"
            color={COLORS.without}
            widthPercent={withoutWidth}
            labelInside
            active={active === 'without'}
            onFocus={() => setActive('without')}
            onBlur={() => setActive(null)}
            visible={inView}
            duration={duration}
            ease={ease}
            delay={0}
          />

          <ChartRow
            label={t('withLabel')}
            valueLabel={t('withValue')}
            detail={t('withDetail')}
            tone="brand"
            color={COLORS.with}
            widthPercent={withWidth}
            labelInside={false}
            active={active === 'with'}
            onFocus={() => setActive('with')}
            onBlur={() => setActive(null)}
            visible={inView}
            duration={duration}
            ease={ease}
            delay={0.12}
          />
        </div>

        <div className="mt-6 pl-0 sm:pl-[min(42%,12.5rem)]">
          <div className="relative h-px bg-black/[0.1]">
            {TICKS.map((tick) => (
              <span
                key={tick}
                className="absolute top-0 h-2 w-px -translate-x-1/2 bg-[#0F68B2]/25"
                style={{left: `${(tick / MAX_YEARS) * 100}%`}}
              />
            ))}
          </div>
          <div className="relative mt-2 h-4 text-xs tabular-nums text-[#575756]/55">
            {TICKS.map((tick) => (
              <span
                key={tick}
                className="absolute -translate-x-1/2"
                style={{left: `${(tick / MAX_YEARS) * 100}%`}}
              >
                {tick}
              </span>
            ))}
          </div>
          <p className="mt-3 text-center text-sm font-medium text-[#575756]">
            {t('axisLabel')}
          </p>
        </div>
      </div>

      <figcaption className="border-t border-black/[0.06] px-4 py-3 text-sm leading-relaxed text-[#575756]/70 text-pretty sm:px-5">
        {t('caption')}
      </figcaption>
    </figure>
  )
}

function ChartRow({
  label,
  valueLabel,
  detail,
  tone,
  color,
  widthPercent,
  labelInside,
  active,
  onFocus,
  onBlur,
  visible,
  duration,
  ease,
  delay,
}: {
  label: string
  valueLabel: string
  detail: string
  tone: 'muted' | 'brand'
  color: string
  widthPercent: number
  labelInside: boolean
  active: boolean
  onFocus: () => void
  onBlur: () => void
  visible: boolean
  duration: number
  ease: readonly [number, number, number, number]
  delay: number
}) {
  return (
    <div
      className="grid items-center gap-2 sm:grid-cols-[minmax(0,12.5rem)_minmax(0,1fr)] sm:gap-4"
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <p
        className={cn(
          'text-sm font-semibold leading-snug text-pretty sm:text-right',
          tone === 'brand' ? 'text-[#0F68B2]' : 'text-[#575756]',
        )}
      >
        {label}
      </p>

      <div className="relative min-w-0">
        <button
          type="button"
          className={cn(
            'group relative flex w-full items-center rounded-md text-left outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#0F68B2]/40 focus-visible:ring-offset-2',
          )}
          aria-label={`${label}: ${valueLabel}. ${detail}`}
        >
          <div className="relative h-10 w-full overflow-visible sm:h-11">
            <motion.div
              className={cn(
                'absolute inset-y-0 left-0 flex items-center overflow-hidden rounded-md transition-[filter]',
                active && 'brightness-[1.06]',
              )}
              style={{backgroundColor: color}}
              initial={false}
              animate={{
                width: visible ? `${Math.max(widthPercent, 0.6)}%` : 0,
              }}
              transition={{duration, delay: visible ? delay : 0, ease}}
            >
              {labelInside ? (
                <span className="w-full whitespace-nowrap pr-3 text-right text-xs font-semibold tracking-wide text-white sm:text-sm">
                  {valueLabel}
                </span>
              ) : null}
            </motion.div>

            {!labelInside ? (
              <motion.span
                className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-bold tracking-wide text-[#0F68B2] sm:text-sm"
                style={{
                  left: `calc(${Math.max(widthPercent, 0.6)}% + 0.5rem)`,
                }}
                initial={false}
                animate={{opacity: visible ? 1 : 0}}
                transition={{
                  duration: duration * 0.6,
                  delay: visible ? delay + 0.35 : 0,
                }}
              >
                {valueLabel}
              </motion.span>
            ) : null}
          </div>
        </button>

        <AnimatePresence>
          {active ? (
            <motion.div
              role="tooltip"
              initial={{opacity: 0, y: 4}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: 4}}
              transition={{duration: 0.15}}
              className="absolute left-0 z-20 mt-2 max-w-sm rounded-xl border border-black/[0.06] bg-white px-3.5 py-2.5 text-xs leading-relaxed text-[#575756]/85 shadow-lg sm:text-sm"
            >
              <p
                className={cn(
                  'font-semibold',
                  tone === 'brand' ? 'text-[#0F68B2]' : 'text-[#575756]',
                )}
              >
                {valueLabel}
              </p>
              <p className="mt-1 text-pretty">{detail}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
