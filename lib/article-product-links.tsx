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

const ECO_ONE_PATTERN = /Eco-One™/g

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
): { href: string; imageSrc: string; alt: string } | null {
  for (const entry of PRODUCT_NAME_ALIASES) {
    const tester = new RegExp(entry.pattern.source, entry.pattern.flags)
    if (!tester.test(matched)) continue

    const product = products.find((item) => item.shopPath === entry.shopPath)
    if (!product) {
      return { href: `${SHOP_BASE_URL}${entry.shopPath}`, imageSrc: '', alt: '' }
    }

    return {
      href: `${SHOP_BASE_URL}${entry.shopPath}`,
      imageSrc: getConfiguratorThumbnailSrc(product),
      alt: getImageAlt(entry.shopPath),
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
        >
          {matched}
        </ProductHoverLink>
      ) : link ? (
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
        ...linkifyProducts(text.slice(lastIndex, match.index), getImageAlt),
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
    nodes.push(...linkifyProducts(text.slice(lastIndex), getImageAlt))
  }

  return nodes.length > 0 ? nodes : [text]
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

/**
 * Link Eco-One™ → /eco-one and product names → eshop (with hover preview).
 * Use for plain marketing strings (FAQ, etc.).
 */
export function linkifyPlainText(
  text: string,
  getImageAlt: ProductImageAltLookup = () => '',
): ReactNode {
  return <>{linkifyText(text, getImageAlt)}</>
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
