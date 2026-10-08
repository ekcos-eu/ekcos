import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { ProductHoverLink } from '@/components/articles/product-hover-link'
import { Link } from '@/i18n/routing'
import { SHOP_BASE_URL } from '@/lib/brand'
import { products } from '@/lib/products'
import { getConfiguratorThumbnailSrc } from '@/lib/product-variants'

type ProductLinkMatch = {
  pattern: RegExp
  shopPath: string
}

export type ProductImageAltLookup = (shopPath: string) => string

const ECO_ONE_LINK_CLASS =
  'font-semibold text-[#0F68B2] underline underline-offset-2 transition-colors hover:text-[#0d5a9a]'

const EMAIL_LINK_CLASS =
  'font-semibold text-[#0F68B2] underline underline-offset-2 transition-colors hover:text-[#0d5a9a]'

const ECO_ONE_PATTERN = /Eco-One™/g

/** Localized “private label” phrases → /private-label (longest first). */
const PRIVATE_LABEL_PATTERN = new RegExp(
  [
    'zasebna blagovna znamka',
    'privatus prekės ženklas',
    'privātais zīmols',
    'privátní značka',
    'privátna značka',
    'marca do cliente',
    'marque blanche',
    'privatna marka',
    'частна марка',
    'marka własna',
    'marca blanca',
    'omamärgistus',
    'saját márka',
    'private label',
  ]
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'gi',
)

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

const PAGE_LINK_CLASS = ECO_ONE_LINK_CLASS

/** Shopify content pages mentioned in FAQ / marketing copy */
const PAGE_NAME_LINKS: { pattern: RegExp; href: string }[] = [
  {
    pattern:
      /Custom Branding(?:-sida|-side| -sivultamme| pagina| page)?|Branding personalizzato|branding personalizat/gi,
    href: `${SHOP_BASE_URL}/pages/custom-branding`,
  },
  {
    pattern: new RegExp(
      [
        'B2B és 0%-os áfával kapcsolatos útmutatónkban',
        'B2B- und 0%-Mehrwertsteuer-Leitfaden',
        'B2B & 0% ALV -oppaassamme',
        'B2B ja 0% käibemaksu juhendist',
        'Vodiču za B2B i 0% PDV-a',
        'ръководство за B2B и 0% ДДС',
        'Przewodniku B2B i 0% VAT',
        'B2B un 0% PVN ceļvedī',
        'B2B ir 0% PVM vadove',
        'Guide B2B et TVA 0%',
        'Guía B2B y 0% IVA',
        'Guida B2B e IVA 0%',
        'Guia B2B e 0% de IVA',
        'Ghidul nostru B2B și 0% TVA',
        'B2B & 0% VAT Guide',
        'B2B & 0% BTW Gids',
        'B2B & 0% momsguide',
        'B2B & 0% ΦΠΑ',
        'B2B & 0% DPH',
        'B2B a 0% DPH',
        'B2B i 0% PDV-a',
        'B2B și 0% TVA',
        'B2B и 0% ДДС',
        'B2B in 0 % DDV',
      ]
        .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
      'gi',
    ),
    href: `${SHOP_BASE_URL}/pages/b2b-vat-guide`,
  },
]

/** Display-name aliases (as they appear in article / FAQ copy) → shop collection path */
const PRODUCT_NAME_ALIASES: ProductLinkMatch[] = [
  { pattern: /xcr[eë]n\s+HD(?:\s*60\+)?/gi, shopPath: '/collections/xcren-hd' },
  { pattern: /xcr[eë]n\s+[Pp]uck/gi, shopPath: '/collections/xcren-puck' },
  { pattern: /[eë]kcoscreen(?:\s*60\+)?/gi, shopPath: '/collections/ekcoscreen' },
  { pattern: /pow[eë]r\s+screen/gi, shopPath: '/collections/powerscreen' },
  { pattern: /basic\s+scr[eë]en/gi, shopPath: '/collections/basic-screen' },
  { pattern: /[uü]ro\s+lite/gi, shopPath: '/collections/uro-lite' },
  { pattern: /[eë]kco\s+clip/gi, shopPath: '/collections/ekco-clip' },
  { pattern: /[eë]kco\s+loop/gi, shopPath: '/collections/ekco-clip' },
  { pattern: /fr[eë]sh\s+drop/gi, shopPath: '/collections/fresh-drop' },
  { pattern: /[eë]z\s+trap/gi, shopPath: '/collections/ez-trap' },
  { pattern: /[eë]kco\s+mat/gi, shopPath: '/collections/ekco-mat' },
]

