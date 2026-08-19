import { BathroomMap } from '@/components/home/bathroom-map'
import { BathroomMapBoundary } from '@/components/error-boundaries/bathroom-map-boundary'
import { HeroIntroVideo } from '@/components/layout/hero-intro-video'
import { HeroIntroVideoBoundary } from '@/components/error-boundaries/hero-intro-video-boundary'

export async function HomeView() {
  return (
    <>
      <BathroomMapBoundary>
        <BathroomMap />
      </BathroomMapBoundary>
      <HeroIntroVideoBoundary>
        <HeroIntroVideo />
      </HeroIntroVideoBoundary>
    </>
  )
}
