import type {ReactNode} from 'react'
import Image from 'next/image'
import {getTranslations} from 'next-intl/server'
import {PortableText, type PortableTextComponents} from 'next-sanity'
import type {PortableTextBlock} from '@portabletext/types'
import {urlFor} from '@/sanity/lib/image'
import {
  linkifyProductChildren,
  type ProductImageAltLookup,
} from '@/lib/article-product-links'

function articlePortableTextComponents(
  getImageAlt: ProductImageAltLookup,
): PortableTextComponents {
  const linkify = (children: ReactNode) =>
    linkifyProductChildren(children, getImageAlt)

  return {
    block: {
      normal: ({children}) => (
        <p className="mt-4 text-base leading-relaxed text-[#575756]/90 text-justify first:mt-0">
          {linkify(children)}
        </p>
      ),
      h1: ({children}) => (
        <h2 className="mt-10 text-2xl font-bold tracking-tight text-[#575756] first:mt-0 sm:text-3xl">
          {linkify(children)}
        </h2>
      ),
      h2: ({children}) => (
        <h2 className="mt-10 text-xl font-bold tracking-tight text-[#0F68B2] first:mt-0 sm:text-2xl">
          {linkify(children)}
        </h2>
      ),
      h3: ({children}) => (
        <h3 className="mt-8 text-lg font-semibold tracking-tight text-[#0F68B2] first:mt-0">
          {linkify(children)}
        </h3>
      ),
      h4: ({children}) => (
        <h4 className="mt-6 text-base font-semibold text-[#575756] first:mt-0">
          {linkify(children)}
        </h4>
      ),
      blockquote: ({children}) => (
        <blockquote className="mt-6 border-l-4 border-[#0F68B2]/40 pl-4 text-[#575756]/85 italic">
          {linkify(children)}
        </blockquote>
      ),
    },
    list: {
      bullet: ({children}) => (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-[#575756]/90">
          {children}
        </ul>
      ),
      number: ({children}) => (
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-[#575756]/90">
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({children}) => <li className="pl-1">{linkify(children)}</li>,
      number: ({children}) => <li className="pl-1">{linkify(children)}</li>,
    },
    marks: {
      strong: ({children}) => (
        <strong className="font-semibold text-[#575756]">{children}</strong>
      ),
      em: ({children}) => <em className="italic">{children}</em>,
      link: ({children, value}) => {
        const href = typeof value?.href === 'string' ? value.href : '#'
        const external = href.startsWith('http')
        return (
          <a
            href={href}
            className="font-medium text-[#0F68B2] underline underline-offset-2 hover:text-[#0F68B2]/80"
            {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
          >
            {children}
          </a>
        )
      },
    },
    types: {
      image: ({value}) => {
        if (!value?.asset?._ref) return null
        const alt = typeof value.alt === 'string' ? value.alt : ''
        return (
          <figure className="relative mt-8 aspect-[16/10] overflow-hidden rounded-xl">
            <Image
              src={urlFor(value).width(1200).height(750).fit('crop').url()}
              alt={alt}
              fill
              className="object-cover"
            />
          </figure>
        )
      },
    },
  }
}

export async function ArticlePortableText({value}: {value: PortableTextBlock[]}) {
  const t = await getTranslations('products')
  const imageAlts: Record<string, string> = {
    '/collections/xcren-hd': t('xcrenHd.imageAlt'),
    '/collections/xcren-puck': t('xcrenPuck.imageAlt'),
    '/collections/ekcoscreen': t('ekcoscreen.imageAlt'),
    '/collections/powerscreen': t('powerscreen.imageAlt'),
    '/collections/basic-screen': t('basicScreen.imageAlt'),
    '/collections/uro-lite': t('urolite.imageAlt'),
    '/collections/ekco-clip': t('ekcoClip.imageAlt'),
    '/collections/fresh-drop': t('freshDrop.imageAlt'),
    '/collections/ez-trap': t('ezTrap.imageAlt'),
    '/collections/ekco-mat': t('ekcoMat.imageAlt'),
  }

  return (
    <PortableText
      value={value}
      components={articlePortableTextComponents((shopPath) => imageAlts[shopPath] ?? '')}
    />
  )
}
