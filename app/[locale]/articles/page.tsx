import Image from 'next/image'
import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'
import {Link, routing} from '@/i18n/routing'
import {getArticles, type ArticlesLocale} from '@/lib/articles'
import {urlFor} from '@/sanity/lib/image'
import {FadeIn} from '@/components/ui/fade-in'
import {PageHero} from '@/components/layout/page-hero'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'Metadata'})

  return {
    title: t('articlesTitle'),
    description: t('articlesDescription'),
    alternates: {
      canonical: `/${locale}/articles`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/articles`])),
    },
  }
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  const nav = await getTranslations({locale, namespace: 'nav'})
  const meta = await getTranslations({locale, namespace: 'Metadata'})
  const articles = await getArticles(locale as ArticlesLocale)

  return (
    <div className="overflow-x-hidden bg-white">
      <PageHero size="lg">
        <FadeIn className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-[#575756] text-balance sm:text-5xl">
            {nav('articles.label')}
          </h1>
          <p className="mt-5 text-xl font-medium leading-snug text-[#0F68B2] text-balance sm:text-2xl">
            {meta('articlesDescription')}
          </p>
        </FadeIn>
      </PageHero>

      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.length ? (
            articles.map((article, i) => {
              const slug = article.slug?.current
              if (!slug) return null

              return (
                <FadeIn key={article._id} delay={i * 0.08}>
                  <Link
                    href={`/articles/${slug}`}
                    className="group block overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F68B2]/40"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#f3f6f8]">
                      {article.coverImage?.asset?._ref ? (
                        <Image
                          src={urlFor(article.coverImage).width(800).height(500).fit('crop').url()}
                          alt={article.coverImage.alt || article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      ) : null}
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-semibold tracking-tight text-[#575756] transition-colors group-hover:text-[#0F68B2] sm:text-xl">
                        {article.title}
                      </h2>
                    </div>
                  </Link>
                </FadeIn>
              )
            })
          ) : (
            <FadeIn delay={0.1} className="sm:col-span-2">
              <p className="rounded-xl border border-dashed border-black/15 p-6 text-sm text-[#575756]/80">
                No posts yet. Add your first post in Sanity Studio.
              </p>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  )
}
