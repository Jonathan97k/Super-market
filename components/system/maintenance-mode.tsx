'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, Mail, Phone } from 'lucide-react'

interface MaintenanceModeProps {
  isEnabled?: boolean
  message?: string
  estimatedTime?: string
  contactInfo?: {
    email?: string
    phone?: string
  }
}

export default function MaintenanceMode({
  isEnabled = false,
  message = 'We are currently performing scheduled maintenance.',
  estimatedTime = '2 hours',
  contactInfo = {
    email: 'support@supermarket.com',
    phone: '+1 (555) 123-4567'
  }
}: MaintenanceModeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    setIsVisible(isEnabled)
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled) return

    // Calculate time remaining from estimatedTime
    const calculateTimeRemaining = () => {
      const [time, unit] = estimatedTime.split(' ')
      const now = new Date()
      const endTime = new Date(now.getTime() + (parseInt(time) * (unit.includes('hour') ? 3600000 : 60000)))
      
      const remaining = endTime.getTime() - now.getTime()
      if (remaining <= 0) {
        setTimeRemaining('Any moment now')
        return
      }

      const hours = Math.floor(remaining / 3600000)
      const minutes = Math.floor((remaining % 3600000) / 60000)
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isEnabled, estimatedTime])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Under Maintenance
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="bg-amber-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-amber-800">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Estimated time remaining: {timeRemaining}
            </span>
          </div>
        </div>
        
        <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Need help? Contact us:</h3>
          
          {contactInfo.email && (
            <div className="flex items-center space-x-3 text-gray-600">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:text-blue-800">
                {contactInfo.email}
              </a>
            </div>
          )}
          
          {contactInfo.phone && (
            <div className="flex items-center space-x-3 text-gray-600">
              <Phone className="w-4 h-4" />
              <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:text-blue-800">
                {contactInfo.phone}
              </a>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            We apologize for the inconvenience and appreciate your patience.
          </p>
        </div>
      </div>
    </div>
  )
}

export function MaintenanceBanner({
  isEnabled = false,
  message = 'Scheduled maintenance in progress.'
}: {
  isEnabled?: boolean
  message?: string
}) {
  if (!isEnabled) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white">
      <div className="px-4 py-3">
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}
