'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    updateOnlineStatus()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    
    // Simulate reconnection attempt
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check if we're back online
    setIsOnline(navigator.onLine)
    setIsRetrying(false)
  }

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">You're offline</p>
              <p className="text-xs opacity-90">Some features may not be available</p>
            </div>
          </div>
          
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span className="text-sm">{isRetrying ? 'Checking...' : 'Retry'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    </div>
  )
}
