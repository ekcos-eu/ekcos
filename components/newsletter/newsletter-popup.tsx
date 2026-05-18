'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BrevoNewsletterForm } from '@/components/newsletter/brevo-newsletter-form'

const STORAGE_KEY = 'ekcos-newsletter-dismissed-until'
const DELAY_MS = 9000

export function NewsletterPopup({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const t = useTranslations('newsletter')

  function handleOpenChange(next: boolean) {
    if (!next) {
      try {
        const until = Date.now() + 1000 * 60 * 60 * 24 * 7
        localStorage.setItem(STORAGE_KEY, String(until))
      } catch {
        /* ignore */
      }
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-black/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('popupTitle')}</DialogTitle>
          <DialogDescription>{t('popupDescription')}</DialogDescription>
        </DialogHeader>
        <BrevoNewsletterForm
          variant="popup"
          onSubmitted={() => {
            try {
              const until = Date.now() + 1000 * 60 * 60 * 24 * 30
              localStorage.setItem(STORAGE_KEY, String(until))
            } catch {
              /* ignore */
            }
            onOpenChange(false)
          }}
        />
        <button
          type="button"
          className="text-center text-xs text-[#575756]/70 underline-offset-2 hover:text-[#0F68B2] hover:underline"
          onClick={() => handleOpenChange(false)}
        >
          {t('dismiss')}
        </button>
      </DialogContent>
    </Dialog>
  )
}

export function useNewsletterGate() {
  const [open, setOpen] = React.useState(false)
  const fired = React.useRef(false)

  React.useEffect(() => {
    let cancelled = false

    function tryOpen() {
      if (cancelled || fired.current) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw && Number(raw) > Date.now()) return
      } catch {
        /* ignore */
      }
      fired.current = true
      setOpen(true)
    }

    const t = window.setTimeout(tryOpen, DELAY_MS)

    function onLeave(e: MouseEvent) {
      if (e.clientY > 0) return
      tryOpen()
    }

    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      cancelled = true
      window.clearTimeout(t)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return { open, setOpen }
}

export { STORAGE_KEY }
