import { readdir } from 'node:fs/promises'
import path from 'node:path'

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif'])
const FALLBACK_HERO_IMAGE = '/homesliders/Slider-Xcren-HD.webp'

function isSupportedImage(fileName: string) {
  return SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase())
}

export async function getHomeHeroImages() {
  const productsRoot = path.join(process.cwd(), 'public', 'products')

  try {
    const productDirs = await readdir(productsRoot, { withFileTypes: true })
    const imagePaths: string[] = []

    for (const dirEntry of productDirs) {
      if (!dirEntry.isDirectory()) {
        continue
      }

      const photoStockDir = path.join(productsRoot, dirEntry.name, 'PhotoStock')

      try {
        const photoEntries = await readdir(photoStockDir, { withFileTypes: true })
        for (const photoEntry of photoEntries) {
          if (!photoEntry.isFile() || !isSupportedImage(photoEntry.name)) {
            continue
          }

          const relativePath = path.posix.join('products', dirEntry.name, 'PhotoStock', photoEntry.name)
          imagePaths.push(encodeURI(`/${relativePath}`))
        }
      } catch {
        // Ignore products that do not have a PhotoStock folder.
      }
    }

    return imagePaths.sort()
  } catch {
    return [FALLBACK_HERO_IMAGE]
  }
}
