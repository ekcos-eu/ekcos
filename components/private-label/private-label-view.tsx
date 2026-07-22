import { FadeIn } from '@/components/ui/fade-in'
import { Button } from '@/components/ui/button'
import { PrivateLabelForm } from '@/components/private-label/private-label-form'
import { PrivateLabelFormBoundary } from '@/components/error-boundaries/private-label-form-boundary'
import { getPrivateLabelProducts } from '@/lib/private-label-products'
import { getTranslations } from 'next-intl/server'
import Script from 'next/script'
import { cn } from '@/lib/utils'

const wrap = 'mx-auto w-full max-w-[1100px] px-4 sm:px-6'
const card =
  'rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-7'
const cardAccent =
  'rounded-2xl border border-[#0F68B2]/22 bg-white p-6 sm:p-7'
const h2 =
  'text-[1.65rem] font-bold tracking-tight text-[#1a1a1a] text-balance sm:text-[1.75rem]'
const h3 = 'text-xl font-bold tracking-tight text-[#1a1a1a]'
const body = 'mt-3 text-base leading-relaxed text-[#2c2c2c] sm:text-[1.05rem] sm:leading-[1.65]'

export async function PrivateLabelView() {
  const t = await getTranslations('privateLabel')
  const products = getPrivateLabelProducts()

  const whyItems = [
    { title: t('why.items.0.title'), body: t('why.items.0.body') },
    { title: t('why.items.1.title'), body: t('why.items.1.body') },
    { title: t('why.items.2.title'), body: t('why.items.2.body') },
  ] as const

  const ways = [
    { title: t('ways.print.title'), body: t('ways.print.body') },
    { title: t('ways.cutout.title'), body: t('ways.cutout.body') },
  ] as const

  const beyond = [
    { title: t('beyond.packaging.title'), body: t('beyond.packaging.body') },
    { title: t('beyond.mix.title'), body: t('beyond.mix.body') },
  ] as const

  const goodToKnow = [
    t('goodToKnow.items.0'),
    t('goodToKnow.items.1'),
    t('goodToKnow.items.2'),
    t('goodToKnow.items.3'),
  ] as const

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('hero.title'),
    description: t('hero.lead'),
    about: ['private label', 'distributor branding', 'washroom products'],
  }

  return (
    <div className="overflow-x-hidden bg-white text-[#2c2c2c]">
      <section className="border-b border-black/[0.06] bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(15,104,178,0.14),transparent_55%),linear-gradient(180deg,#eef5fb_0%,#ffffff_78%)]">
        <div className={cn(wrap, 'py-16 text-center sm:py-20 lg:py-24')}>
          <FadeIn>
            <p className="text-[0.8rem] font-bold tracking-[0.14em] text-[#0F68B2] uppercase">
              {t('hero.eyebrow')}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1a1a1a] text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.12]">
              {t('hero.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-xl font-bold leading-snug text-[#0F68B2] text-balance sm:text-2xl">
              {t('hero.lead')}
            </p>
            <p className="mx-auto mt-6 max-w-3xl text-left text-base leading-relaxed text-[#2c2c2c] sm:text-lg sm:leading-[1.7]">
              {t('hero.body')}
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="rounded-none px-7">
                <a href="#inquiry">{t('hero.cta')}</a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <div className={wrap}>
          <FadeIn>
            <h2 className={h2}>{t('why.title')}</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              {whyItems.map((item) => (
                <article key={item.title} className={card}>
                  <h3 className={h3}>{item.title}</h3>
                  <p className={body}>{item.body}</p>
                </article>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-[#f5f8fb] py-14 sm:py-16 lg:py-20">
        <div className={wrap}>
          <FadeIn delay={0.04}>
            <h2 className={h2}>{t('ways.title')}</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {ways.map((item) => (
                <article key={item.title} className={cardAccent}>
                  <h3 className={h3}>{item.title}</h3>
                  <p className={body}>{item.body}</p>
                </article>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <div className={wrap}>
          <FadeIn delay={0.06}>
            <h2 className={h2}>{t('beyond.title')}</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {beyond.map((item) => (
                <article key={item.title} className={card}>
                  <h3 className={h3}>{item.title}</h3>
                  <p className={body}>{item.body}</p>
                </article>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-[#f5f8fb] py-14 sm:py-16 lg:py-20">
        <div className={wrap}>
          <FadeIn delay={0.08}>
            <h2 className={h2}>{t('goodToKnow.title')}</h2>
            <ul className="mt-6 max-w-3xl space-y-3">
              {goodToKnow.map((item) => (
                <li
                  key={item}
                  className="relative pl-5 text-base leading-relaxed text-[#2c2c2c] before:absolute before:top-[0.7em] before:left-0 before:size-1.5 before:rounded-full before:bg-[#0F68B2] sm:text-[1.05rem] sm:leading-[1.65]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      <section
        id="inquiry"
        className="scroll-mt-24 border-t border-black/[0.06] py-14 sm:py-16 lg:py-20"
      >
        <div className={cn(wrap, 'max-w-3xl')}>
          <FadeIn delay={0.1}>
            <h2 className="inline-block border-b-[3px] border-[#0F68B2] pb-2 text-[1.65rem] font-bold tracking-tight text-[#1a1a1a] text-balance sm:text-[1.75rem]">
              {t('form.title')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#2c2c2c] sm:text-lg sm:leading-[1.65]">
              {t('form.description')}
            </p>
            <div className="mt-8">
              <PrivateLabelFormBoundary fallbackMessage={t('form.boundaryError')}>
                <PrivateLabelForm products={products} />
              </PrivateLabelFormBoundary>
            </div>
          </FadeIn>
        </div>
      </section>

      <Script
        id="ldjson-private-label"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
    </div>
  )
}
