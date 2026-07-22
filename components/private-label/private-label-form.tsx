'use client'

import * as React from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PrivateLabelProductOption } from '@/lib/private-label-products'
import { cn } from '@/lib/utils'

type Props = {
  products: PrivateLabelProductOption[]
}

export function PrivateLabelForm({ products }: Props) {
  const t = useTranslations('privateLabel.form')
  const tRoot = useTranslations()
  const locale = useLocale()

  const [quantities, setQuantities] = React.useState<Record<string, string>>({})
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const productsRef = React.useRef<HTMLDivElement>(null)

  function setQuantity(slug: string, value: string) {
    setQuantities((prev) => ({ ...prev, [slug]: value }))
  }

  function buildProductLines() {
    const lines: string[] = []
    let total = 0

    for (const product of products) {
      const raw = quantities[product.slug]?.trim() ?? ''
      if (!raw) continue
      const qty = Number.parseInt(raw, 10)
      if (!Number.isFinite(qty) || qty <= 0) continue
      const name = tRoot(product.nameKey)
      lines.push(`${name}: ${qty} pcs`)
      total += qty
    }

    return { lines, total }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const { lines, total } = buildProductLines()

    if (lines.length === 0) {
      setErrorMessage(t('alertSelect'))
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/private-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(formData.get('name') ?? '').trim(),
          company: String(formData.get('company') ?? '').trim(),
          email: String(formData.get('email') ?? '').trim(),
          phone: String(formData.get('phone') ?? '').trim(),
          message: String(formData.get('message') ?? '').trim(),
          website: String(formData.get('website') ?? '').trim(),
          products: lines.join('; '),
          quantity: String(total),
          locale,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? 'Request failed')
      }

      form.reset()
      setQuantities({})
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage(t('error'))
    }
  }

  if (status === 'success') {
    return (
      <p
        className="rounded-lg border border-[#0F68B2]/25 bg-[#0F68B2]/[0.07] px-5 py-4 text-base text-[#0F68B2]"
        role="status"
      >
        {t('success')}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pl-name">{t('name')}</Label>
          <Input id="pl-name" name="name" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pl-company">{t('company')}</Label>
          <Input
            id="pl-company"
            name="company"
            autoComplete="organization"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pl-email">{t('email')}</Label>
          <Input
            id="pl-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pl-phone">{t('phone')}</Label>
          <Input id="pl-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>

      {/* Honeypot */}
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="pl-website">Website</label>
        <input id="pl-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-3" ref={productsRef}>
        <div>
          <p className="text-sm font-medium text-[#575756]">{t('products')}</p>
          <p className="mt-1 text-sm text-[#575756]/75">{t('productsHint')}</p>
        </div>

        <div className="divide-y divide-[#e5e5e5] overflow-hidden rounded-2xl border border-[#e5e5e5]">
          {products.map((product) => {
            const qty = quantities[product.slug] ?? ''
            const active = Number.parseInt(qty, 10) > 0
            return (
              <div
                key={product.slug}
                className={cn(
                  'flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between',
                  active && 'bg-[#0F68B2]/[0.04]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={product.imageSrc}
                    alt={tRoot(product.nameKey)}
                    width={56}
                    height={56}
                    className="size-14 object-contain"
                  />
                  <span className="text-sm font-medium text-[#575756]">
                    {tRoot(product.nameKey)}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:w-44">
                  <Label
                    htmlFor={`pl-qty-${product.slug}`}
                    className="shrink-0 text-xs text-[#575756]/70"
                  >
                    {t('quantity')}
                  </Label>
                  <Input
                    id={`pl-qty-${product.slug}`}
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    placeholder="0"
                    value={qty}
                    onChange={(event) => setQuantity(product.slug, event.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pl-message">{t('message')}</Label>
        <textarea
          id="pl-message"
          name="message"
          required
          rows={5}
          className={cn(
            'flex min-h-[8rem] w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-[#575756] shadow-sm transition-colors',
            'placeholder:text-[#575756]/60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F68B2]/40 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
      </div>

      {(status === 'error' || errorMessage) && (
        <p className="text-sm text-amber-800" role="alert">
          {errorMessage ?? t('error')}
        </p>
      )}

      <Button type="submit" size="lg" className="rounded-none" disabled={status === 'submitting'}>
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
