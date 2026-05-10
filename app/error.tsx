'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
    
    // You could integrate with error monitoring here
    // Sentry.captureException(error)
  }, [error])

  const isNetworkError = error.message.includes('fetch') || 
                         error.message.includes('network') ||
                         error.message.includes('connection')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {isNetworkError 
              ? "We're having trouble connecting to our servers"
              : "An unexpected error occurred"
            }
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {process.env.NODE_ENV === 'development' 
              ? error.message 
              : 'Please try again or contact support if the problem persists'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={reset} 
              className="flex-1"
              variant="primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="secondary" className="flex-1">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>
          
          <Button variant="ghost" className="flex items-center gap-2 mx-auto">
            <Mail className="w-4 h-4" />
            Contact Support
          </Button>
        </div>

        {isNetworkError && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Connection Tips:</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Check your internet connection</li>
              <li>• Refresh the page in a few moments</li>
              <li>• Try using a different browser</li>
              <li>• Clear your browser cache</li>
            </ul>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
            <p className="text-xs text-gray-600 font-mono">{error.digest}</p>
          </div>
        )}
      </div>
    </div>
  )
}
