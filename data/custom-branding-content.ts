export type BrandingDetailItem = {
  title: string
  items: string[]
}

export type BrandingTableRow = {
  product: string
  moq: string
}

export const brandingPricingDetails: Record<
  'entryFee' | 'brandingCost' | 'packagingLabels',
  BrandingDetailItem
> = {
  entryFee: {
    title: 'One-time entry fee',
    items: [
      'Option A: Logo cut-out — one-time fee of 350 EUR per product (mold inserts cost).',
      'Option B: Print — one-time fee of 120 EUR per product (printing plates cost).',
    ],
  },
  brandingCost: {
    title: 'Branding cost',
    items: [
      'Option A: Logo cut-out is free of charge after paying the entry fee.',
      'Option B: Logo print is charged at +0.02 EUR per piece regardless of the first order quantity. Exception: Fresh Drop and EZ Trap are free of charge.',
    ],
  },
  packagingLabels: {
    title: 'Custom labels on packaging',
    items: [
      'Customization of standard labels on boxes and master cases in black and white print is free of charge.',
      'Color labels are charged at +0.02 EUR per product piece.',
      'Additional labels on each non-standard cellophane product bag: black and white +0.02 EUR per bag, color +0.06 EUR per bag.',
      'Labels can include your logo, address, product descriptions, product names, EAN codes, and related data.',
    ],
  },
}

export const standardBrandingMoqRows: BrandingTableRow[] = [
  { product: 'Xcreen HD', moq: '576' },
  { product: 'Ekcoscreen', moq: '576' },
  { product: 'Powerscreen', moq: '1080' },
  { product: 'Basic Screen', moq: '1080' },
  { product: 'Urolite', moq: '1080' },
  { product: 'Ekcoclip', moq: '1080' },
  { product: 'Fresh Drop Locks', moq: 'Bases: 144 + Inserts: 288 = 480' },
  { product: 'EZ Trap', moq: '30' },
  { product: 'Xcreen Puck', moq: '720' },
  { product: 'Fresh Drop*', moq: '288 bases only' },
]

export const customMixMoqRows: BrandingTableRow[] = [
  { product: 'Xcreen HD', moq: '3600' },
  { product: 'Ekcoscreen', moq: '3600' },
  { product: 'Powerscreen', moq: '4320' },
  { product: 'Basic Screen*', moq: '6480' },
  { product: 'Urolite', moq: '6912' },
  { product: 'Ekcoclip', moq: '4320' },
  { product: 'Fresh Drop Inserts', moq: '2592' },
  { product: 'Xcreen Puck', moq: '2592' },
]

export const productionTerms = [
  'Production takes place in Mexico, and products are delivered to the European hub in the Czech Republic.',
  'Typical production and delivery time is 6 to 10 weeks.',
  'All customized products must be paid 100% in advance.',
]
