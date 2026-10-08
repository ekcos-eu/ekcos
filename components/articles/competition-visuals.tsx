import type {ReactNode} from 'react'
import {getTranslations} from 'next-intl/server'
import type {PortableTextBlock} from '@portabletext/types'
import {
  Award,
  Check,
  DoorOpen,
  Droplets,
  FileBadge,
  FileText,
  FlaskConical,
  HelpCircle,
  Leaf,
  Megaphone,
  Package,
  Palette,
  Recycle,
  Scale,
  Shapes,
  Sparkles,
  Timer,
  Trash2,
  Video,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import {Link} from '@/i18n/routing'
import {
  createProductImageAltLookup,
  linkifyProductChildren,
  type ProductImageAltLookup,
} from '@/lib/article-product-links'

const BRAND = '#0F68B2'

const STAT_VALUES = ['93%', '60+', '141 g', '95%'] as const
const STAT_KEYS = [
  'stat-bio',
  'stat-days',
  'stat-grams',
  'stat-bristles',
] as const

const PROOF_KEYS = [
  {title: 'proof-test-title', body: 'proof-test-body', Icon: FlaskConical},
  {title: 'proof-patents-title', body: 'proof-patents-body', Icon: Award},
  {title: 'proof-ppwr-title', body: 'proof-ppwr-body', Icon: Package},
  {title: 'proof-sds-title', body: 'proof-sds-body', Icon: FileText},
] as const

const FEATURE_ICONS: LucideIcon[] = [
  Trash2,
  Recycle,
  Package,
  Waves,
  Video,
  Timer,
  Scale,
  Droplets,
  FileBadge,
  Palette,
  DoorOpen,
  FileText,
  Megaphone,
]

const ADVANTAGE_GROUPS = [
  {key: 'material', count: 3, Icon: Leaf},
  {key: 'performance', count: 4, Icon: Waves},
  {key: 'fragrance', count: 2, Icon: Sparkles},
  {key: 'design', count: 2, Icon: Shapes},
  {key: 'cubicle', count: 3, Icon: DoorOpen},
  {key: 'marketing', count: 4, Icon: Megaphone},
] as const

function blockPlainText(block: PortableTextBlock | undefined): string {
  if (!block || !Array.isArray(block.children)) return ''
  return block.children
    .map((child) =>
      child &&
      typeof child === 'object' &&
      'text' in child &&
      typeof child.text === 'string'
        ? child.text
        : '',
    )
    .join('')
}

function childText(child: unknown): string {
  if (
    child &&
    typeof child === 'object' &&
    'text' in child &&
    typeof (child as {text: unknown}).text === 'string'
  ) {
    return (child as {text: string}).text
  }
  return ''
}

function askQuestionText(block: PortableTextBlock | undefined): string {
  if (!block || !Array.isArray(block.children)) return ''
  if (block.children.length >= 2) {
    const question = childText(block.children[1])
    if (question) return question
  }
  return blockPlainText(block)
}

function askLabelText(block: PortableTextBlock | undefined): string {
  if (!block || !Array.isArray(block.children)) return ''
  const label = childText(block.children[0])
  if (label.trim()) return label.replace(/:\s*$/, '').trim()
  return ''
}

function buildTextMap(
  blocks: PortableTextBlock[],
): Map<string, PortableTextBlock> {
  const map = new Map<string, PortableTextBlock>()
  for (const block of blocks) {
    if (typeof block._key === 'string') map.set(block._key, block)
  }
  return map
}

const STAT_STRIPPERS = [
  /^93\s*%\s*/i,
  /^60\+\s*/i,
  /^141\s*g\s*/i,
  /^95\s*%\s*/i,
] as const

function stripLeadingStat(index: number, label: string): string {
  const pattern = STAT_STRIPPERS[index]
  if (!pattern) return label.trim()
  return label.replace(pattern, '').trim()
}

function linkify(text: string, getAlt: ProductImageAltLookup): ReactNode {
  return linkifyProductChildren(text, getAlt)
}

async function getProductAltLookup() {
  const t = await getTranslations('products')
  return createProductImageAltLookup((key) => t(key))
}

async function getCompetitionT() {
  return getTranslations('articles.competition')
}

export async function CompetitionIntroCallout({text}: {text: string}) {
  const getAlt = await getProductAltLookup()
  return (
    <aside className="mt-6 flex gap-4 rounded-xl bg-[#0F68B2]/06 px-4 py-4 sm:px-5">
      <span
        className="mt-0.5 w-1 shrink-0 rounded-full bg-[#0F68B2]"
        aria-hidden
      />
      <p className="text-base leading-relaxed text-[#575756]/95 text-justify">
        {linkify(text, getAlt)}
      </p>
    </aside>
  )
}

export async function CompetitionStatsGrid({
  blocks,
}: {
  blocks: PortableTextBlock[]
}) {
  const getAlt = await getProductAltLookup()
  const map = buildTextMap(blocks)

  const cards = STAT_KEYS.map((key, i) => {
    const value = STAT_VALUES[i]
    const raw = blockPlainText(map.get(key))
    return {
      key,
      value,
      label: stripLeadingStat(i, raw) || raw,
    }
  })

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-[#0F68B2]/12 bg-[#0F68B2]/05 px-5 py-5"
          style={{borderTopWidth: 3, borderTopColor: BRAND}}
        >
          <p className="text-4xl font-bold tracking-tight text-[#0F68B2] sm:text-5xl">
            {card.value}
          </p>
          <p className="mt-2 text-sm leading-snug text-[#575756]/90">
            {linkify(card.label, getAlt)}
          </p>
        </div>
      ))}
    </div>
  )
}

