import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConditionalFooter } from '@/components/layout/conditional-footer'
import { NewsletterGate } from '@/components/newsletter/newsletter-gate'

export async function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <ConditionalFooter>
        <SiteFooter />
      </ConditionalFooter>
      <NewsletterGate />
    </div>
  )
}
