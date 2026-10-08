import type {ReactNode} from 'react'
import Image from 'next/image'
import {getTranslations} from 'next-intl/server'
import {PortableText, type PortableTextComponents} from 'next-sanity'
import type {PortableTextBlock} from '@portabletext/types'
import {urlFor} from '@/sanity/lib/image'
import {
  createProductImageAltLookup,
  linkifyProductChildren,
  type ProductImageAltLookup,
} from '@/lib/article-product-links'
import {
  ADVISOR_SKIP_BLOCK_KEYS,
  isAdvisorArticle,
} from '@/lib/advisor-article'
import {
  COMPETITION_SKIP_BLOCK_KEYS,
  isCompetitionArticle,
} from '@/lib/competition-article'
import {
  AdvisorCompleteGrid,
  AdvisorDurationChart,
  AdvisorEcoOneCallout,
  AdvisorFiveSteps,
  AdvisorFragranceVisual,
  AdvisorInfoCallout,
  AdvisorSplashStats,
  AdvisorSummaryTable,
  AdvisorTrafficCards,
  AdvisorUrinalCards,
} from '@/components/articles/advisor-visuals'
import {
  CompetitionAdvantagesGrid,
  CompetitionCompareTable,
  CompetitionCtaBanner,
  CompetitionIntroCallout,
  CompetitionProofGrid,
  CompetitionStatsGrid,
} from '@/components/articles/competition-visuals'

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

function blockKey(block: PortableTextBlock): string | undefined {
  if (typeof block._key === 'string') return block._key
  return undefined
}

function isListItem(block: PortableTextBlock): boolean {
  return (
    block._type === 'block' &&
    'listItem' in block &&
    typeof (block as {listItem?: unknown}).listItem === 'string'
  )
}

async function AdvisorInjectedBody({
  value,
  components,
}: {
  value: PortableTextBlock[]
  components: PortableTextComponents
}) {
  const nodes: ReactNode[] = []
  let i = 0

  while (i < value.length) {
    const block = value[i]
    const key = blockKey(block)

    if (key && ADVISOR_SKIP_BLOCK_KEYS.has(key)) {
      if (key === 'p-splash-stats') {
        nodes.push(<AdvisorSplashStats key="viz-splash-stats" />)
      } else if (key === 'p-splash-uv') {
        nodes.push(<AdvisorInfoCallout key="viz-uv" kind="uv" />)
      } else if (key === 'p-splash-tip') {
        nodes.push(<AdvisorInfoCallout key="viz-tip" kind="tip" />)
      } else if (key === 'p-frag-strong') {
        nodes.push(<AdvisorFragranceVisual key="viz-fragrance" />)
      } else if (key === 'b-summary-1') {
        nodes.push(<AdvisorSummaryTable key="viz-summary" />)
      } else if (key === 'p-complete-clip') {
        nodes.push(<AdvisorCompleteGrid key="viz-complete" />)
      } else if (key === 'b-urinal-small') {
        nodes.push(<AdvisorUrinalCards key="viz-urinal" />)
      } else if (key === 'p-evidence-ask') {
        nodes.push(<AdvisorInfoCallout key="viz-ask" kind="ask" />)
      } else if (key === 'p-traffic-high') {
        nodes.push(<AdvisorTrafficCards key="viz-traffic" />)
      }
      i += 1
      continue
    }

    // Group consecutive list items so PortableText wraps them in <ul>/<ol>
    if (isListItem(block)) {
      const group: PortableTextBlock[] = [block]
      let j = i + 1
      while (j < value.length) {
        const next = value[j]
        const nextKey = blockKey(next)
        if (nextKey && ADVISOR_SKIP_BLOCK_KEYS.has(nextKey)) break
        if (!isListItem(next)) break
        group.push(next)
        j += 1
      }
      nodes.push(
        <PortableText
          key={key ?? `list-${i}`}
          value={group}
          components={components}
        />,
      )
      i = j
      continue
    }

    nodes.push(
      <PortableText
        key={key ?? `block-${i}`}
        value={[block]}
        components={components}
      />,
    )

    if (key === 'intro') {
      nodes.push(<AdvisorFiveSteps key="viz-steps" />)
    } else if (key === 'p-frag-long') {
      nodes.push(<AdvisorDurationChart key="viz-duration" />)
    } else if (key === 'p-evidence-bio') {
      nodes.push(<AdvisorEcoOneCallout key="viz-ecoone" />)
    }

    i += 1
  }

  return <div className="advisor-article-body">{nodes}</div>
}

function blockPlainText(block: PortableTextBlock): string {
  if (!Array.isArray(block.children)) return ''
  return block.children
    .map((child) =>
      child &&
      typeof child === 'object' &&
      'text' in child &&
      typeof child.text === 'string'
        ? child.text
        : '',
    )
    .join('')
}

async function CompetitionInjectedBody({
  value,
  components,
}: {
  value: PortableTextBlock[]
  components: PortableTextComponents
}) {
  const nodes: ReactNode[] = []
  let i = 0

  while (i < value.length) {
    const block = value[i]
    const key = blockKey(block)

    if (key && COMPETITION_SKIP_BLOCK_KEYS.has(key)) {
      if (key === 'stat-bio') {
        nodes.push(<CompetitionStatsGrid key="viz-stats" blocks={value} />)
      } else if (key === 'proof-test-title') {
        nodes.push(<CompetitionProofGrid key="viz-proof" blocks={value} />)
      } else if (key === 'f1-name') {
        nodes.push(<CompetitionCompareTable key="viz-compare" blocks={value} />)
      } else if (key === 'adv-material-h3') {
        nodes.push(
          <CompetitionAdvantagesGrid key="viz-advantages" blocks={value} />,
        )
      } else if (key === 'h2-cta') {
        nodes.push(<CompetitionCtaBanner key="viz-cta" blocks={value} />)
      }
      i += 1
      continue
    }

    if (key === 'intro') {
      nodes.push(
        <CompetitionIntroCallout
          key="viz-intro"
          text={blockPlainText(block)}
        />,
      )
      i += 1
      continue
    }

    if (isListItem(block)) {
      const group: PortableTextBlock[] = [block]
      let j = i + 1
      while (j < value.length) {
        const next = value[j]
        const nextKey = blockKey(next)
        if (nextKey && COMPETITION_SKIP_BLOCK_KEYS.has(nextKey)) break
        if (!isListItem(next)) break
        group.push(next)
        j += 1
      }
      nodes.push(
        <PortableText
          key={key ?? `list-${i}`}
          value={group}
          components={components}
        />,
      )
      i = j
      continue
    }

    nodes.push(
      <PortableText
        key={key ?? `block-${i}`}
        value={[block]}
        components={components}
      />,
    )
    i += 1
  }

  return <div className="competition-article-body">{nodes}</div>
}

export async function ArticlePortableText({
  value,
  slug,
  articleId,
}: {
  value: PortableTextBlock[]
  slug?: string
  articleId?: string
}) {
  const t = await getTranslations('products')
  const getImageAlt = createProductImageAltLookup((key) => t(key))
  const components = articlePortableTextComponents(getImageAlt)

  const blockKeys = value.map((block) =>
    typeof block._key === 'string' ? block._key : undefined,
  )

  if (isAdvisorArticle({id: articleId, slug, blockKeys})) {
    return <AdvisorInjectedBody value={value} components={components} />
  }

  if (isCompetitionArticle({id: articleId, slug, blockKeys})) {
    return <CompetitionInjectedBody value={value} components={components} />
  }

  return <PortableText value={value} components={components} />
}
