/** Sanity document id for the comparison guide article. */
export const COMPETITION_ARTICLE_ID = '39d23212-2cf4-432b-b9f9-cfd74cbb0b85'

/** English slug (shared across locales). */
export const COMPETITION_ARTICLE_SLUG = 'ekcos-vs-other-suppliers'

/** Sanity body blocks replaced by competition visuals (avoid duplicate copy). */
export const COMPETITION_SKIP_BLOCK_KEYS = new Set([
  'stat-bio',
  'stat-days',
  'stat-grams',
  'stat-bristles',
  'proof-test-title',
  'proof-test-body',
  'proof-patents-title',
  'proof-patents-body',
  'proof-ppwr-title',
  'proof-ppwr-body',
  'proof-sds-title',
  'proof-sds-body',
  ...Array.from({length: 13}, (_, i) => [
    `f${i + 1}-name`,
    `f${i + 1}-ekcos`,
    `f${i + 1}-ask`,
  ]).flat(),
  'adv-material-h3',
  'adv-material-1',
  'adv-material-2',
  'adv-material-3',
  'adv-performance-h3',
  'adv-performance-1',
  'adv-performance-2',
  'adv-performance-3',
  'adv-performance-4',
  'adv-fragrance-h3',
  'adv-fragrance-1',
  'adv-fragrance-2',
  'adv-design-h3',
  'adv-design-1',
  'adv-design-2',
  'adv-cubicle-h3',
  'adv-cubicle-1',
  'adv-cubicle-2',
  'adv-cubicle-3',
  'adv-marketing-h3',
  'adv-marketing-1',
  'adv-marketing-2',
  'adv-marketing-3',
  'adv-marketing-4',
  'h2-cta',
  'cta-1',
  'cta-2',
  'cta-3',
])

/** Detect competition article by id, English slug, or characteristic body keys. */
export function isCompetitionArticle(options: {
  id?: string
  slug?: string
  blockKeys?: Iterable<string | undefined>
}): boolean {
  if (options.id === COMPETITION_ARTICLE_ID) return true
  if (options.slug === COMPETITION_ARTICLE_SLUG) return true

  if (options.blockKeys) {
    const keys = new Set(
      [...options.blockKeys].filter((k): k is string => Boolean(k)),
    )
    return (
      keys.has('h2-glance') &&
      keys.has('stat-bio') &&
      keys.has('h2-compare') &&
      keys.has('f1-name')
    )
  }

  return false
}