export async function CompetitionProofGrid({
  blocks,
}: {
  blocks: PortableTextBlock[]
}) {
  const getAlt = await getProductAltLookup()
  const map = buildTextMap(blocks)

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {PROOF_KEYS.map(({title, body, Icon}) => (
        <div
          key={title}
          className="flex gap-3 rounded-xl border border-[#0F68B2]/12 bg-white p-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F68B2] text-white">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0F68B2] sm:text-base">
              {blockPlainText(map.get(title))}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#575756]/90">
              {linkify(blockPlainText(map.get(body)), getAlt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export async function CompetitionCompareTable({
  blocks,
}: {
  blocks: PortableTextBlock[]
}) {
  const t = await getCompetitionT()
  const getAlt = await getProductAltLookup()
  const map = buildTextMap(blocks)
  const askLabel = askLabelText(map.get('f1-ask')) || t('colAsk')

  const rows = Array.from({length: 13}, (_, i) => {
    const n = i + 1
    return {
      name: blockPlainText(map.get(`f${n}-name`)),
      ekcos: blockPlainText(map.get(`f${n}-ekcos`)),
      ask: askQuestionText(map.get(`f${n}-ask`)),
      Icon: FEATURE_ICONS[i] ?? HelpCircle,
    }
  })

  return (
    <div className="mt-6 space-y-3">
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-xl border border-[#0F68B2]/15 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#0F68B2] text-white">
              <th className="w-[22%] px-4 py-3 font-semibold">{t('colFeature')}</th>
              <th className="w-[39%] px-4 py-3 font-semibold">ëkcos</th>
              <th className="w-[39%] px-4 py-3 font-semibold">{askLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.name || i}
                className={i % 2 === 0 ? 'bg-white' : 'bg-[#0F68B2]/05'}
              >
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-2">
                    <row.Icon
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#0F68B2]"
                      aria-hidden
                    />
                    <span className="font-semibold text-[#575756]">
                      {row.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-[#575756]/90">
                  <div className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F68B2]/15 text-[#0F68B2]">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    <span>{linkify(row.ekcos, getAlt)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-[#575756]/90">
                  <div className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F68B2] text-white">
                      <HelpCircle className="h-3 w-3" aria-hidden />
                    </span>
                    <span>{row.ask}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <article
            key={row.name || i}
            className="rounded-xl border border-[#0F68B2]/15 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <row.Icon className="h-4 w-4 text-[#0F68B2]" aria-hidden />
              <h4 className="text-sm font-semibold text-[#0F68B2]">{row.name}</h4>
            </div>
            <div className="mt-3 flex gap-2 text-sm text-[#575756]/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F68B2]/15 text-[#0F68B2]">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              <p>{linkify(row.ekcos, getAlt)}</p>
            </div>
            <div className="mt-3 flex gap-2 text-sm text-[#575756]/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F68B2] text-white">
                <HelpCircle className="h-3 w-3" aria-hidden />
              </span>
              <p>
                <span className="font-semibold text-[#575756]">{askLabel}: </span>
                {row.ask}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export async function CompetitionAdvantagesGrid({
  blocks,
}: {
  blocks: PortableTextBlock[]
}) {
  const getAlt = await getProductAltLookup()
  const map = buildTextMap(blocks)

  const groups = ADVANTAGE_GROUPS.map((group) => ({
    key: group.key,
    Icon: group.Icon,
    title: blockPlainText(map.get(`adv-${group.key}-h3`)),
    bullets: Array.from({length: group.count}, (_, i) =>
      blockPlainText(map.get(`adv-${group.key}-${i + 1}`)),
    ).filter(Boolean),
  }))

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <section
          key={group.key}
          className="rounded-xl border border-[#0F68B2]/12 bg-white p-4 sm:p-5"
          style={{borderTopWidth: 3, borderTopColor: BRAND}}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F68B2]/12 text-[#0F68B2]">
              <group.Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-[#0F68B2] sm:text-lg">
              {group.title}
            </h3>
          </div>
          <ul className="mt-3 space-y-2">
            {group.bullets.map((bullet) => (
              <li
                key={bullet.slice(0, 48)}
                className="flex gap-2 text-sm leading-relaxed text-[#575756]/90"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F68B2]"
                  aria-hidden
                />
                <span>{linkify(bullet, getAlt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export async function CompetitionCtaBanner({
  blocks,
}: {
  blocks: PortableTextBlock[]
}) {
  const t = await getCompetitionT()
  const getAlt = await getProductAltLookup()
  const map = buildTextMap(blocks)
  const title = blockPlainText(map.get('h2-cta'))
  const lines = ['cta-1', 'cta-2', 'cta-3']
    .map((key) => blockPlainText(map.get(key)))
    .filter(Boolean)

  return (
    <div className="mt-8 overflow-hidden rounded-xl bg-[#0F68B2] text-white">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="min-w-0 max-w-xl">
          <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-white/90 sm:text-base">
            {lines.map((line) => (
              <p key={line.slice(0, 40)}>{linkify(line, getAlt)}</p>
            ))}
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#0F68B2] transition-opacity hover:opacity-90"
        >
          {t('websiteCta')}
        </Link>
      </div>
    </div>
  )
}
