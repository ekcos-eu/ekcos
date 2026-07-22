'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallbackMessage: string
}

type State = {
  hasError: boolean
}

export class PrivateLabelFormBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[private-label-form]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {this.props.fallbackMessage}
        </p>
      )
    }

    return this.props.children
  }
}
