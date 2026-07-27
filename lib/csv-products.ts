import fs from 'fs'
import path from 'path'
import { getProductBySlug } from '@/lib/products'
import { publicPath } from '@/lib/paths'
import { URINAL_VARIANT_DIMS } from '@/lib/product-variants'

export type CsvVariant = {
  sku: string
  title: string
  color?: string
  scent?: string
  price: string
  /** Local public path to matching PhotoStock image */
  imageSrc: string
}

export type CsvProductDetail = {
  slug: string
  title: string
  bodyHtml: string
  price: string
  /** All local PhotoStock images — used as gallery */
  images: string[]
  variants: CsvVariant[]
  shopPath: string
}

// ---------------------------------------------------------------------------
// Slug → CSV handle prefix mapping
// ---------------------------------------------------------------------------

const SLUG_TO_CSV_PREFIX: Record<string, string> = {
  'xcren-hd': 'xcren-hd',
  'ekcoscreen': 'ekcoscreen',
  'powerscreen': 'power-screen',
  'basic-screen': 'basic-screen',
  'urolite': 'uro-lite',
  'ekco-clip': 'ekco-clip',
  'fresh-drop': 'fresh-drop',
  'ez-trap': 'ez-trap',
  'xcren-puck': 'xcren-puck',
  'ekco-mat': 'ekco-mat',
}

// Mapping from slug to local PhotoStock folder (matches public/products dirs)
const SLUG_TO_FOLDER: Record<string, string> = {
  'xcren-hd': 'Xcren HD',
  'ekcoscreen': 'Ekcoscreen',
  'powerscreen': 'Powerscreen',
  'basic-screen': 'Basic Screen',
  'urolite': 'Urolite',
  'ekco-clip': 'Ekcoclip',
  'fresh-drop': 'Freshdrop',
  'ez-trap': 'EzTrap',
  'xcren-puck': 'Xcren Puck',
  'ekco-mat': 'Ekcomat',
}

// ---------------------------------------------------------------------------
// CSV parser — simple line-by-line; handles quoted fields with commas inside
// ---------------------------------------------------------------------------

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      // Quoted field
      let field = ''
      i++ // skip opening quote
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"'
          i += 2
        } else if (line[i] === '"') {
          i++ // skip closing quote
          break
        } else {
          field += line[i++]
        }
      }
      result.push(field)
      if (line[i] === ',') i++
    } else {
      // Unquoted field
      const end = line.indexOf(',', i)
      if (end === -1) {
        result.push(line.slice(i))
        break
      }
      result.push(line.slice(i, end))
      i = end + 1
    }
  }
  return result
}

function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0])
  return lines
    .slice(1)
    .map((line) => {
      const cols = parseCsvLine(line)
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h.trim()] = (cols[idx] ?? '').trim()
      })
      return row
    })
    .filter((row) => row['Handle'])
}

// ---------------------------------------------------------------------------
// Local image discovery
// ---------------------------------------------------------------------------

