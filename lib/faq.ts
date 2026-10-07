import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import type { AppLocale } from '@/i18n/locales'
import { defaultLocale } from '@/i18n/locales'

export type FaqAudience = 'distributors' | 'eshop'

export type FaqChartRow = {
  label: string
  value: number
  display: string
}

export type FaqChartBlock = {
  type: 'chart'
  variant: 'biodegradation'
  rows: FaqChartRow[]
  caption: string
}

export type FaqAnswerBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | FaqChartBlock

export type FaqItem = {
  id: string
  question: string
  answer: FaqAnswerBlock[]
}

export type FaqCategory = {
  id: string
  title: string
  items: FaqItem[]
}

export type FaqMetric = {
  value: string
  label: string
}

export type FaqContent = {
  hero: { title: string; tagline: string; intro: string }
  metrics: FaqMetric[]
  categories: FaqCategory[]
  contact: { title: string; body: string }
  footnote: string
}

const CONTENT_ROOT = join(process.cwd(), 'content/faq')

function readFaqFile(audience: FaqAudience, locale: string): FaqContent | null {
  const path = join(CONTENT_ROOT, audience, `${locale}.json`)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as FaqContent
  } catch {
    return null
  }
}

function itemCount(content: FaqContent): number {
  return content.categories.reduce((n, c) => n + c.items.length, 0)
}

export function getFaqContent(
  audience: FaqAudience,
  locale: string,
): FaqContent {
  const primary = readFaqFile(audience, locale)
  const expected = audience === 'distributors' ? 30 : 35
  if (primary && itemCount(primary) >= expected) return primary

  const fallback = readFaqFile(audience, defaultLocale)
  if (fallback) return fallback
  if (primary) return primary
  throw new Error(`FAQ content missing for ${audience}/${locale}`)
}

export function getFaqAudienceFromSlug(
  slug: string,
): FaqAudience | null {
  if (slug === 'distributors' || slug === 'eshop') return slug
  return null
}

export type FaqUiLocale = AppLocale