const COMBINED_PATTERN = new RegExp(
  PRODUCT_NAME_ALIASES.map((entry) => `(?:${entry.pattern.source})`).join('|'),
  'gi',
)

function resolveProductLink(
  matched: string,
  getImageAlt: ProductImageAltLookup,
): { href: string; imageSrc: string; alt: string; external: boolean } | null {
  for (const entry of PRODUCT_NAME_ALIASES) {
    const tester = new RegExp(entry.pattern.source, entry.pattern.flags)
    if (!tester.test(matched)) continue

    const product = products.find((item) => item.shopPath === entry.shopPath)
    if (!product) {
      return {
        href: `${SHOP_BASE_URL}${entry.shopPath}`,
        imageSrc: '',
        alt: '',
        external: true,
      }
    }

    return {
      href: `/products/${product.slug}`,
      imageSrc: getConfiguratorThumbnailSrc(product),
      alt: getImageAlt(entry.shopPath),
      external: false,
    }
  }

  return null
}

function linkifyProducts(
  text: string,
  getImageAlt: ProductImageAltLookup,
): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  const pattern = new RegExp(COMBINED_PATTERN.source, COMBINED_PATTERN.flags)

  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const matched = match[0]
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const link = resolveProductLink(matched, getImageAlt)
    nodes.push(
      link?.imageSrc ? (
        <ProductHoverLink
          key={`product-${match.index}-${matched}`}
          href={link.href}
          imageSrc={link.imageSrc}
          alt={link.alt}
          external={link.external}
        >
          {matched}
        </ProductHoverLink>
      ) : link ? (
        link.external ? (
          <a
            key={`product-${match.index}-${matched}`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0F68B2] underline underline-offset-2 hover:text-[#0d5a9a]"
          >
            {matched}
          </a>
        ) : (
          <Link
            key={`product-${match.index}-${matched}`}
            href={link.href}
            className="font-semibold text-[#0F68B2] underline underline-offset-2 hover:text-[#0d5a9a]"
          >
            {matched}
          </Link>
        )
      ) : (
        matched
      ),
    )

    lastIndex = match.index + matched.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

function linkifyPages(
  text: string,
  getImageAlt: ProductImageAltLookup,
): ReactNode[] {
  type Hit = { start: number; end: number; href: string; label: string }
  const hits: Hit[] = []
  for (const entry of PAGE_NAME_LINKS) {
    const re = new RegExp(entry.pattern.source, entry.pattern.flags)
    for (const m of text.matchAll(re)) {
      if (m.index == null) continue
      hits.push({
        start: m.index,
        end: m.index + m[0].length,
        href: entry.href,
        label: m[0],
      })
    }
  }
  hits.sort((a, b) => a.start - b.start || b.end - a.end)

  if (hits.length === 0) return linkifyProducts(text, getImageAlt)

  const nodes: ReactNode[] = []
  let lastIndex = 0
  let cursor = 0
  for (const hit of hits) {
    if (hit.start < cursor) continue
    if (hit.start > lastIndex) {
      nodes.push(
        ...linkifyProducts(text.slice(lastIndex, hit.start), getImageAlt),
      )
    }
    nodes.push(
      <a
        key={`page-${hit.start}-${hit.label}`}
        href={hit.href}
        target="_blank"
        rel="noopener noreferrer"
        className={PAGE_LINK_CLASS}
      >
        {hit.label}
      </a>,
    )
    lastIndex = hit.end
    cursor = hit.end
  }
  if (lastIndex < text.length) {
    nodes.push(...linkifyProducts(text.slice(lastIndex), getImageAlt))
  }
  return nodes.length > 0 ? nodes : [text]
}

function linkifyEmails(
  text: string,
  getImageAlt: ProductImageAltLookup,
): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  const pattern = new RegExp(EMAIL_PATTERN.source, EMAIL_PATTERN.flags)

  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        ...linkifyPages(text.slice(lastIndex, match.index), getImageAlt),
      )
    }
    const email = match[0]
    nodes.push(
      <a
        key={`email-${match.index}-${email}`}
        href={`mailto:${email}`}
        className={EMAIL_LINK_CLASS}
      >
        {email}
      </a>,
    )
    lastIndex = match.index + email.length
  }

  if (lastIndex < text.length) {
    nodes.push(...linkifyPages(text.slice(lastIndex), getImageAlt))
  }

  return nodes.length > 0 ? nodes : [text]
}

