'use client'

import { useState, useEffect } from 'react'
import { Loader2, ShoppingCart } from 'lucide-react'

interface GlobalLoaderProps {
  isLoading?: boolean
  message?: string
}

export default function GlobalLoader({ isLoading: externalLoading, message }: GlobalLoaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')

  useEffect(() => {
    if (externalLoading !== undefined) {
      setIsLoading(externalLoading)
    }
  }, [externalLoading])

  useEffect(() => {
    if (message) {
      setLoadingMessage(message)
    }
  }, [message])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {loadingMessage}
          </h3>
          
          <p className="text-sm text-gray-600 text-center mb-6">
            Please wait while we process your request
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" 
                 style={{ width: '60%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function useGlobalLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Loading...')

  const showLoader = (customMessage?: string) => {
    setMessage(customMessage || 'Loading...')
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
  }

  return {
    isLoading,
    message,
    showLoader,
    hideLoader
  }
}
