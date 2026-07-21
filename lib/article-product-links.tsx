import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import {ProductHoverLink} from '@/components/articles/product-hover-link'
import {SHOP_BASE_URL} from '@/lib/brand'
import {products} from '@/lib/products'
import {getConfiguratorThumbnailSrc} from '@/lib/product-variants'

type ProductLinkMatch = {
  pattern: RegExp
  shopPath: string
}

/** Display-name aliases (as they appear in article copy) → shop collection path */
const PRODUCT_NAME_ALIASES: ProductLinkMatch[] = [
  {pattern: /xcr[eë]n\s+HD/gi, shopPath: '/collections/xcren-hd'},
  {pattern: /xcr[eë]n\s+[Pp]uck/gi, shopPath: '/collections/xcren-puck'},
  {pattern: /[eë]kcoscreen/gi, shopPath: '/collections/ekcoscreen'},
  {pattern: /pow[eë]r\s+screen/gi, shopPath: '/collections/powerscreen'},
  {pattern: /basic\s+scr[eë]en/gi, shopPath: '/collections/basic-screen'},
  {pattern: /[uü]ro\s+lite/gi, shopPath: '/collections/uro-lite'},
  {pattern: /[eë]kco\s+clip/gi, shopPath: '/collections/ekco-clip'},
  {pattern: /fr[eë]sh\s+drop/gi, shopPath: '/collections/fresh-drop'},
  {pattern: /[eë]z\s+trap/gi, shopPath: '/collections/ez-trap'},
  {pattern: /[eë]kco\s+mat/gi, shopPath: '/collections/ekco-mat'},
]

const COMBINED_PATTERN = new RegExp(
  PRODUCT_NAME_ALIASES.map((entry) => `(?:${entry.pattern.source})`).join('|'),
  'gi',
)

function resolveProductLink(matched: string): {href: string; imageSrc: string} | null {
  for (const entry of PRODUCT_NAME_ALIASES) {
    const tester = new RegExp(entry.pattern.source, entry.pattern.flags)
    if (!tester.test(matched)) continue

    const product = products.find((item) => item.shopPath === entry.shopPath)
    if (!product) {
      return {href: `${SHOP_BASE_URL}${entry.shopPath}`, imageSrc: ''}
    }

    return {
      href: `${SHOP_BASE_URL}${entry.shopPath}`,
      imageSrc: getConfiguratorThumbnailSrc(product),
    }
  }

  return null
}

function linkifyText(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  const pattern = new RegExp(COMBINED_PATTERN.source, COMBINED_PATTERN.flags)

  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const matched = match[0]
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const link = resolveProductLink(matched)
    nodes.push(
      link?.imageSrc ? (
        <ProductHoverLink
          key={`product-${match.index}-${matched}`}
          href={link.href}
          imageSrc={link.imageSrc}
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

type ElementWithChildren = ReactElement<{children?: ReactNode}>

/** Walk Portable Text React children and wrap product names with eshop links. */
export function linkifyProductChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return linkifyText(child)
    }

    if (typeof child === 'number') {
      return child
    }

    if (!isValidElement(child)) {
      return child
    }

    const element = child as ElementWithChildren
    if (element.type === 'a' || element.type === ProductHoverLink) {
      return element
    }

    if (element.props.children == null) {
      return element
    }

    return cloneElement(element, {
      children: linkifyProductChildren(element.props.children),
    })
  })
}
