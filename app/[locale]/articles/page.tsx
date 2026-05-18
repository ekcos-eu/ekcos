import Image from 'next/image'
import type {Metadata} from 'next'
import {PortableText} from 'next-sanity'
import {getTranslations} from 'next-intl/server'
import {routing} from '@/i18n/routing'
import {getArticles, type ArticlesLocale} from '@/lib/articles'
import {urlFor} from '@/sanity/lib/image'
import { FadeIn } from '@/components/ui/fade-in'

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
  const articles = await getArticles(locale as ArticlesLocale)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#575756] sm:text-4xl">{nav('articles.label')}</h1>
      </FadeIn>

      <div className="mt-10 space-y-10">
        {articles.length ? (
          articles.map((article, i) => (
            <FadeIn key={article._id} delay={i * 0.1}>
              <article className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
                {article.coverImage?.asset?._ref ? (
                  <div className="relative mb-5 h-64 overflow-hidden rounded-xl">
                    <Image
                      src={urlFor(article.coverImage).width(1200).height(720).fit('crop').url()}
                      alt={article.coverImage.alt || article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <h2 className="text-2xl font-semibold text-[#575756]">{article.title}</h2>
                {article.excerpt ? <p className="mt-3 text-[#575756]/85">{article.excerpt}</p> : null}
                <div className="prose prose-slate mt-6 max-w-none">
                  <PortableText value={article.content} />
                </div>
              </article>
            </FadeIn>
          ))
        ) : (
          <FadeIn delay={0.1}>
            <p className="rounded-xl border border-dashed border-black/15 p-6 text-sm text-[#575756]/80">
              No posts yet. Add your first post in Sanity Studio.
            </p>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