function localPhotostockImages(slug: string): string[] {
  const folder = SLUG_TO_FOLDER[slug]
  if (!folder) return []

  // Use the existing Product.colors from lib/products.ts to get all local images
  // in the correct order (matches URINAL_VARIANT_DIMS)
  const product = getProductBySlug(slug)
  if (product?.colors && product.colors.length > 0) {
    return product.colors.map((c) => c.imageSrc)
  }

  // Fallback: scan directory
  const dir = path.join(process.cwd(), 'public', 'products', folder, 'PhotoStock')
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort()
      .map((f) => publicPath('products', folder, 'PhotoStock', f))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// CSV column name constants (exact Shopify export header text)
// ---------------------------------------------------------------------------

const COL = {
  handle: 'Handle',
  title: 'Title',
  body: 'Body (HTML)',
  sku: 'Variant SKU',
  price: 'Variant Price',
  color: 'Color (product.metafields.shopify.color-pattern)',
  scent: 'Scent (product.metafields.shopify.scent)',
} as const

// ---------------------------------------------------------------------------
// Map CSV variant color/scent/sku → matching local PhotoStock image
// ---------------------------------------------------------------------------

function resolveVariantImage(slug: string, sku: string): string {
  const folder = SLUG_TO_FOLDER[slug]
  if (!folder) return ''

  const product = getProductBySlug(slug)
  if (product) {
    const match = product.colors.find((c) => c.sku === sku)
    if (match) return match.imageSrc
  }

  // Fallback: derive filename from SKU for urinal line products
  const skuUpper = sku.toUpperCase()

  // XHD has trailing space quirk
  if (skuUpper.startsWith('XHD')) {
    return publicPath('products', folder, 'PhotoStock', `${skuUpper}-V0 .png`)
  }

  // Handle known filename quirks from product-variants.ts
  const QUIRKY: Record<string, string> = {
    'EKS-1P': 'EKS-1P-V0 .png',
    'PWR-12P': 'PWR-12P-V0 .png',
    'TBC-12P': 'TBC-12P-V0 .png',
  }
  const fileName = QUIRKY[skuUpper] ?? `${skuUpper}-V0.png`
  return publicPath('products', folder, 'PhotoStock', fileName)
}

// ---------------------------------------------------------------------------
// Colour swatch data — reuse URINAL_VARIANT_DIMS for display
// ---------------------------------------------------------------------------

export type ColorSwatch = {
  sku: string
  labelKey: string
  swatchHex: string
  imageSrc: string
}

export function getColorSwatches(slug: string): ColorSwatch[] {
  const product = getProductBySlug(slug)
  if (!product) return []
  return product.colors.map((c) => ({
    sku: c.sku ?? c.id,
    labelKey: c.labelKey,
    swatchHex: c.swatchHex ?? '#0F68B2',
    imageSrc: c.imageSrc,
  }))
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

let _csvRows: Record<string, string>[] | null = null

function getCsvRows(): Record<string, string>[] {
  if (_csvRows) return _csvRows
  const csvPath = path.join(process.cwd(), 'public', 'products', 'products.csv')
  const raw = fs.readFileSync(csvPath, 'utf-8')
  _csvRows = parseCsv(raw)
  return _csvRows
}

export function getProductDetailBySlug(slug: string): CsvProductDetail | null {
  const prefix = SLUG_TO_CSV_PREFIX[slug]
  if (!prefix) return null

  const product = getProductBySlug(slug)
  const rows = getCsvRows()

  // Collect all rows whose Handle starts with the prefix
  const matchingRows = rows.filter((r) => r[COL.handle].startsWith(prefix))

  // Fallback when CSV has no rows for this product (e.g. basic-screen)
  if (matchingRows.length === 0) {
    if (!product) return null
    return {
      slug,
      title: product.slug,
      bodyHtml: '',
      price: '',
      images: localPhotostockImages(slug),
      variants: product.colors.map((c) => ({
        sku: c.sku ?? c.id,
        title: c.sku ?? c.id,
        price: '',
        imageSrc: c.imageSrc,
      })),
      shopPath: product.shopPath,
    }
  }

  // Primary row = first row with a Title
  const primaryRow = matchingRows.find((r) => r[COL.title]) ?? matchingRows[0]

  const title = primaryRow[COL.title] ?? slug
  const bodyHtml = primaryRow[COL.body] ?? ''
  const price = primaryRow[COL.price] ?? ''

  // Variants: one per distinct SKU (rows with SKU set)
  const variantRows = matchingRows.filter((r) => r[COL.sku])
  const variants: CsvVariant[] = variantRows.map((r) => ({
    sku: r[COL.sku],
    title: r[COL.title] ?? title,
    color: r[COL.color] || undefined,
    scent: r[COL.scent] || undefined,
    price: r[COL.price] ?? price,
    imageSrc: resolveVariantImage(slug, r[COL.sku]),
  }))

  // Gallery: all local PhotoStock images
  const images = localPhotostockImages(slug)

  return {
    slug,
    title,
    bodyHtml,
    price,
    images,
    variants,
    shopPath: product?.shopPath ?? `/collections/${slug}`,
  }
}

export function getAllProductSlugs(): string[] {
  return Object.keys(SLUG_TO_CSV_PREFIX)
}
