import {getTranslations} from 'next-intl/server'

const STEP_KEYS = ['use', 'after', 'landfill', 'breakdown'] as const

export async function AfterUseSteps() {
  const t = await getTranslations('ecoOne.afterUse')

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-[#0F68B2] text-balance sm:text-3xl">
        {t('heading')}
      </h2>

      <ol className="mt-10 grid gap-10 lg:grid-cols-4 lg:gap-6">
        {STEP_KEYS.map((key, index) => {
          const isLast = index === STEP_KEYS.length - 1
          return (
            <li key={key} className="relative text-left">
              {/* Mobile: vertical line from bottom of this circle to top of next */}
              {!isLast ? (
                <span
                  className="pointer-events-none absolute top-14 bottom-[-2.5rem] left-7 w-px -translate-x-1/2 bg-[#0F68B2]/30 lg:hidden"
                  aria-hidden
                />
              ) : null}

              {/* Desktop: horizontal line from right edge of this circle across gap to next */}
              {!isLast ? (
                <span
                  className="pointer-events-none absolute top-7 left-14 hidden h-px w-[calc(100%-3.5rem+1.5rem)] -translate-y-1/2 bg-[#0F68B2]/30 lg:block"
                  aria-hidden
                />
              ) : null}

              <div className="relative z-10 flex gap-4 lg:flex-col lg:items-start lg:gap-0">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-[#0F68B2] bg-white text-sm font-bold tabular-nums text-[#0F68B2]">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0 pt-1 lg:mt-5 lg:pt-0">
                  <h3 className="text-base font-bold tracking-tight text-[#575756] text-balance sm:text-lg">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#575756]/75 text-pretty sm:text-base">
                    {t(`steps.${key}.body`)}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
