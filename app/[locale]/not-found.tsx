import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const t = await getTranslations('nav')

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-[#575756]">404</h1>
      <p className="text-sm text-[#575756]/75">This page could not be found.</p>
      <Button asChild>
        <Link href="/">{t('home.label')}</Link>
      </Button>
    </div>
  )
}
