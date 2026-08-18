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
export const desktopBathroomHotspots: BathroomHotspot[] = [
  {id: 'xcren-puck', slug: 'xcren-puck', x: 39.4, y: 12.0, w: 5, h: 9},
  {id: 'urolite', slug: 'urolite', x: 58.5, y: 13.5, w: 5, h: 9},
  {id: 'ekcoscreen', slug: 'ekcoscreen', x: 24.4, y: 53.7, w: 6, h: 9},
  {id: 'ez-trap', slug: 'ez-trap', x: 25.0, y: 62.1, w: 5, h: 6},
  {id: 'xcren-hd', slug: 'xcren-hd', x: 41.2, y: 60.1, w: 6, h: 9},
  {id: 'powerscreen', slug: 'powerscreen', x: 55.5, y: 60.1, w: 6, h: 9},
  {id: 'ekco-mat', slug: 'ekco-mat', x: 47.0, y: 91.0, w: 20, h: 10},
  {id: 'fresh-drop', slug: 'fresh-drop', x: 78.3, y: 26.9, w: 4, h: 8},
  {id: 'ekco-clip', slug: 'ekco-clip', x: 78.4, y: 75.6, w: 4, h: 6},
]

/**
 * Hotspot positions for public/home/bathroom-map-mobile.jpg (700×1024).
 * Portrait layout: toilet left, urinal + stacked product shots right.
 */
export const mobileBathroomHotspots: BathroomHotspot[] = [
  {id: 'fresh-drop', slug: 'fresh-drop', x: 14, y: 18, w: 14, h: 8},
  {id: 'urolite', slug: 'urolite', x: 84, y: 9, w: 16, h: 8},
  {id: 'powerscreen', slug: 'powerscreen', x: 84, y: 21, w: 16, h: 8},
  {id: 'xcren-hd', slug: 'xcren-hd', x: 85, y: 39, w: 16, h: 8},
  {id: 'ekcoscreen', slug: 'ekcoscreen', x: 84, y: 52, w: 16, h: 8},
  {id: 'ez-trap', slug: 'ez-trap', x: 80, y: 64, w: 14, h: 7},
  {id: 'ekco-clip', slug: 'ekco-clip', x: 27, y: 63, w: 14, h: 7},
  {id: 'ekco-mat', slug: 'ekco-mat', x: 76, y: 91, w: 24, h: 9},
]
