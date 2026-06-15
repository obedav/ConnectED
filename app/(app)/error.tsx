'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Something went wrong
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-gray-500">
          An unexpected error occurred. It's been logged — please try again, or
          refresh the page if the problem persists.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-gray-400">
            ID: {error.digest}
          </p>
        )}
      </div>

      <Button
        onClick={() => unstable_retry()}
        className="bg-[#9B5941] text-white hover:bg-[#7D4532] focus-visible:ring-[#9B5941]/40"
      >
        Try again
      </Button>
    </div>
  )
}
