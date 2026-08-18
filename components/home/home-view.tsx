import { getTranslations } from 'next-intl/server'
import { BathroomMap } from '@/components/home/bathroom-map'
import { BathroomMapBoundary } from '@/components/error-boundaries/bathroom-map-boundary'
import { HeroIntroVideo } from '@/components/layout/hero-intro-video'
import { HeroIntroVideoBoundary } from '@/components/error-boundaries/hero-intro-video-boundary'

export async function HomeView() {
  const common = await getTranslations('common')

  return (
    <>
      <HeroIntroVideoBoundary>
        <HeroIntroVideo scrollLabel={common('scrollDown')} targetId="washroom" />
      </HeroIntroVideoBoundary>
      <BathroomMapBoundary>
        <BathroomMap />
      </BathroomMapBoundary>
    </>
  )
}
