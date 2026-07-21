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
 * Hotspot positions for public/home/bathroom-map.jpg (2480×1804).
 * Centers sit on the physical product; hit areas are large enough for touch.
 */
export const bathroomHotspots: BathroomHotspot[] = [
  // Floating callout — xcrën PUCK
  { id: 'xcren-puck', slug: 'xcren-puck', x: 34.9, y: 12.8, w: 6, h: 8 },
  // Floating callout — üro lite
  { id: 'urolite', slug: 'urolite', x: 62.8, y: 13.2, w: 6, h: 8 },
  // Left urinal bowl — ëkcoscreen
  { id: 'ekcoscreen', slug: 'ekcoscreen', x: 17.2, y: 46.7, w: 7, h: 8 },
  // Left urinal drain — ëz trap
  { id: 'ez-trap', slug: 'ez-trap', x: 15.0, y: 60.0, w: 5, h: 5 },
  // Middle urinal — xcrën HD
  { id: 'xcren-hd', slug: 'xcren-hd', x: 36.8, y: 59.4, w: 7, h: 8 },
  // Right urinal of trio — powër screen
  { id: 'powerscreen', slug: 'powerscreen', x: 57.9, y: 59.8, w: 7, h: 8 },
  // Floor mats under middle + right urinals
  { id: 'ekco-mat', slug: 'ekco-mat', x: 46.0, y: 88.0, w: 24, h: 10 },
  // Wall hanger near toilet — frësh drop
  { id: 'fresh-drop', slug: 'fresh-drop', x: 91.3, y: 27.2, w: 4, h: 8 },
  // Toilet rim clip — ëkco clip
  { id: 'ekco-clip', slug: 'ekco-clip', x: 91.3, y: 74.9, w: 4, h: 6 },
]
