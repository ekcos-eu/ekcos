import Image from 'next/image'
import type {ReactNode} from 'react'
import {getTranslations} from 'next-intl/server'
import {Info, Lightbulb} from 'lucide-react'
import {Link} from '@/i18n/routing'
import {getProductBySlug} from '@/lib/products'
import {
  getConfiguratorThumbnailSrc,
  getProductInsertColors,
  URINAL_VARIANT_DIMS,
} from '@/lib/product-variants'
import {
  createProductImageAltLookup,
  linkifyProductChildren,
  type ProductImageAltLookup,
} from '@/lib/article-product-links'

const BRAND = '#0F68B2'

function productBySlug(slug: string) {
  return getProductBySlug(slug)
}

function productHref(slug: string): `/products/${string}` {
  return `/products/${slug}`
}

function thumb(slug: string): string {
  const product = productBySlug(slug)
  if (!product) return ''
  return getConfiguratorThumbnailSrc(product)
}

function linkify(text: string, getAlt: ProductImageAltLookup): ReactNode {
  return linkifyProductChildren(text, getAlt)
}

function ProductThumb({
  slug,
  alt,
  className = 'h-16 w-16',
  name,
  linked = true,
}: {
  slug: string
  alt: string
  className?: string
  name?: string
  /** When false, render image only (parent already links). */
  linked?: boolean
}) {
  const src = thumb(slug)
  if (!src) return null

  const inner = (
    <>
      <div className={`relative shrink-0 ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="96px"
        />
      </div>
      {name ? (
        <span className="text-center text-xs font-semibold text-[#0F68B2] underline underline-offset-2 group-hover:text-[#0d5a9a]">
          {name}
        </span>
      ) : null}
    </>
  )

  if (!linked) {
    return <div className="flex flex-col items-center gap-1">{inner}</div>
  }

  return (
    <Link
      href={productHref(slug)}
      className="group flex flex-col items-center gap-1 transition-opacity hover:opacity-90"
    >
      {inner}
    </Link>
  )
}

function SignalBars({level, max = 4}: {level: number; max?: number}) {
  return (
    <div className="flex items-end gap-0.5" aria-hidden>
      {Array.from({length: max}, (_, i) => (
        <span
          key={i}
          className="w-1 rounded-sm"
          style={{
            height: `${6 + i * 3}px`,
            backgroundColor: i < level ? BRAND : `${BRAND}33`,
          }}
        />
      ))}
    </div>
  )
}

async function getAdvisorT() {
  return getTranslations('articles.advisor')
}

async function getProductAltLookup() {
  const t = await getTranslations('products')
  return createProductImageAltLookup((key) => t(key))
}

export async function AdvisorFiveSteps() {
  const t = await getAdvisorT()
  const steps = [
    {n: 1, title: t('steps.traffic'), hint: t('steps.trafficHint')},
    {n: 2, title: t('steps.splash'), hint: t('steps.splashHint')},
    {n: 3, title: t('steps.fragrance'), hint: t('steps.fragranceHint')},
    {n: 4, title: t('steps.evidence'), hint: t('steps.evidenceHint')},
    {n: 5, title: t('steps.urinal'), hint: t('steps.urinalHint')},
  ] as const

  return (
    <ol className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {steps.map((step) => (
        <li
          key={step.n}
          className="flex flex-col gap-2 rounded-xl bg-[#0F68B2]/06 px-3 py-4"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F68B2] text-sm font-bold text-white">
            {step.n}
          </span>
          <span className="text-sm font-semibold text-[#0F68B2]">{step.title}</span>
          <span className="text-xs leading-snug text-[#575756]/80">{step.hint}</span>
        </li>
      ))}
    </ol>
  )
}

export async function AdvisorTrafficCards() {
  const t = await getAdvisorT()
  const getAlt = await getProductAltLookup()
  const columns = [
    {
      key: 'high',
      title: t('traffic.highTitle'),
      places: t('traffic.highPlaces'),
      body: t('traffic.highBody'),
      slugs: ['ekcoscreen', 'xcren-hd'] as const,
      names: ['ëkcoscreen 60+', 'xcrën HD 60+'],
    },
    {
      key: 'standard',
      title: t('traffic.standardTitle'),
      places: t('traffic.standardPlaces'),
      body: t('traffic.standardBody'),
      slugs: ['powerscreen'] as const,
      names: ['powër screen'],
    },
    {
      key: 'budget',
      title: t('traffic.budgetTitle'),
      places: t('traffic.budgetPlaces'),
      body: t('traffic.budgetBody'),
      slugs: ['urolite', 'basic-screen'] as const,
      names: ['üro lite', 'basic scrëen'],
    },
  ]

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {columns.map((col) => (
        <div
          key={col.key}
          className="flex flex-col rounded-xl border border-[#0F68B2]/15 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[#0F68B2]">
            {col.title}
          </p>
          <p className="mt-1 text-sm text-[#575756]/80">{col.places}</p>
          <div className="mt-4 flex flex-wrap items-end justify-center gap-3">
            {col.slugs.map((slug, i) => (
              <ProductThumb
                key={slug}
                slug={slug}
                alt={getAlt(productBySlug(slug)?.shopPath ?? '') || col.names[i]}
                className="h-20 w-20"
                name={col.names[i]}
              />
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#575756]/90">
            {linkify(col.body, getAlt)}
          </p>
        </div>
      ))}
    </div>
  )
}

export async function AdvisorSplashStats() {
  const t = await getAdvisorT()
  const getAlt = await getProductAltLookup()
  const cards = [
    {
      pct: '95%',
      slug: 'ekcoscreen',
      name: 'ëkcoscreen 60+',
      label: t('splash.eksLabel'),
    },
    {
      pct: '92%',
      slug: 'xcren-hd',
      name: 'xcrën HD 60+',
      label: t('splash.xhdLabel'),
    },
  ]

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.slug}
          href={productHref(card.slug)}
          className="flex items-center gap-4 rounded-xl bg-[#0F68B2]/06 px-5 py-5 transition-colors hover:bg-[#0F68B2]/10"
        >
          <div className="min-w-0 flex-1">
            <p className="text-4xl font-bold tracking-tight text-[#0F68B2] sm:text-5xl">
              {card.pct}
            </p>
            <p className="mt-2 text-sm leading-snug text-[#575756]/90">
              {linkify(card.label, getAlt)}
            </p>
          </div>
          <ProductThumb
            slug={card.slug}
            alt={getAlt(productBySlug(card.slug)?.shopPath ?? '') || card.name}
            className="h-24 w-24"
            linked={false}
          />
        </Link>
      ))}
    </div>
  )
}

export async function AdvisorInfoCallout({kind}: {kind: 'uv' | 'tip' | 'ask'}) {
  const t = await getAdvisorT()
  const getAlt = await getProductAltLookup()
  const isTip = kind === 'tip' || kind === 'ask'
  const Icon = isTip ? Lightbulb : Info
  const text =
    kind === 'uv' ? t('callouts.uv') : kind === 'tip' ? t('callouts.tip') : t('callouts.ask')

  return (
    <aside
      className={`mt-6 flex gap-3 rounded-xl px-4 py-4 sm:px-5 ${
        isTip ? 'bg-[#0F68B2]/10' : 'bg-[#0F68B2]/08'
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#0F68B2]" aria-hidden />
      <p className="text-sm leading-relaxed text-[#575756]/95 sm:text-base">
        {linkify(text, getAlt)}
      </p>
    </aside>
  )
}

export async function AdvisorDurationChart() {
  const t = await getAdvisorT()
  const getAlt = await getProductAltLookup()

  return (
    <div className="mt-6 rounded-xl border border-[#0F68B2]/15 bg-white p-4 sm:p-6">
      <div className="mb-3 flex justify-between text-xs font-medium text-[#575756]/70 sm:text-sm">
        <span>{t('duration.day1')}</span>
        <span>{t('duration.day30')}</span>
        <span>{t('duration.day60')}</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#575756]">
            {t('duration.thirtyLabel')}
          </p>
          <div className="flex gap-1">
            <div className="flex h-10 w-1/2 items-center justify-center rounded-md bg-[#0F68B2]/35 text-xs font-semibold text-[#575756]">
              {t('duration.screen1')}
            </div>
            <div className="flex h-10 w-1/2 items-center justify-center rounded-md bg-[#0F68B2]/35 text-xs font-semibold text-[#575756]">
              {t('duration.screen2')}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#575756]">
            {linkify('ëkcoscreen 60+ / xcrën HD 60+', getAlt)}
          </p>
          <div className="flex h-10 items-center justify-center rounded-md bg-[#0F68B2] text-xs font-semibold text-white sm:text-sm">
            {t('duration.sixtyBar')}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[#575756]/90">
        {linkify(t('duration.note'), getAlt)}
      </p>
    </div>
  )
}

const INTENSITY_GROUPS = [
  {
    level: 4,
    key: 'most' as const,
    dims: ['7bk'] as const,
  },
  {
    level: 3,
    key: 'very' as const,
    dims: ['3b', '9g', '12p'] as const,
  },
  {
    level: 2,
    key: 'medium' as const,
    dims: ['13c', '1p', '10r'] as const,
  },
  {
    level: 1,
    key: 'subtle' as const,
    dims: ['4o', '6c', '8bm', '2g'] as const,
  },
]

export async function AdvisorFragranceVisual() {
  const t = await getAdvisorT()
  const tp = await getTranslations('products')
  const ekcoscreen = productBySlug('ekcoscreen')
  const colors = ekcoscreen ? getProductInsertColors(ekcoscreen) : []

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {INTENSITY_GROUPS.map((group) => (
          <div
            key={group.key}
            className="rounded-xl bg-[#0F68B2]/06 px-3 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#0F68B2]">
                {t(`intensity.${group.key}`)}
              </p>
              <SignalBars level={group.level} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
        {INTENSITY_GROUPS.flatMap((group) => group.dims).map((dimId) => {
          const dim = URINAL_VARIANT_DIMS.find((d) => d.id === dimId)
          if (!dim) return null
          const color = colors.find((c) => c.id.endsWith(`-${dim.id}`))
          const shortKey = dim.labelKey.replace(/^products\./, '')
          const label = tp(shortKey as 'variantLabels.x3b')
          return (
            <Link
              key={dim.id}
              href={productHref('ekcoscreen')}
              className="flex flex-col items-center gap-1.5 transition-opacity hover:opacity-90"
            >
              <div className="relative h-14 w-14">
                {color ? (
                  <Image
                    src={color.imageSrc}
                    alt={label}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                ) : (
                  <span
                    className="absolute inset-2 rounded-full"
                    style={{backgroundColor: dim.swatchHex}}
                  />
                )}
              </div>
              <span className="text-center text-[10px] leading-tight text-[#575756]/90 sm:text-xs">
                {label}
              </span>
            </Link>
          )
        })}
      </div>

      <p className="text-sm leading-relaxed text-[#575756]/90">
        {t('intensity.popular')}
      </p>
    </div>
  )
}

export async function AdvisorEcoOneCallout() {
  const t = await getAdvisorT()

  return (
    <div className="mt-6 overflow-hidden rounded-xl bg-[#0F68B2]/08">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="shrink-0">
          <p className="text-5xl font-bold tracking-tight text-[#0F68B2] sm:text-6xl">
            93%
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-[#0F68B2] sm:text-lg">
            {t.rich('ecoOne.title', {
              ecoOne: (chunks) => (
                <Link
                  href="/eco-one"
                  className="font-semibold text-[#0F68B2] underline underline-offset-2 hover:text-[#0d5a9a]"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#575756]/90">
            {t('ecoOne.body')}
          </p>
        </div>
      </div>
    </div>
  )
}

export async function AdvisorUrinalCards() {
  const t = await getAdvisorT()
  const getAlt = await getProductAltLookup()
  const cards = [
    {
      key: 'small',
      title: t('urinal.smallTitle'),
      body: t('urinal.smallBody'),
      slug: 'urolite',
      name: 'üro lite',
    },
    {
      key: 'most',
      title: t('urinal.mostTitle'),
      body: t('urinal.mostBody'),
      slug: 'powerscreen',
      name: 'powër screen',
    },
    {
      key: 'waterless',
      title: t('urinal.waterlessTitle'),
      body: t('urinal.waterlessBody'),
      slug: 'ekcoscreen',
      name: 'ëkcoscreen 60+',
    },
    {
      key: 'drain',
      title: t('urinal.drainTitle'),
      body: t('urinal.drainBody'),
      slug: 'ekcoscreen',
      name: 'ëkcoscreen 60+',
    },
    {
      key: 'design',
      title: t('urinal.designTitle'),
      body: t('urinal.designBody'),
      slug: 'xcren-hd',
      name: 'xcrën HD 60+',
    },
    {
      key: 'puck',
      title: t('urinal.puckTitle'),
      body: t('urinal.puckBody'),
      slug: 'xcren-puck',
      name: 'xcrën puck',
    },
  ]

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.key}
          href={productHref(card.slug)}
          className="flex gap-3 rounded-xl border border-[#0F68B2]/12 bg-white p-4 transition-colors hover:border-[#0F68B2]/35 hover:bg-[#0F68B2]/04"
        >
          <ProductThumb
            slug={card.slug}
            alt={getAlt(productBySlug(card.slug)?.shopPath ?? '') || card.name}
            className="h-16 w-16"
            linked={false}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0F68B2]">{card.title}</p>
            <p className="mt-1 text-xs font-semibold text-[#0F68B2] underline underline-offset-2">
              {card.name}
            </p>
            <p className="mt-1 text-sm leading-snug text-[#575756]/90">{card.body}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export async function AdvisorSummaryTable() {
  const t = await getAdvisorT()
  const getAlt = await getProductAltLookup()
  const rows = [
    {need: t('summary.rows.high'), rec: 'ëkcoscreen 60+, xcrën HD 60+'},
    {need: t('summary.rows.standard'), rec: 'powër screen'},
    {need: t('summary.rows.budget'), rec: t('summary.recs.budget')},
    {need: t('summary.rows.small'), rec: 'üro lite'},
    {need: t('summary.rows.waterless'), rec: 'ëkcoscreen 60+, xcrën HD 60+'},
    {need: t('summary.rows.drain'), rec: t('summary.recs.drain')},
    {need: t('summary.rows.design'), rec: 'xcrën HD 60+'},
    {need: t('summary.rows.puck'), rec: 'xcrën puck'},
    {need: t('summary.rows.bio'), rec: t('summary.recs.bio')},
    {
      need: t('summary.rows.logo'),
      rec: t('summary.recs.logo'),
      logoLink: true as const,
    },
  ]

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-[#0F68B2]/15">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead>
          <tr className="bg-[#0F68B2] text-white">
            <th className="px-4 py-3 font-semibold">{t('summary.colNeed')}</th>
            <th className="px-4 py-3 font-semibold">{t('summary.colRec')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.need}
              className={i % 2 === 0 ? 'bg-white' : 'bg-[#0F68B2]/05'}
            >
              <td className="px-4 py-3 font-medium text-[#575756]">{row.need}</td>
              <td className="px-4 py-3 text-[#575756]/90">
                {'logoLink' in row && row.logoLink ? (
                  <Link
                    href="/private-label"
                    className="font-semibold text-[#0F68B2] underline underline-offset-2 hover:text-[#0d5a9a]"
                  >
                    {row.rec}
                  </Link>
                ) : (
                  linkify(row.rec, getAlt)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export async function AdvisorCompleteGrid() {
  const t = await getAdvisorT()
  const getAlt = await getProductAltLookup()
  const items = [
    {
      slug: 'ekco-clip',
      name: 'ëkco clip',
      body: t('complete.clip'),
    },
    {
      slug: 'fresh-drop',
      name: 'frësh drop',
      body: t('complete.fresh'),
    },
    {
      slug: 'ekco-mat',
      name: 'ëkco mat',
      body: t('complete.mat'),
    },
    {
      slug: 'ez-trap',
      name: 'ëz trap',
      body: t('complete.trap'),
    },
  ]

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={productHref(item.slug)}
          className="flex gap-4 rounded-xl bg-[#0F68B2]/06 px-4 py-4 transition-colors hover:bg-[#0F68B2]/10"
        >
          <ProductThumb
            slug={item.slug}
            alt={getAlt(productBySlug(item.slug)?.shopPath ?? '') || item.name}
            className="h-20 w-20"
            linked={false}
          />
          <div className="min-w-0">
            <p className="font-semibold text-[#0F68B2] underline underline-offset-2">
              {item.name}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#575756]/90">
              {item.body}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
