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

const COLORS = {
  without: BRAND.secondaryText,
  with: BRAND.primary,
} as const

const Y_TICKS = [0, 25, 50, 75, 100] as const
const EASE = [0.21, 0.47, 0.32, 0.98] as const

/** Measured + projected curve points: [year, biodegradation %] */
const WITH_POINTS = [
  [0, 0],
  [0.5, 22],
  [1, 42],
  [1.5, 58],
  [2, 70],
  [2.5, 80],
  [3, 87],
  [3.5, 93.31],
  [4, 96],
  [4.5, 97.8],
  [5, 99],
] as const

const MEASURED_UNTIL = 3.5
const CHART_W = 640
const CHART_H = 310
const PAD = {top: 36, right: 56, bottom: 64, left: 48} as const

function plotX(year: number) {
  const inner = CHART_W - PAD.left - PAD.right
  return PAD.left + (year / 5) * inner
}

function plotY(pct: number) {
  const inner = CHART_H - PAD.top - PAD.bottom
  return PAD.top + ((100 - pct) / 100) * inner
}

function buildPath(points: readonly (readonly [number, number])[]) {
  return points
    .map(([year, pct], i) => {
      const cmd = i === 0 ? 'M' : 'L'
      return `${cmd}${plotX(year).toFixed(1)} ${plotY(pct).toFixed(1)}`
    })
    .join(' ')
}

export function TestingCharts({className}: {className?: string}) {
  return (
    <div className={cn('mt-8 grid gap-6', className)}>
      <BiodegradationBarChart />
      <BiodegradationTimelineChart />
    </div>
  )
}

