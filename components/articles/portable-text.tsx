import Image from 'next/image'
import {PortableText, type PortableTextComponents} from 'next-sanity'
import type {PortableTextBlock} from '@portabletext/types'
import {urlFor} from '@/sanity/lib/image'
import {linkifyProductChildren} from '@/lib/article-product-links'

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => (
      <p className="mt-4 text-base leading-relaxed text-[#575756]/90 text-justify first:mt-0">
        {linkifyProductChildren(children)}
      </p>
    ),
    h1: ({children}) => (
      <h2 className="mt-10 text-2xl font-bold tracking-tight text-[#575756] first:mt-0 sm:text-3xl">
        {linkifyProductChildren(children)}
      </h2>
    ),
    h2: ({children}) => (
      <h2 className="mt-10 text-xl font-bold tracking-tight text-[#0F68B2] first:mt-0 sm:text-2xl">
        {linkifyProductChildren(children)}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="mt-8 text-lg font-semibold tracking-tight text-[#0F68B2] first:mt-0">
        {linkifyProductChildren(children)}
      </h3>
    ),
    h4: ({children}) => (
      <h4 className="mt-6 text-base font-semibold text-[#575756] first:mt-0">
        {linkifyProductChildren(children)}
      </h4>
    ),
    blockquote: ({children}) => (
      <blockquote className="mt-6 border-l-4 border-[#0F68B2]/40 pl-4 text-[#575756]/85 italic">
        {linkifyProductChildren(children)}
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
    bullet: ({children}) => <li className="pl-1">{linkifyProductChildren(children)}</li>,
    number: ({children}) => <li className="pl-1">{linkifyProductChildren(children)}</li>,
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

export function ArticlePortableText({value}: {value: PortableTextBlock[]}) {
  return <PortableText value={value} components={components} />
}
