/**
 * Scans public/products Detail folders for close-up photos and writes a lightweight
 * JSON manifest. Used so the product PDP serverless function does not need to
 * readdir image folders (which would pull ~600MB of assets into the bundle).
 *
 * Run: bun scripts/generate-product-image-manifest.ts
 * Also runs automatically via `bun run build` (prebuild).
 */
import fs from 'fs'
import path from 'path'

const SLUG_TO_FOLDER: Record<string, string> = {
  'xcren-hd': 'Xcren HD',
  ekcoscreen: 'Ekcoscreen',
  powerscreen: 'Powerscreen',
  'basic-screen': 'Basic Screen',
  urolite: 'Urolite',
  'ekco-clip': 'Ekcoclip',
  'fresh-drop': 'Freshdrop',
  'ez-trap': 'EzTrap',
  'xcren-puck': 'Xcren Puck',
  'ekco-mat': 'Ekcomat',
}

function publicPath(...segments: string[]): string {
  return `/${segments.map((s) => encodeURIComponent(s)).join('/')}`
}

function detailImagesForFolder(folder: string): string[] {
  for (const sub of ['Detail', 'Details', 'detail', 'details'] as const) {
    const dir = path.join(process.cwd(), 'public', 'products', folder, sub)
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    if (files.length === 0) continue
    return files.map((f) => publicPath('products', folder, sub, f))
  }
  return []
}

const manifest: Record<string, string[]> = {}
for (const [slug, folder] of Object.entries(SLUG_TO_FOLDER)) {
  manifest[slug] = detailImagesForFolder(folder)
}

const outDir = path.join(process.cwd(), 'lib', 'generated')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'product-detail-images.json')
fs.writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')

const total = Object.values(manifest).reduce((n, arr) => n + arr.length, 0)
console.log(
  `Wrote ${outPath} (${total} detail images across ${Object.keys(manifest).length} products)`,
)