function BiodegradationBarChart() {
  const t = useTranslations('ecoOne.testing.barChart')
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, {once: true, margin: '-40px'})
  const [active, setActive] = useState<'with' | 'without' | null>(null)
  const duration = reduceMotion ? 0 : 0.9

  const bars = [
    {
      key: 'with' as const,
      label: t('withLabel'),
      value: 93.31,
      display: '93.31%',
      detail: t('withDetail'),
      color: COLORS.with,
      tone: 'brand' as const,
    },
    {
      key: 'without' as const,
      label: t('withoutLabel'),
      value: 0,
      display: '0%',
      detail: t('withoutDetail'),
      color: COLORS.without,
      tone: 'muted' as const,
    },
  ]

  return (
    <figure
      ref={ref}
      className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white"
      aria-label={t('ariaLabel')}
    >
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <p className="mb-4 text-xs font-medium text-[#575756]/70 sm:text-sm">
          {t('yAxis')}
        </p>
        <div className="relative grid h-64 grid-cols-[2rem_1fr] gap-x-2 sm:h-72 sm:grid-cols-[2.5rem_1fr]">
          <div className="relative flex flex-col justify-between py-1 text-right text-xs tabular-nums text-[#575756]/55">
            {[100, 75, 50, 25, 0].map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>

          <div className="relative min-w-0">
            <div className="absolute inset-0 flex flex-col justify-between">
              {Y_TICKS.map((tick) => (
                <div key={tick} className="border-t border-black/[0.06]" />
              ))}
            </div>

            <div className="absolute inset-0 flex items-end justify-around gap-6 px-2 pb-0 sm:gap-12 sm:px-8">
              {bars.map((bar, index) => (
                <button
                  key={bar.key}
                  type="button"
                  className="relative flex h-full w-full max-w-[7.5rem] flex-col items-center justify-end outline-none focus-visible:ring-2 focus-visible:ring-[#0F68B2]/40 focus-visible:ring-offset-2"
                  aria-label={`${bar.label}: ${bar.display}. ${bar.detail}`}
                  onMouseEnter={() => setActive(bar.key)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(bar.key)}
                  onBlur={() => setActive(null)}
                >
                  <motion.span
                    className={cn(
                      'mb-2 text-sm font-bold tabular-nums sm:text-base',
                      bar.tone === 'brand' ? 'text-[#0F68B2]' : 'text-[#575756]',
                    )}
                    initial={false}
                    animate={{opacity: inView ? 1 : 0}}
                    transition={{
                      duration: duration * 0.5,
                      delay: inView ? 0.45 + index * 0.1 : 0,
                    }}
                  >
                    {bar.display}
                  </motion.span>

                  <div className="relative flex w-full flex-1 items-end justify-center">
                    {bar.value > 0 ? (
                      <motion.div
                        className={cn(
                          'w-[55%] max-w-[4.5rem] rounded-t-md',
                          active === bar.key && 'brightness-[1.06]',
                        )}
                        style={{backgroundColor: bar.color}}
                        initial={false}
                        animate={{
                          height: inView ? `${bar.value}%` : '0%',
                        }}
                        transition={{
                          duration,
                          delay: inView ? index * 0.1 : 0,
                          ease: EASE,
                        }}
                      />
                    ) : (
                      <span
                        className="block h-px w-[55%] max-w-[4.5rem] bg-[#575756]/40"
                        aria-hidden
                      />
                    )}
                  </div>

                  <p
                    className={cn(
                      'mt-3 text-center text-xs font-semibold leading-snug text-pretty sm:text-sm',
                      bar.tone === 'brand' ? 'text-[#0F68B2]' : 'text-[#575756]',
                    )}
                  >
                    {bar.label}
                  </p>

                  <AnimatePresence>
                    {active === bar.key ? (
                      <motion.div
                        role="tooltip"
                        initial={{opacity: 0, y: 4}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 4}}
                        transition={{duration: 0.15}}
                        className="absolute bottom-[calc(100%-0.5rem)] left-1/2 z-20 w-52 -translate-x-1/2 rounded-xl border border-black/[0.06] bg-white px-3 py-2 text-left text-xs leading-relaxed text-[#575756]/85 shadow-lg"
                      >
                        <p
                          className={cn(
                            'font-semibold',
                            bar.tone === 'brand'
                              ? 'text-[#0F68B2]'
                              : 'text-[#575756]',
                          )}
                        >
                          {bar.display}
                        </p>
                        <p className="mt-1 text-pretty">{bar.detail}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-[#575756]/65 text-pretty sm:text-sm">
          {t('subtitle')}
        </p>
      </div>
    </figure>
  )
}

function BiodegradationTimelineChart() {
  const t = useTranslations('ecoOne.testing.timelineChart')
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, {once: true, margin: '-40px'})

  const duration = reduceMotion ? 0 : 1.2
  const measuredPoints = WITH_POINTS.filter(([y]) => y <= MEASURED_UNTIL)
  const projectedPoints = WITH_POINTS.filter(([y]) => y >= MEASURED_UNTIL)
  const measuredPath = buildPath(measuredPoints)
  const projectedPath = buildPath(projectedPoints)
  const withoutPath = `M${plotX(0)} ${plotY(0)} L${plotX(5)} ${plotY(0)}`

  const yearTicks = [0, 1, 2, 3, 4, 5]
  const measuredMidX = plotX(MEASURED_UNTIL / 2)
  const projectedMidX = plotX((MEASURED_UNTIL + 5) / 2)

  return (
    <figure
      ref={ref}
      className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white"
      aria-label={t('ariaLabel')}
    >
      <div className="px-3 py-5 sm:px-5 sm:py-7">
        <div
          className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold sm:text-sm"
          aria-hidden
        >
          <span className="inline-flex items-center gap-2 text-[#0F68B2]">
            <span className="h-0.5 w-5 rounded-full bg-[#0F68B2]" />
            {t('withLabel')}
          </span>
          <span className="inline-flex items-center gap-2 text-[#575756]">
            <span className="h-0.5 w-5 rounded-full bg-[#575756]" />
            {t('withoutLabel')}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="h-auto w-full"
          role="img"
        >
          <title>{t('ariaLabel')}</title>

          {Y_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={CHART_W - PAD.right}
                y1={plotY(tick)}
                y2={plotY(tick)}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 10}
                y={plotY(tick) + 4}
                textAnchor="end"
                className="fill-[#575756]/55"
                fontSize={11}
              >
                {tick}
              </text>
            </g>
          ))}

          <text
            x={16}
            y={CHART_H / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${CHART_H / 2})`}
            className="fill-[#575756]/70"
            fontSize={11}
            fontWeight={500}
          >
            {t('yAxis')}
          </text>

          <line
            x1={plotX(MEASURED_UNTIL)}
            x2={plotX(MEASURED_UNTIL)}
            y1={PAD.top}
            y2={CHART_H - PAD.bottom}
            stroke="#575756"
            strokeOpacity={0.35}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          <motion.path
            d={withoutPath}
            fill="none"
            stroke={COLORS.without}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={false}
            animate={{pathLength: inView ? 1 : 0}}
            transition={{duration: duration * 0.6, ease: EASE}}
          />

          <motion.path
            d={measuredPath}
            fill="none"
            stroke={COLORS.with}
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{pathLength: inView ? 1 : 0}}
            transition={{duration, ease: EASE}}
          />

          <motion.path
            d={projectedPath}
            fill="none"
            stroke={COLORS.with}
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 5"
            initial={false}
            animate={{opacity: inView ? 1 : 0}}
            transition={{duration: 0.45, delay: inView ? 0.55 : 0}}
          />

          <motion.g
            initial={false}
            animate={{opacity: inView ? 1 : 0}}
            transition={{delay: inView ? 0.75 : 0}}
          >
            <rect
              x={plotX(MEASURED_UNTIL) - 42}
              y={plotY(93.31) - 28}
              width={34}
              height={18}
              rx={4}
              fill="white"
            />
            <text
              x={plotX(MEASURED_UNTIL) - 25}
              y={plotY(93.31) - 15}
              textAnchor="middle"
              fill={COLORS.with}
              fontSize={13}
              fontWeight={700}
            >
              93%
            </text>
          </motion.g>

          <motion.g
            initial={false}
            animate={{opacity: inView ? 1 : 0}}
            transition={{delay: inView ? 0.9 : 0}}
          >
            <rect
              x={plotX(5) - 18}
              y={plotY(99) - 28}
              width={36}
              height={18}
              rx={4}
              fill="white"
            />
            <text
              x={plotX(5)}
              y={plotY(99) - 15}
              textAnchor="middle"
              fill={COLORS.with}
              fontSize={13}
              fontWeight={700}
            >
              99%
            </text>
          </motion.g>

          <text
            x={plotX(5) + 10}
            y={plotY(0) + 4}
            fill={COLORS.without}
            fontSize={12}
            fontWeight={700}
          >
            0%
          </text>
          <text
            x={plotX(1.1)}
            y={plotY(0) - 10}
            fill={COLORS.without}
            fontSize={11}
            fontWeight={500}
          >
            {t('zeroNote')}
          </text>

          {/* Measured / projected — below plot, above year ticks */}
          <text
            x={measuredMidX}
            y={CHART_H - PAD.bottom + 16}
            textAnchor="middle"
            fill="#575756"
            fillOpacity={0.75}
            fontSize={11}
            fontWeight={600}
            letterSpacing="0.06em"
          >
            {t('measured').toUpperCase()}
          </text>
          <text
            x={projectedMidX}
            y={CHART_H - PAD.bottom + 16}
            textAnchor="middle"
            fill="#575756"
            fillOpacity={0.75}
            fontSize={11}
            fontWeight={600}
            letterSpacing="0.06em"
          >
            {t('projected').toUpperCase()}
          </text>

          {yearTicks.map((year) => (
            <text
              key={year}
              x={plotX(year)}
              y={CHART_H - PAD.bottom + 34}
              textAnchor="middle"
              className="fill-[#575756]/55"
              fontSize={11}
            >
              {year}
            </text>
          ))}
          <text
            x={(PAD.left + CHART_W - PAD.right) / 2}
            y={CHART_H - 6}
            textAnchor="middle"
            className="fill-[#575756]"
            fontSize={12}
            fontWeight={500}
          >
            {t('xAxis')}
          </text>
        </svg>
      </div>

      <figcaption className="border-t border-black/[0.06] px-4 py-3 text-sm leading-relaxed text-[#575756]/70 text-pretty sm:px-5">
        {t('caption')}
      </figcaption>
    </figure>
  )
}
