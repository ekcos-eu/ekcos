'use client'

import React from 'react'

type BoundaryProps = {
  children: React.ReactNode
}

type BoundaryState = {
  hasError: boolean
}

class NewsletterBoundaryInner extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-black/[0.08] bg-white p-4">
          <p className="text-sm font-medium text-[#575756]">Newsletter form is temporarily unavailable.</p>
          <a
            href="mailto:info@ekcos.eu"
            className="mt-2 inline-block text-sm font-medium text-[#0F68B2] underline-offset-4 hover:underline"
          >
            Contact us instead
          </a>
        </div>
      )
    }

    return this.props.children
  }
}

export function NewsletterBoundary({ children }: BoundaryProps) {
  return <NewsletterBoundaryInner>{children}</NewsletterBoundaryInner>
}
