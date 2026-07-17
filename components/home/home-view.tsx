import { BathroomMap } from '@/components/home/bathroom-map'
import { BathroomMapBoundary } from '@/components/error-boundaries/bathroom-map-boundary'

export async function HomeView() {
  return (
    <BathroomMapBoundary>
      <BathroomMap />
    </BathroomMapBoundary>
  )
}
