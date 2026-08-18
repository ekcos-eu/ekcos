'use client'

import {Component, type ReactNode} from 'react'

type BoundaryProps = {
  children: ReactNode
}

type BoundaryState = {
  hasError: boolean
}

class HeroIntroVideoBoundaryInner extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = {hasError: false}

  static getDerivedStateFromError(): BoundaryState {
    return {hasError: true}
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

export function HeroIntroVideoBoundary({children}: BoundaryProps) {
  return <HeroIntroVideoBoundaryInner>{children}</HeroIntroVideoBoundaryInner>
}
