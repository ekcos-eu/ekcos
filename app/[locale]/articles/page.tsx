import Image from 'next/image'
import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'
import {ArrowRight} from 'lucide-react'
import {Link} from '@/i18n/routing'
import {pageSeo} from '@/lib/seo'
import {
  getArticles,
  type ArticleListItem,
  type ArticlesLocale,
} from '@/lib/articles'
import {urlFor} from '@/sanity/lib/image'
import {FadeIn} from '@/components/ui/fade-in'
import {PageHero} from '@/components/layout/page-hero'
import {PageContainer} from '@/components/layout/page-container'
import {cn} from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'Metadata'})

  return pageSeo({
    locale,
    path: '/articles',
    title: t('articlesTitle'),
    description: t('articlesDescription'),
  })
}

function formatArticleDate(locale: string, iso?: string): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function categoryLabel(
  t: Awaited<ReturnType<typeof getTranslations>>,
  category?: ArticleListItem['category'],
): string | null {
  if (!category) return null
  const key = `categories.${category}` as const
  return t.has(key) ? t(key) : null
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  const nav = await getTranslations({locale, namespace: 'nav'})
  const meta = await getTranslations({locale, namespace: 'Metadata'})
  const t = await getTranslations({locale, namespace: 'articles'})
  const articles = await getArticles(locale as ArticlesLocale)

  return (
    <div className="overflow-x-hidden bg-white">
      <PageHero>
        <FadeIn>
          <h1 className="text-4xl font-bold tracking-tight text-[#575756] text-balance sm:text-5xl">
            {nav('articles.label')}
          </h1>
          <p className="mt-5 text-xl font-bold leading-snug text-[#0F68B2] text-balance sm:text-2xl">
            {meta('articlesDescription')}
          </p>
        </FadeIn>
      </PageHero>

      <PageContainer className="py-12 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.length ? (
            articles.map((article, i) => {
              const slug = article.slug?.current
              if (!slug) return null

              const featured = i === 0
              const dateLabel = formatArticleDate(locale, article.publishedAt)
              const category = categoryLabel(t, article.category)

              return (
                <FadeIn
                  key={article._id}
                  delay={i * 0.08}
                  className={cn(featured && 'sm:col-span-2')}
                >
                  <Link
                    href={`/articles/${slug}`}
                    className={cn(
                      'group flex h-full overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F68B2]/40',
                      featured
                        ? 'flex-col sm:flex-row'
                        : 'flex-col',
                    )}
                  >
                    <div
                      className={cn(
                        'relative overflow-hidden bg-[#f3f6f8]',
                        featured
                          ? 'aspect-[16/10] sm:aspect-auto sm:w-[44%] sm:min-h-[16rem] sm:self-stretch'
                          : 'aspect-[16/10]',
                      )}
                    >
                      {article.coverImage?.asset?._ref ? (
                        <Image
                          src={urlFor(article.coverImage)
                            .width(featured ? 1000 : 800)
                            .height(featured ? 700 : 500)
                            .fit('crop')
                            .url()}
                          alt={article.coverImage.alt || article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes={
                            featured
                              ? '(max-width: 640px) 100vw, 44vw'
                              : '(max-width: 640px) 100vw, 50vw'
                          }
                          priority={featured}
                        />
                      ) : null}
                    </div>
                    <div
                      className={cn(
                        'flex flex-1 flex-col p-5 sm:p-6',
                        featured && 'sm:justify-center sm:p-8',
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        {category ? (
                          <span className="font-semibold tracking-wide text-[#0F68B2] uppercase">
                            {category}
                          </span>
                        ) : null}
                        {category && dateLabel ? (
                          <span className="text-[#575756]/35" aria-hidden>
                            ·
                          </span>
                        ) : null}
                        {dateLabel ? (
                          <time
                            dateTime={article.publishedAt}
                            className="text-[#575756]/70"
                          >
                            {dateLabel}
                          </time>
                        ) : null}
                      </div>
                      <h2
                        className={cn(
                          'mt-3 font-semibold tracking-tight text-[#575756] transition-colors group-hover:text-[#0F68B2] text-balance',
                          featured
                            ? 'text-2xl sm:text-3xl'
                            : 'text-lg sm:text-xl',
                        )}
                      >
                        {article.title}
                      </h2>
                      {article.excerpt ? (
                        <p
                          className={cn(
                            'mt-3 leading-relaxed text-[#575756]/80 text-pretty',
                            featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base',
                            !featured && 'line-clamp-3',
                          )}
                        >
                          {article.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F68B2]">
                        {t('readMore')}
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              )
            })
          ) : (
            <FadeIn delay={0.1} className="sm:col-span-2">
              <p className="rounded-xl border border-dashed border-black/15 p-6 text-sm text-[#575756]/80">
                {t('empty')}
              </p>
            </FadeIn>
          )}
        </div>
      </PageContainer>
    </div>
  )
}
