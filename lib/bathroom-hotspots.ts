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
  // Floating product graphic — xcrën PUCK
  { id: 'xcren-puck', slug: 'xcren-puck', x: 39.4, y: 12.0, w: 5, h: 9 },
  // Floating product graphic — üro lite
  { id: 'urolite', slug: 'urolite', x: 58.5, y: 13.5, w: 5, h: 9 },
  // Left urinal bowl screen — ëkcoscreen
  { id: 'ekcoscreen', slug: 'ekcoscreen', x: 24.4, y: 53.7, w: 6, h: 9 },
  // Left urinal drain — ëz trap
  { id: 'ez-trap', slug: 'ez-trap', x: 25.0, y: 62.1, w: 5, h: 6 },
  // Middle urinal screen — xcrën HD
  { id: 'xcren-hd', slug: 'xcren-hd', x: 41.2, y: 60.1, w: 6, h: 9 },
  // Right urinal of trio — powër screen
  { id: 'powerscreen', slug: 'powerscreen', x: 55.5, y: 60.1, w: 6, h: 9 },
  // Floor mats under middle + right urinals
  { id: 'ekco-mat', slug: 'ekco-mat', x: 47.0, y: 91.0, w: 20, h: 10 },
  // Wall hanger near toilet — frësh drop
  { id: 'fresh-drop', slug: 'fresh-drop', x: 78.3, y: 26.9, w: 4, h: 8 },
  // Toilet rim clip — ëkco clip
  { id: 'ekco-clip', slug: 'ekco-clip', x: 78.4, y: 75.6, w: 4, h: 6 },
]
