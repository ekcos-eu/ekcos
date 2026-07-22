import { products } from '@/lib/products'

/** Products offered in the Private Label inquiry form (blue 3B hero images). */
export const PRIVATE_LABEL_PRODUCT_SLUGS = [
  'xcren-hd',
  'ekcoscreen',
  'powerscreen',
  'basic-screen',
  'urolite',
  'ekco-clip',
  'fresh-drop',
  'ez-trap',
  'xcren-puck',
] as const

export type PrivateLabelProductSlug =
  (typeof PRIVATE_LABEL_PRODUCT_SLUGS)[number]

export type PrivateLabelProductOption = {
  slug: PrivateLabelProductSlug
  nameKey: string
  imageSrc: string
}

export function getPrivateLabelProducts(): PrivateLabelProductOption[] {
  return PRIVATE_LABEL_PRODUCT_SLUGS.map((slug) => {
    const product = products.find((item) => item.slug === slug)
    if (!product) {
      throw new Error(`Missing private-label product: ${slug}`)
    }
    return {
      slug,
      nameKey: product.nameKey,
      imageSrc: product.heroImageSrc,
    }
  })
}
