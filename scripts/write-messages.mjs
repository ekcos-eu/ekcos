import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const productBlock = (name, category, shortDesc, longDesc, benefits, useCases) => ({
  name,
  category,
  short: shortDesc,
  long: longDesc,
  benefits: { 0: benefits[0], 1: benefits[1], 2: benefits[2] },
  useCases: { 0: useCases[0], 1: useCases[1] },
})

const productsEn = {
  page: {
    title: 'Products',
    intro: 'Explore the range. Switch models, finishes, and options — then continue to the official store.',
  },
  configurator: {
    color: 'Finish',
    selectProduct: 'Select product',
    fragrance: 'Fragrance options',
    benefits: 'Benefits',
    useCases: 'Typical applications',
    brandingNote: 'Custom branding available for qualified orders.',
  },
  colors: {
    white: 'White',
    grey: 'Grey',
    black: 'Black',
    blue: 'Blue',
  },
  fragrances: {
    fresh: 'Fresh',
    citrus: 'Citrus',
  },
  xcrenHd: productBlock(
    'xcrën HD',
    'Premium urinal screen',
    'High-performance urinal screen engineered for consistent fragrance release and a clean appearance.',
    'xcrën HD combines refined industrial design with dependable performance in high-traffic washrooms. Pair with Eco-One™ for end-of-life options aligned with your sustainability goals.',
    [
      'Optimized geometry for splash control and airflow',
      'Consistent fragrance impression across the service window',
      'Designed for professional facility standards',
    ],
    ['Corporate offices', 'Hotels and hospitality'],
  ),
  ekcoscreen: productBlock(
    'ëkcoscreen',
    'Urinal screen',
    'Balanced performance for everyday commercial washrooms with reliable odor control.',
    'ëkcoscreen delivers a practical balance of cost and performance for facilities that need dependable hygiene support without compromise on presentation.',
    [
      'Reliable odor control for steady traffic',
      'Easy visual inspection for service teams',
      'Compatible with Eco-One™ where applicable',
    ],
    ['Retail', 'Public buildings'],
  ),
  powerscreen: productBlock(
    'powër screen',
    'Performance urinal screen',
    'Built for demanding environments where performance and presentation matter.',
    'powër screen is tuned for venues with high throughput, helping maintain a premium washroom experience with structured fragrance delivery.',
    [
      'Engineered for high-traffic intervals',
      'Strong presentation for premium facilities',
      'Pairs with Eco-One™ compatible materials',
    ],
    ['Stadiums', 'Transport hubs'],
  ),
  basicScreen: productBlock(
    'basic scrëen',
    'Essential urinal screen',
    'Straightforward protection and freshness for standard washroom programs.',
    'basic scrëen is the practical choice for programs that need dependable hygiene support with clear service expectations.',
    [
      'Simple deployment across large estates',
      'Predictable replacement cadence',
      'Eco-One™ compatible options',
    ],
    ['Schools', 'Light commercial'],
  ),
  urolite: productBlock(
    'üro lite',
    'Compact urinal screen',
    'Compact format with flexible finish options for modern fixtures.',
    'üro lite fits compact urinal geometries while maintaining ëkcos quality cues and service-friendly handling.',
    [
      'Compact geometry for modern bowls',
      'Multiple finish options',
      'Eco-One™ compatible',
    ],
    ['Boutique hospitality', 'Premium office'],
  ),
  ekcoClip: productBlock(
    'ëkco clip',
    'Clip fixture',
    'Secure mounting accessory designed for stable placement and clean lines.',
    'ëkco clip helps maintain consistent positioning where a clip-style fixture is part of your program.',
    [
      'Stable placement',
      'Clean integration with surrounding surfaces',
      'Designed for professional installation workflows',
    ],
    ['Facility retrofits', 'Specification-led projects'],
  ),
  freshDrop: productBlock(
    'frësh drop',
    'Freshness system',
    'Targeted freshness delivery with selectable fragrance directions.',
    'frësh drop is built for programs that want flexible fragrance storytelling while keeping operations simple.',
    [
      'Designed for controlled fragrance release',
      'Supports differentiated scent options',
      'Eco-One™ compatible materials',
    ],
    ['Hospitality', 'Premium retail'],
  ),
  ezTrap: productBlock(
    'ëz trap',
    'Drain protection',
    'Helps protect drains while supporting hygiene routines.',
    'ëz trap is designed for practical maintenance workflows and dependable performance in daily operations.',
    [
      'Supports maintenance-friendly routines',
      'Robust construction for daily use',
      'Eco-One™ compatible',
    ],
    ['Food service', 'Healthcare support areas'],
  ),
  xcrenPuck: productBlock(
    'xcrën puck',
    'Puck format',
    'Compact puck format for flexible placement strategies.',
    'xcrën puck offers an alternative footprint for programs that need flexible deployment while staying within the ëkcos system.',
    [
      'Compact footprint',
      'Flexible placement',
      'Consistent brand presentation',
    ],
    ['Compact washrooms', 'Retrofit programs'],
  ),
  ekcoMat: productBlock(
    'ëkco mat',
    'Floor mat',
    'Floor protection with a clean, professional look.',
    'ëkco mat supports facility hygiene zones with a product-focused approach to durability and presentation.',
    [
      'Durable surface for entry zones',
      'Professional appearance',
      'Eco-One™ compatible',
    ],
    ['Entrances', 'Service corridors'],
  ),
}

