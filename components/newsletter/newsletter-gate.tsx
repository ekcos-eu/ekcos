'use client'

import { NewsletterPopup, useNewsletterGate } from '@/components/newsletter/newsletter-popup'

export function NewsletterGate() {
  const { open, setOpen } = useNewsletterGate()
  return <NewsletterPopup open={open} onOpenChange={setOpen} />
}
