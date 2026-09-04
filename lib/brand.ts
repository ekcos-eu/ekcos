export const BRAND = {
  primary: '#0F68B2',
  secondaryText: '#575756',
  name: 'ëkcos',
  /** Canonical user-facing brand string. Never EcoOne / Eco One / Eco-One without ™. */
  ecoOne: 'Eco-One™',
} as const

function canonicalOrigin(value: string): string {
  try {
    const url = new URL(value)
    if (url.hostname === 'ekcos.eu') {
      url.hostname = 'www.ekcos.eu'
    }
    return url.origin
  } catch {
    return 'https://www.ekcos.eu'
  }
}

export const SITE_URL = canonicalOrigin(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ekcos.eu',
)
export const SHOP_BASE_URL = 'https://eshop.ekcos.eu'