function linkifyPrivateLabel(
  text: string,
  getImageAlt: ProductImageAltLookup,
): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  const pattern = new RegExp(
    PRIVATE_LABEL_PATTERN.source,
    PRIVATE_LABEL_PATTERN.flags,
  )

  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        ...linkifyEmails(text.slice(lastIndex, match.index), getImageAlt),
      )
    }
    nodes.push(
      <Link
        key={`private-label-${match.index}`}
        href="/private-label"
        className={ECO_ONE_LINK_CLASS}
      >
        {match[0]}
      </Link>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(...linkifyEmails(text.slice(lastIndex), getImageAlt))
  }

  return nodes.length > 0 ? nodes : [text]
}

function linkifyText(
  text: string,
  getImageAlt: ProductImageAltLookup,
): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  const ecoPattern = new RegExp(ECO_ONE_PATTERN.source, ECO_ONE_PATTERN.flags)

  let match: RegExpExecArray | null
  while ((match = ecoPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        ...linkifyPrivateLabel(text.slice(lastIndex, match.index), getImageAlt),
      )
    }
    nodes.push(
      <Link
        key={`eco-one-${match.index}`}
        href="/eco-one"
        className={ECO_ONE_LINK_CLASS}
      >
        {match[0]}
      </Link>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(...linkifyPrivateLabel(text.slice(lastIndex), getImageAlt))
  }

  return nodes.length > 0 ? nodes : [text]
}

/**
 * Link Eco-One™ → /eco-one, private label phrases → /private-label,
 * emails → mailto, FAQ page names → Shopify pages, and product names → eshop
 * (with hover preview).
 */
export function linkifyPlainText(
  text: string,
  getImageAlt: ProductImageAltLookup = () => '',
): ReactNode {
  return <>{linkifyText(text, getImageAlt)}</>
}

const PRODUCT_ALT_KEYS: Record<string, string> = {
  '/collections/xcren-hd': 'xcrenHd.imageAlt',
  '/collections/xcren-puck': 'xcrenPuck.imageAlt',
  '/collections/ekcoscreen': 'ekcoscreen.imageAlt',
  '/collections/powerscreen': 'powerscreen.imageAlt',
  '/collections/basic-screen': 'basicScreen.imageAlt',
  '/collections/uro-lite': 'urolite.imageAlt',
  '/collections/ekco-clip': 'ekcoClip.imageAlt',
  '/collections/fresh-drop': 'freshDrop.imageAlt',
  '/collections/ez-trap': 'ezTrap.imageAlt',
  '/collections/ekco-mat': 'ekcoMat.imageAlt',
}

/** Build alt lookup from next-intl `products` translator (`t('xcrenHd.imageAlt')`). */
export function createProductImageAltLookup(
  t: (key: string) => string,
): ProductImageAltLookup {
  const imageAlts: Record<string, string> = {}
  for (const [shopPath, key] of Object.entries(PRODUCT_ALT_KEYS)) {
    imageAlts[shopPath] = t(key)
  }
  return (shopPath) => imageAlts[shopPath] ?? ''
}

type ElementWithChildren = ReactElement<{ children?: ReactNode }>

/** Walk Portable Text React children and wrap product / Eco-One™ mentions. */
export function linkifyProductChildren(
  children: ReactNode,
  getImageAlt: ProductImageAltLookup,
): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return linkifyText(child, getImageAlt)
    }

    if (typeof child === 'number') {
      return child
    }

    if (!isValidElement(child)) {
      return child
    }

    const element = child as ElementWithChildren
    if (
      element.type === 'a' ||
      element.type === ProductHoverLink ||
      element.type === Link
    ) {
      return element
    }

    if (element.props.children == null) {
      return element
    }

    return cloneElement(element, {
      children: linkifyProductChildren(element.props.children, getImageAlt),
    })
  })
}
