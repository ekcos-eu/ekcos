export type ProductColor = {
  id: string
  /** Path under /public, e.g. products/Xcren HD/PhotoStock/x.jpg */
  imageSrc: string
  labelKey: string
  /** Shop variant code, e.g. XHD-1P */
  sku?: string
  /** Optional CSS hex for the circular swatch */
  swatchHex?: string
  /** Secondary angle (e.g. side profile) */
  sideImageSrc?: string
  /** In-context shot (e.g. urinal mockup) */
  urinalImageSrc?: string
}

export type ProductFragrance = {
  id: string
  labelKey: string
}

export type Product = {
  slug: string
  nameKey: string
  categoryKey: string
  shortDescriptionKey: string
  longDescriptionKey: string
  benefitKeys: string[]
  useCaseKeys: string[]
  colors: ProductColor[]
  fragrances?: ProductFragrance[]
  /** Overrides heuristic default color in the configurator */
  defaultColorId?: string
  /** Primary hero image for cards / default configurator view */
  heroImageSrc: string
  /** Blue pill label in the studio header (falls back to categoryKey) */
  badgeKey?: string
  shopPath: string
  brandingAvailable: boolean
  ecoOneCompatible: boolean
  featured: boolean
}
