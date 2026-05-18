'use client'

import * as React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  variant: 'footer' | 'popup'
  onSubmitted?: () => void
}

export function BrevoNewsletterForm({ variant, onSubmitted }: Props) {
  const t = useTranslations('newsletter')
  const locale = useLocale()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showError, setShowError] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowError(false)
    setIsSubmitting(true)
    const form = event.currentTarget

    const formData = new FormData(form)
    const emailRaw = formData.get('EMAIL')
    const email = typeof emailRaw === 'string' ? emailRaw.trim() : ''

    if (!email) {
      setShowError(true)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, locale }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; detail?: string; code?: string }
          | null
        console.error('Newsletter subscription failed', payload)
        throw new Error('Newsletter subscription failed')
      }

      onSubmitted?.()
      form.reset()
    } catch {
      setShowError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        variant === 'popup'
          ? 'flex flex-col gap-3 sm:flex-row sm:items-start'
          : 'flex flex-col gap-2 sm:flex-row sm:items-start'
      }
    >
      <label className="sr-only" htmlFor={`nl-email-${variant}`}>
        {t('emailLabel')}
      </label>
      <Input
        id={`nl-email-${variant}`}
        name="EMAIL"
        type="email"
        required
        autoComplete="email"
        placeholder={t('emailPlaceholder')}
        className={variant === 'footer' ? 'sm:max-w-xs' : 'min-w-0 flex-1'}
      />
      <Button type="submit" className="shrink-0" disabled={isSubmitting}>
        {isSubmitting ? `${t('submit')}...` : t('submit')}
      </Button>
      {showError && <p className="text-xs text-amber-800 sm:w-full">{t('submitError')}</p>}
    </form>
  )
}
