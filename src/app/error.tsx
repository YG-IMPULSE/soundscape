'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error('Application error:', error)
    
    // TODO: Send to error tracking service (Sentry, etc.)
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(error)
    // }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 rounded-lg text-left">
            <h2 className="font-semibold mb-2 text-red-400">Error Details:</h2>
            <p className="text-sm text-gray-300 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
          >
            Go Home
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          If this problem persists, please{' '}
          <a href="mailto:support@soundscape.com" className="text-cyan-500 hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
