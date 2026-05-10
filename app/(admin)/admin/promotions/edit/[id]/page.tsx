'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Edit3, Trash2, Copy } from 'lucide-react'
import { PromotionService, PromotionFormData } from '@/services/promotions'
import { Promotion } from '@/types/promotion'
import PromotionForm from '@/components/admin/promotions/promotion-form'

export default function EditPromotionPage() {
  const router = useRouter()
  const params = useParams()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Mock data - in real app, this would come from API
  const categories = [
    { id: '1', name: 'Fresh Produce' },
    { id: '2', name: 'Dairy & Eggs' },
    { id: '3', name: 'Meat & Poultry' },
    { id: '4', name: 'Bakery' },
    { id: '5', name: 'Beverages' },
    { id: '6', name: 'Snacks' }
  ]

  const products = [
    { id: '1', name: 'Fresh Milk 1L' },
    { id: '2', name: 'Whole Chicken' },
    { id: '3', name: 'Brown Bread' },
    { id: '4', name: 'Orange Juice 1L' },
    { id: '5', name: 'Eggs 30 Pack' },
    { id: '6', name: 'Greek Yogurt' }
  ]

  // Load promotion data
  useEffect(() => {
    const loadPromotion = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Get promotion by ID
        const promotionData = await PromotionService.getPromotionById(params.id as string)
        
        if (!promotionData) {
          setError('Promotion not found')
          return
        }
        
        setPromotion(promotionData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load promotion')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadPromotion()
    }
  }, [params.id])

  const handleSubmit = async (formData: PromotionFormData) => {
    if (!promotion) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update promotion
      await PromotionService.updatePromotion(promotion.id, formData)
      
      setSuccess(true)
      
      // Update local state
      setPromotion(prev => prev ? { ...prev, ...formData } : null)
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/promotions')
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update promotion')
      setSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/promotions')
  }

  const handleDelete = async () => {
    if (!promotion) return
    
    if (!confirm(`Are you sure you want to delete "${promotion.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await PromotionService.deletePromotion(promotion.id)
      router.push('/admin/promotions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promotion')
    }
  }

  const handleDuplicate = async () => {
    if (!promotion) return

    try {
      await PromotionService.duplicatePromotion(promotion.id)
      router.push('/admin/promotions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate promotion')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 h-96"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !promotion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/promotions')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Promotions
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Promotion Updated!</h2>
          <p className="text-gray-600 mb-6">
            Your promotion has been successfully updated.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to promotions list...
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Promotions
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Promotion</h1>
                <p className="text-sm text-gray-600">
                  {promotion ? `Editing: ${promotion.title}` : 'Loading...'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Action Buttons */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDuplicate}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                form="promotion-form"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Promotion
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 pt-4"
        >
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        </motion.div>
      )}

      {/* Form */}
      {promotion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="container mx-auto px-4 py-8"
        >
          <form id="promotion-form" onSubmit={(e) => e.preventDefault()}>
            <PromotionForm
              promotion={promotion}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              categories={categories}
              products={products}
            />
          </form>
        </motion.div>
      )}

      {/* Floating Action Button (Mobile) */}
      {promotion && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 lg:hidden"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            form="promotion-form"
            type="submit"
            disabled={isSubmitting}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
