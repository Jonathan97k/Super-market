'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, RefreshCw, Monitor, Smartphone, Tablet } from 'lucide-react'
import { PromotionFormData } from '@/services/promotions'

interface PromotionBannerPreviewProps {
  promotion: PromotionFormData
  className?: string
}

export default function PromotionBannerPreview({
  promotion,
  className = ''
}: PromotionBannerPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isLivePreview, setIsLivePreview] = useState(false)

  const getBackgroundTheme = (theme: string) => {
    switch (theme) {
      case 'navy':
        return 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900'
      case 'green':
        return 'bg-gradient-to-br from-green-600 via-green-500 to-green-600'
      case 'red':
        return 'bg-gradient-to-br from-red-600 via-red-500 to-red-600'
      case 'purple':
        return 'bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600'
      case 'gray':
        return 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800'
      case 'gradient':
        return 'bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500'
      default:
        return 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900'
    }
  }

  const getDeviceWidth = () => {
    switch (previewMode) {
      case 'desktop':
        return 'w-full'
      case 'tablet':
        return 'max-w-md'
      case 'mobile':
        return 'max-w-sm'
      default:
        return 'w-full'
    }
  }

  const renderHeroBanner = () => (
    <div className={`relative overflow-hidden rounded-xl ${getBackgroundTheme(promotion.backgroundTheme || 'navy')}`}>
      {/* Background Image */}
      {promotion.bannerImage && (
        <div className="absolute inset-0">
          <img
            src={promotion.bannerImage}
            alt={promotion.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Content */}
      <div className="relative px-8 py-12 md:px-12 md:py-16">
        <div className="max-w-3xl">
          {promotion.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-base text-white/90 mb-2"
            >
              {promotion.subtitle}
            </motion.p>
          )}
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            {promotion.title || 'Promotion Title'}
          </motion.h1>

          {promotion.discountPercentage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
            >
              <span className="text-2xl md:text-3xl font-bold text-white">
                {promotion.discountPercentage}% OFF
              </span>
            </motion.div>
          )}

          {promotion.buttonText && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {promotion.buttonText}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  )

  const renderFlashSale = () => (
    <div className={`relative overflow-hidden rounded-lg ${getBackgroundTheme('red')}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full"
            >
              <span className="text-sm font-bold text-white">FLASH SALE</span>
            </motion.div>
            
            <div>
              <p className="text-white font-semibold">
                {promotion.title || 'Flash Sale'}
              </p>
              {promotion.discountPercentage && (
                <p className="text-white/90 text-sm">
                  {promotion.discountPercentage}% OFF
                </p>
              )}
            </div>
          </div>

          {promotion.buttonText && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white text-red-600 font-semibold rounded-lg text-sm"
            >
              {promotion.buttonText}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )

  const renderCountdownOffer = () => (
    <div className={`relative overflow-hidden rounded-xl ${getBackgroundTheme(promotion.backgroundTheme || 'navy')}`}>
      <div className="px-6 py-8">
        <div className="text-center">
          {promotion.subtitle && (
            <p className="text-white/90 mb-2">{promotion.subtitle}</p>
          )}
          
          <h3 className="text-2xl font-bold text-white mb-4">
            {promotion.title || 'Limited Time Offer'}
          </h3>

          {promotion.discountPercentage && (
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                {promotion.discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Countdown Timer */}
          <div className="flex justify-center space-x-4 mb-6">
            {['Days', 'Hours', 'Mins', 'Secs'].map((label, index) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">00</span>
                </div>
                <p className="text-white/70 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {promotion.buttonText && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg"
            >
              {promotion.buttonText}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )

  const renderAnnouncementStrip = () => (
    <div className={`relative overflow-hidden rounded-lg ${getBackgroundTheme(promotion.backgroundTheme || 'navy')}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-white font-medium text-sm">
            {promotion.title || 'Announcement'}
          </span>
          {promotion.discountPercentage && (
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white">
              {promotion.discountPercentage}% OFF
            </span>
          )}
          {promotion.buttonText && (
            <button className="text-white underline text-sm hover:no-underline">
              {promotion.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderPreview = () => {
    switch (promotion.type) {
      case 'hero_banner':
        return renderHeroBanner()
      case 'flash_sale':
        return renderFlashSale()
      case 'countdown_offer':
        return renderCountdownOffer()
      case 'announcement_strip':
        return renderAnnouncementStrip()
      default:
        return renderHeroBanner()
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Preview Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          
          <div className="flex items-center space-x-2">
            {/* Device Selector */}
            <div className="flex items-center bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-1.5 rounded ${previewMode === 'tablet' ? 'bg-white shadow-sm' : ''}`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLivePreview(!isLivePreview)}
              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isLivePreview 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isLivePreview ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Static
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6 bg-gray-50">
        <div className={`mx-auto ${getDeviceWidth()} transition-all duration-300`}>
          {isLivePreview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderPreview()}
            </motion.div>
          ) : (
            <div className="opacity-75">
              {renderPreview()}
            </div>
          )}
        </div>
      </div>

      {/* Preview Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Type: {promotion.type?.replace('_', ' ') || 'hero_banner'}</span>
            <span>Theme: {promotion.backgroundTheme || 'navy'}</span>
            {promotion.discountPercentage && (
              <span>Discount: {promotion.discountPercentage}%</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLivePreview(!isLivePreview)}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Minimal preview for sidebar
 */
export function PromotionBannerPreviewMinimal({
  promotion,
  className = ''
}: PromotionBannerPreviewProps) {
  const getBackgroundTheme = (theme: string) => {
    switch (theme) {
      case 'navy':
        return 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900'
      case 'green':
        return 'bg-gradient-to-br from-green-600 via-green-500 to-green-600'
      case 'red':
        return 'bg-gradient-to-br from-red-600 via-red-500 to-red-600'
      case 'purple':
        return 'bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600'
      case 'gray':
        return 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800'
      case 'gradient':
        return 'bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500'
      default:
        return 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900'
    }
  }

  return (
    <div className={`rounded-lg overflow-hidden ${getBackgroundTheme(promotion.backgroundTheme || 'navy')} ${className}`}>
      <div className="p-4">
        <div className="text-center">
          <h4 className="text-lg font-bold text-white mb-2">
            {promotion.title || 'Promotion Title'}
          </h4>
          
          {promotion.discountPercentage && (
            <div className="mb-3">
              <span className="text-2xl font-bold text-white">
                {promotion.discountPercentage}% OFF
              </span>
            </div>
          )}

          {promotion.buttonText && (
            <button className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg text-sm">
              {promotion.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