const baseEn = {
  Metadata: {
    title: 'ëkcos — Premium sanitary solutions',
    description:
      'ëkcos designs premium washroom solutions with Eco-One™ compatibility and custom branding for professional facilities.',
    productsTitle: 'Products',
    productsDescription: 'Explore ëkcos products: switch models, finishes, and options — then visit the official store.',
    ecoOneTitle: 'Eco-One™',
    ecoOneDescription: 'Learn how Eco-One™ supports responsible end-of-life outcomes for compatible materials.',
    brandingTitle: 'Custom Branding',
    brandingDescription: 'Private branding, cutouts, and printing for B2B programs.',
    contactTitle: 'Contact',
    contactDescription: 'Reach the ëkcos team for specifications, programs, and partnerships.',
  },
  LocaleSwitcher: {
    label: 'Language',
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    cs: 'Czech',
  },
  nav: {
    aria: 'Primary',
    logoAlt: 'ëkcos',
    openMenu: 'Open menu',
    mobileMenuTitle: 'Menu',
    home: { label: 'Home' },
    products: { label: 'Products' },
    ecoOne: { label: 'Eco-One™' },
    customBranding: { label: 'Custom Branding' },
    contact: { label: 'Contact' },
  },
  footer: {
    tagline: 'Premium sanitary innovation for professional facilities — engineered for performance, presentation, and responsible materials.',
    explore: 'Explore',
    newsletterTitle: 'Newsletter',
    newsletterHint: 'Product updates and program news. Unsubscribe anytime.',
    copyright: '© {year} ëkcos. All rights reserved.',
    legalNote: 'Informational site. Purchases are completed on the official store.',
  },
  common: {
    shopCta: 'Shop on ekcos.eu',
    learnMore: 'Learn more',
    getInTouch: 'Contact us',
    ecoOne: 'Eco-One™',
  },
  newsletter: {
    popupTitle: 'Stay informed',
    popupDescription: 'Occasional updates on products, Eco-One™, and custom branding programs.',
    emailLabel: 'Email',
    emailPlaceholder: 'you@company.com',
    submit: 'Subscribe',
    configureBrevo: 'Set NEXT_PUBLIC_BREVO_FORM_ACTION to your Brevo form URL to enable subscriptions.',
    dismiss: 'Not now',
  },
  home: {
    hero: {
      eyebrow: 'Premium sanitary innovation',
      title: 'Performance you can spec. Presentation guests remember.',
      subtitle:
        'Explore ëkcos urinal screens, accessories, and programs — engineered for professional washrooms, with Eco-One™ compatibility and custom branding options.',
      ctaProducts: 'View products',
      ctaEco: 'Discover Eco-One™',
      ctaShop: 'Go to store',
    },
    ecoTeaser: {
      title: 'Eco-One™: responsible end-of-life',
      body: 'Eco-One™ is an additive technology that helps compatible plastics biodegrade in biologically active environments — supporting programs that prioritize responsible materials.',
      link: 'How Eco-One™ works',
    },
    productsTeaser: {
      title: 'Explore the product system',
      body: 'Switch models, finishes, and options in the fullscreen configurator — built for fast comparison without leaving the page.',
      link: 'Open configurator',
    },
    brandingTeaser: {
      title: 'Custom Branding for B2B',
      body: 'Private labeling, cutouts, and printing options for rollouts that need a consistent brand story.',
      link: 'Custom Branding',
    },
    trust: {
      title: 'Built for demanding facilities',
      body: 'From corporate campuses to hospitality, ëkcos focuses on dependable hygiene performance and a premium on-site impression.',
    },
    newsletter: {
      title: 'Specifications, launches, and program updates',
      body: 'A short newsletter for facility teams and partners. No clutter.',
    },
    finalCta: {
      title: 'Ready to specify?',
      body: 'Visit the official store for availability, or contact us for B2B programs and custom branding.',
      shop: 'Shop ekcos.eu',
      contact: 'Contact',
    },
  },
  ecoOne: {
    hero: {
      title: 'Eco-One™',
      subtitle: 'A technology approach for compatible plastics — designed to support responsible end-of-life outcomes in biologically active environments.',
    },
    what: {
      title: 'What Eco-One™ is',
      body: 'Eco-One™ is an additive that can be incorporated into compatible plastic articles. The intent is to help plastic fragments become more amenable to biodegradation in environments where microbial activity is present — not a license to litter, and not a substitute for responsible waste management.',
    },
    how: {
      title: 'How it works (high level)',
      steps: {
        0: 'Compatible articles incorporate Eco-One™ within the polymer matrix.',
        1: 'Over time, in biologically active environments, the material can undergo biodegradation at accelerated rates compared to conventional counterparts — subject to article geometry and disposal conditions.',
        2: 'Claims and certifications vary by region and application; always validate for your program.',
      },
    },
    value: {
      title: 'Why teams ask for it',
      body: 'Facilities increasingly need a clear story on materials. Eco-One™ gives stakeholders a structured conversation about end-of-life behavior for compatible plastics — alongside reduce/reuse and recycling strategy.',
    },
    claims: {
      title: 'Claims and documentation',
      body: 'Environmental performance depends on product design, local regulation, and disposal pathways. Use official technical documentation for substantiation and keep claims precise.',
    },
    faq: {
      title: 'FAQ',
      q1: 'Is Eco-One™ a recycling replacement?',
      a1: 'No. It is one tool in a broader materials strategy. Recycling where feasible remains important.',
      q2: 'Does every ëkcos product include Eco-One™?',
      a2: 'Compatibility varies by SKU. Check product details and datasheets.',
      q3: 'Where can I learn more?',
      a3: 'Start with our products overview and contact us for program-specific documentation.',
    },
    cta: {
      products: 'Browse products',
      contact: 'Talk to the team',
    },
    reference: {
      linkLabel: 'Ecologic LLC — how Eco-One works',
      disclaimer:
        'External reference for educational context; always validate claims for your region and application.',
    },
  },
  customBranding: {
    hero: {
      title: 'Custom Branding',
      subtitle: 'Private labeling, cutouts, and printing — built for rollout consistency.',
    },
    intro:
      'ëkcos supports B2B programs that need a coherent brand presence across sites. We combine industrial product discipline with branding execution that stays true to your guidelines.',
    sections: {
      private: {
        title: 'Private branding',
        body: 'Program-level artwork handling and production discipline for repeatable results.',
      },
      cutouts: {
        title: 'Custom cutouts',
        body: 'Geometry options aligned to fixture realities and installation workflows.',
      },
      print: {
        title: 'Printing options',
        body: 'Premium printing approaches for durable on-product communication.',
      },
    },
    pricing: {
      title: 'Commercial terms',
      description:
        'Complete custom-branding terms from the current PDF, including entry fees, branding costs, and packaging label options.',
      entryFee: 'One-time entry fee',
      brandingCost: 'Branding cost',
      packagingLabels: 'Custom labels on packaging',
    },
    standardMoq: {
      title: 'MOQ for standard branding',
      description:
        'Minimum order quantities for standard branding programs with logo cut-outs or printing.',
      productLabel: 'Product',
      moqLabel: 'MOQ [pcs]',
      note: '* If you would like to order only the Fresh Drop bases, the MOQ is 288 pcs.',
    },
    customMix: {
      title: 'Custom color and fragrance mix',
      description:
        'We can produce a custom combination of fragrance and color from our range. Minimum order quantity corresponds to a full pallet of each customized product.',
      productLabel: 'Product',
      moqLabel: 'MOQ [pcs]',
      note: '* Basic Screen MOQ is for a half pallet.',
    },
    production: {
      title: 'Production, delivery time and payment',
    },
    process: {
      title: 'A simple process',
      steps: {
        0: 'Discovery: scope, volumes, timelines',
        1: 'Specification: artwork, materials, approval loops',
        2: 'Production: controlled manufacturing and QC',
        3: 'Delivery: logistics aligned to your rollout',
      },
    },
    inquiry: {
      title: 'Request information',
      hint: 'Tell us about volumes, regions, and branding requirements.',
    },
  },
  contact: {
    intro:
      'ëkcos partners with facility teams, distributors, and specifiers. For storefront purchases, visit the official shop. For programs, use the form below.',
    details: {
      title: 'Contact',
      email: 'Email',
      phone: 'Phone',
      hours: 'Hours',
      hoursValue: 'Monday–Friday, 09:00–17:00 CET',
    },
    form: {
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      submit: 'Send message',
      success: 'Thank you — we will get back to you shortly.',
      error: 'Something went wrong. Please try again.',
    },
  },
  products: productsEn,
}

fs.writeFileSync(path.join(root, 'dictionaries/en.json'), JSON.stringify(baseEn, null, 2), 'utf8')
console.log('Wrote dictionaries/en.json')
