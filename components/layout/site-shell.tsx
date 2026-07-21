import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConditionalFooter } from '@/components/layout/conditional-footer'
import { NewsletterGate } from '@/components/newsletter/newsletter-gate'
import { ShellFrame } from '@/components/layout/shell-frame'

export async function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellFrame>
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      <ConditionalFooter>
        <SiteFooter />
      </ConditionalFooter>
      <NewsletterGate />
    </ShellFrame>
  )
}
