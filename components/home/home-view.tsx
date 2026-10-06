import { getTranslations } from 'next-intl/server'
import { BathroomMap } from '@/components/home/bathroom-map'
import { BathroomMapBoundary } from '@/components/error-boundaries/bathroom-map-boundary'

export async function HomeView() {
  const hero = await getTranslations('home.hero')

  return (
    <BathroomMapBoundary>
      <header className="sr-only">
        <h1>ëkcos - {hero('title')}</h1>
        <p>
          {hero('tagline')}. {hero('body')}
        </p>
      </header>
      <BathroomMap />
    </BathroomMapBoundary>
  )
}
