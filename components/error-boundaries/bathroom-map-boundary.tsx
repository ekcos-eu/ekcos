'use client'

import React from 'react'
import { SHOP_BASE_URL } from '@/lib/brand'

type BoundaryProps = {
  children: React.ReactNode
}

type BoundaryState = {
  hasError: boolean
}

class BathroomMapBoundaryInner extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center bg-[#e8ecef] px-6 text-center">
          <div>
            <p className="text-base font-semibold text-[#575756]">
              Interactive map is temporarily unavailable.
            </p>
            <p className="mt-2 text-sm text-[#575756]/75">
              You can visit the store or email us instead.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
              <a
                href={SHOP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0F68B2] underline-offset-4 hover:underline"
              >
                Go to shop
              </a>
              <a
                href="mailto:info@ekcos.eu"
                className="font-medium text-[#0F68B2] underline-offset-4 hover:underline"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function BathroomMapBoundary({ children }: BoundaryProps) {
  return <BathroomMapBoundaryInner>{children}</BathroomMapBoundaryInner>
}
