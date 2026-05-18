'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-[#575756]">Something went wrong</h1>
      <p className="text-sm text-[#575756]/75">{error.message}</p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
