/** Sanity document id for the urinal-screen advisor article. */
export const ADVISOR_ARTICLE_ID = 'a73f8673-8a93-4ce9-bc84-4d768a22773c'

/** English slug (other locales may use localized slugs). */
export const ADVISOR_ARTICLE_SLUG = 'how-to-choose-the-right-urinal-screen'

/** Sanity body blocks replaced by advisor visuals (avoid duplicate copy). */
export const ADVISOR_SKIP_BLOCK_KEYS = new Set([
  'p-traffic-high',
  'p-traffic-standard',
  'p-traffic-budget',
  'p-splash-stats',
  'p-splash-uv',
  'p-splash-tip',
  'p-frag-cost',
  'p-frag-strong',
  'p-evidence-ask',
  'b-summary-1',
  'b-summary-2',
  'b-summary-3',
  'b-summary-4',
  'b-summary-5',
  'b-summary-6',
  'b-summary-7',
  'b-summary-8',
  'b-summary-9',
  'b-summary-10',
  'p-complete-clip',
  'p-complete-mat',
  'p-complete-fresh',
  'p-complete-trap',
  'b-urinal-small',
  'b-urinal-most',
  'b-urinal-waterless',
  'b-urinal-drain',
  'b-urinal-design',
  'b-urinal-puck',
])

/** Detect advisor article by id, English slug, or characteristic body keys. */
export function isAdvisorArticle(options: {
  id?: string
  slug?: string
  blockKeys?: Iterable<string | undefined>
}): boolean {
  if (options.id === ADVISOR_ARTICLE_ID) return true
  if (options.slug === ADVISOR_ARTICLE_SLUG) return true

  if (options.blockKeys) {
    const keys = new Set(
      [...options.blockKeys].filter((k): k is string => Boolean(k)),
    )
    return (
      keys.has('h2-traffic') &&
      keys.has('p-splash-stats') &&
      keys.has('h2-fragrance')
    )
  }

  return false
}
