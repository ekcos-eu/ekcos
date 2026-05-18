/** Theme layers for the fullscreen product configurator, driven by the selected variant accent. */

export type ConfiguratorTheme = {
  /** Full-area background */
  gradient: string
  /** Grid line color (subtle) */
  gridLine: string
  /** Bottom “floor” strip */
  floorGradient: string
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace('#', '')
  if (h.length !== 3 && h.length !== 6) return null
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return null
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function mix(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

function toRgb({ r, g, b }: { r: number; g: number; b: number }): string {
  return `rgb(${r} ${g} ${b})`
}

/**
 * Builds a soft studio background that follows the product color without overpowering UI.
 */
export function getConfiguratorTheme(accentHex?: string): ConfiguratorTheme {
  const fallback = { r: 200, g: 200, b: 204 }
  const accent = accentHex ? hexToRgb(accentHex) : null
  const base = accent ?? fallback

  const lum = (0.2126 * base.r + 0.7152 * base.g + 0.0722 * base.b) / 255
  // Dark swatches need more lift so the UI stays readable
  const lift = clamp(lum < 0.35 ? 0.78 : lum > 0.85 ? 0.35 : 0.52, 0.28, 0.82)

  const white = { r: 255, g: 255, b: 255 }
  const cool = { r: 228, g: 228, b: 232 }

  const top = mix(white, base, lift * 0.22)
  const mid = mix(cool, base, lift * 0.32)
  const bottom = mix({ r: 210, g: 210, b: 214 }, base, lift * 0.26)

  const gradient = `linear-gradient(165deg, ${toRgb(top)} 0%, ${toRgb(mid)} 48%, ${toRgb(bottom)} 100%)`

  const gridLine = lum < 0.42 ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.055)'

  const floorFrom = 'transparent'
  const floorTo = toRgb(mix({ r: 196, g: 196, b: 200 }, base, 0.38))
  const floorGradient = `linear-gradient(to bottom, ${floorFrom}, ${floorTo})`

  return { gradient, gridLine, floorGradient }
}
