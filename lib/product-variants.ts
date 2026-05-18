import type { Product, ProductColor } from '@/lib/types/product'
import { publicPath } from '@/lib/paths'

/** Eleven colorways shared across urinal-screen lines (matches public/products/products.csv). */
export const URINAL_VARIANT_DIMS = [
  { id: '1p', skuMid: '1P' as const, labelKey: 'products.variantLabels.x1p', swatchHex: '#7B4397' },
  { id: '2g', skuMid: '2G' as const, labelKey: 'products.variantLabels.x2g', swatchHex: '#8BC34A' },
  { id: '3b', skuMid: '3B' as const, labelKey: 'products.variantLabels.x3b', swatchHex: '#0F68B2' },
  { id: '4o', skuMid: '4O' as const, labelKey: 'products.variantLabels.x4o', swatchHex: '#F57C00' },
  { id: '6c', skuMid: '6C' as const, labelKey: 'products.variantLabels.x6c', swatchHex: '#CFD8DC' },
  { id: '7bk', skuMid: '7BK' as const, labelKey: 'products.variantLabels.x7bk', swatchHex: '#212121' },
  { id: '8bm', skuMid: '8BM' as const, labelKey: 'products.variantLabels.x8bm', swatchHex: '#E64A19' },
  { id: '9g', skuMid: '9G' as const, labelKey: 'products.variantLabels.x9g', swatchHex: '#2E7D32' },
  { id: '10r', skuMid: '10R' as const, labelKey: 'products.variantLabels.x10r', swatchHex: '#C62828' },
  { id: '12p', skuMid: '12P' as const, labelKey: 'products.variantLabels.x12p', swatchHex: '#5E35B1' },
  { id: '13c', skuMid: '13C' as const, labelKey: 'products.variantLabels.x13c', swatchHex: '#F9A825' },
] as const

/** Exact PhotoStock V0 hero filenames (Shopify export quirks). */
const V0_FILENAME: Partial<Record<string, string>> = {
  'EKS-1P': 'EKS-1P-V0 .png',
  'PWR-12P': 'PWR-12P-V0 .png',
  'TBC-12P': 'TBC-12P-V0 .png',
}

function urinalStockV0File(line: 'XHD' | 'EKS' | 'PWR' | 'BS' | 'TBC' | 'ULT' | 'FDI', sku: string): string {
  const override = V0_FILENAME[sku]
  if (override) return override
  if (line === 'XHD') return `${sku}-V0 .png`
  return `${sku}-V0.png`
}

type UrinalFolder = readonly [string, string]

export function buildUrinalLineColors(
  line: 'XHD' | 'EKS' | 'PWR' | 'BS' | 'TBC' | 'ULT' | 'FDI',
  idPrefix: string,
  folder: UrinalFolder,
): ProductColor[] {
  return URINAL_VARIANT_DIMS.map((dim) => {
    const sku = `${line}-${dim.skuMid}`
    const file = urinalStockV0File(line, sku)
    return {
      id: `${idPrefix}-${dim.id}`,
      sku,
      labelKey: dim.labelKey,
      swatchHex: dim.swatchHex,
      imageSrc: publicPath(...folder, 'PhotoStock', file),
    }
  })
}

/** Main image + product-type thumbnails: prefer “blue / fresh” (3B) or puck blue (XPU-02B). */
export function getConfiguratorThumbnailSrc(product: Product): string {
  const blue = product.colors.find((c) => {
    const s = c.sku?.toUpperCase() ?? ''
    return s.includes('3B') || s.includes('02B')
  })
  return blue?.imageSrc ?? product.colors[0]?.imageSrc ?? product.heroImageSrc
}

/** Default selected color in the rail: blue / fresh when available. */
export function getDefaultColorId(product: Product): string {
  if (product.defaultColorId) {
    const explicit = product.colors.find((c) => c.id === product.defaultColorId)
    if (explicit) return explicit.id
  }

  const blue = product.colors.find((c) => {
    const s = c.sku?.toUpperCase() ?? ''
    return s.includes('3B') || s.includes('02B')
  })
  return blue?.id ?? product.colors[0]?.id ?? ''
}
