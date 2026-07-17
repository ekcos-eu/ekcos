export type BathroomHotspot = {
  id: string
  slug: string
  /** Center X as % of scene width */
  x: number
  /** Center Y as % of scene height */
  y: number
  /** Hit area width as % of scene width */
  w?: number
  /** Hit area height as % of scene height */
  h?: number
}

/**
 * Hotspot positions for public/home/bathroom-map.jpg (2160×1080).
 * Centers sit on the physical product; hit areas are large enough for touch.
 */
export const bathroomHotspots: BathroomHotspot[] = [
  // Left urinal bowl — ëkcoscreen
  { id: 'ekcoscreen', slug: 'ekcoscreen', x: 17.2, y: 43.5, w: 7, h: 10 },
  // Left urinal drain — ëz trap
  { id: 'ez-trap', slug: 'ez-trap', x: 15.3, y: 52.6, w: 5, h: 6 },
  // Middle urinal — xcrën HD
  { id: 'xcren-hd', slug: 'xcren-hd', x: 38.1, y: 51.6, w: 7, h: 10 },
  // Right urinal of trio — powër screen
  { id: 'powerscreen', slug: 'powerscreen', x: 57.1, y: 51.9, w: 7, h: 10 },
  // Floor mats under middle + right urinals
  { id: 'ekco-mat', slug: 'ekco-mat', x: 47, y: 77.7, w: 22, h: 12 },
  // Wall hanger near toilet — frësh drop
  { id: 'fresh-drop', slug: 'fresh-drop', x: 90.6, y: 32.7, w: 4, h: 8 },
  // Toilet rim clip — ëkco clip
  { id: 'ekco-clip', slug: 'ekco-clip', x: 87.5, y: 72.1, w: 4, h: 6 },
]
