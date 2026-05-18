'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function ContactForm() {
  const t = useTranslations('contact.form')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    const form = e.currentTarget
    const payload = {
      name: String(new FormData(form).get('name') ?? ''),
      company: String(new FormData(form).get('company') ?? ''),
      email: String(new FormData(form).get('email') ?? ''),
      phone: String(new FormData(form).get('phone') ?? ''),
      message: String(new FormData(form).get('message') ?? ''),
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('bad status')
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <Label htmlFor="cf-name">{t('name')}</Label>
        <Input id="cf-name" name="name" required autoComplete="name" className="mt-1.5" />
      </div>
      <div className="sm:col-span-1">
        <Label htmlFor="cf-company">{t('company')}</Label>
        <Input id="cf-company" name="company" autoComplete="organization" className="mt-1.5" />
      </div>
      <div className="sm:col-span-1">
        <Label htmlFor="cf-email">{t('email')}</Label>
        <Input
          id="cf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5"
        />
      </div>
      <div className="sm:col-span-1">
        <Label htmlFor="cf-phone">{t('phone')}</Label>
        <Input id="cf-phone" name="phone" type="tel" autoComplete="tel" className="mt-1.5" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="cf-msg">{t('message')}</Label>
        <textarea
          id="cf-msg"
          name="message"
          required
          rows={5}
          className="mt-1.5 flex min-h-[120px] w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-[#575756] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F68B2]/40 focus-visible:ring-offset-2"
        />
      </div>
      <div className="sm:col-span-2 flex flex-col gap-2">
        <Button type="submit" disabled={status === 'loading'}>
          {t('submit')}
        </Button>
        {status === 'success' && (
          <p className="text-sm text-[#0F68B2]" role="status">
            {t('success')}
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-700" role="alert">
            {t('error')}
          </p>
        )}
      </div>
    </form>
  )
}
