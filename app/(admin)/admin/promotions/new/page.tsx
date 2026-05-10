'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import { PromotionService, PromotionFormData } from '@/services/promotions'
import PromotionForm from '@/components/admin/promotions/promotion-form'

export default function NewPromotionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (formData: PromotionFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create promotion
      const newPromotion = await PromotionService.createPromotion(formData)
      
      setSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/promotions')
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create promotion')
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/promotions')
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Promotion Created!</h2>
          <p className="text-gray-600 mb-6">
            Your promotion has been successfully created and is now live.
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Promotion</h1>
                <p className="text-sm text-gray-600">Set up a new marketing campaign</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              form="promotion-form"
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Promotion
                </>
              )}
            </motion.button>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="container mx-auto px-4 py-8"
      >
        <form id="promotion-form" onSubmit={(e) => e.preventDefault()}>
          <PromotionForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            categories={categories}
            products={products}
          />
        </form>
      </motion.div>

      {/* Floating Action Button (Mobile) */}
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
          disabled={isLoading}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-6 h-6" />
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}
