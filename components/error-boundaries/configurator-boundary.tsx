'use client'

import React from 'react'
import { Link } from '@/i18n/routing'

type BoundaryProps = {
  children: React.ReactNode
}

type BoundaryState = {
  hasError: boolean
}

class ConfiguratorBoundaryInner extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-black/[0.08] bg-white p-6 text-center sm:p-8">
          <p className="text-base font-semibold text-[#575756]">Configurator is temporarily unavailable.</p>
          <p className="mt-2 text-sm text-[#575756]/75">You can continue to products overview or contact us.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/products" className="font-medium text-[#0F68B2] underline-offset-4 hover:underline">
              Go to products
            </Link>
            <Link href="/contact" className="font-medium text-[#0F68B2] underline-offset-4 hover:underline">
              Contact us
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function ConfiguratorBoundary({ children }: BoundaryProps) {
  return <ConfiguratorBoundaryInner>{children}</ConfiguratorBoundaryInner>
}
