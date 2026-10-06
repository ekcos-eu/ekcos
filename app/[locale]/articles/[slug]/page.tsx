import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {ArrowLeft, ExternalLink} from 'lucide-react'
import {Link, routing} from '@/i18n/routing'
import {
  getArticleBySlug,
  getArticleSlugs,
  type ArticlesLocale,
} from '@/lib/articles'
import {SHOP_BASE_URL} from '@/lib/brand'
import {pageSeo} from '@/lib/seo'
import {ArticlePortableText} from '@/components/articles/portable-text'
import {Button} from '@/components/ui/button'
import {FadeIn} from '@/components/ui/fade-in'
import {PageContainer} from '@/components/layout/page-container'
import {PageHero} from '@/components/layout/page-hero'

type PageParams = Promise<{locale: string; slug: string}>

export async function generateStaticParams() {
  const slugs = await getArticleSlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({locale, slug})),
  )
}

export async function generateMetadata({
  params,
}: {
  params: PageParams
}): Promise<Metadata> {
  const {locale, slug} = await params
  const article = await getArticleBySlug(locale as ArticlesLocale, slug)

  if (!article) {
    return {title: 'Article'}
  }

  return pageSeo({
    locale,
    path: `/articles/${slug}`,
    title: article.title,
    description: article.excerpt ?? '',
    type: 'article',
  })
}

export default async function ArticlePage({params}: {params: PageParams}) {
  const {locale, slug} = await params
  const nav = await getTranslations({locale, namespace: 'nav'})
  const t = await getTranslations({locale, namespace: 'articles'})
  const article = await getArticleBySlug(locale as ArticlesLocale, slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="overflow-x-hidden bg-white">
      <PageHero>
        <FadeIn>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0F68B2] transition-colors hover:text-[#0F68B2]/80"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {nav('articles.label')}
          </Link>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#575756] text-balance sm:text-5xl">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="mt-5 text-xl font-bold leading-snug text-[#0F68B2] text-balance sm:text-2xl">
              {article.excerpt}
            </p>
          ) : null}
        </FadeIn>
      </PageHero>

      <PageContainer className="py-12 sm:py-16">
        <article>
          <FadeIn>
            <ArticlePortableText value={article.content} />
          </FadeIn>

          <FadeIn delay={0.1}>
            <section className="mt-12 rounded-2xl bg-[#0F68B2] px-6 py-10 text-white sm:mt-14 sm:px-10 sm:py-12">
              <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                {t('shopCta.title')}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/90 text-justify sm:text-lg">
                {t('shopCta.body')}
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="bg-white text-[#0F68B2] hover:bg-white/90">
                  <a href={SHOP_BASE_URL} target="_blank" rel="noopener noreferrer">
                    {t('shopCta.button')}
                    <ExternalLink className="size-4" aria-hidden />
                  </a>
                </Button>
              </div>
            </section>
          </FadeIn>
        </article>
      </PageContainer>
    </div>
  )
}
