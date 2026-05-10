'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/hooks/use-auth'
import ProductForm from '@/components/admin/products/product-form'

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: number
  oldPrice?: number
  category: string
  categoryId: string
  stock: number
  image: string | null
  featured: boolean
  newArrival: boolean
  onSale: boolean
  inStock: boolean
}

export default function EditProductPage() {
  const { user, loading } = useAdminAuth()
  const router = useRouter()
  const params = useParams()
  const [product, setProduct] = useState<ProductFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock product data for editing
  const generateMockProduct = (id: string): ProductFormData => {
    const categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Beverages', 'Snacks', 'Frozen']
    const categoryIndex = parseInt(id.replace('product-', '')) - 1 || 0
    
    return {
      name: `Product ${id}`,
      slug: `product-${id}`,
      description: `High-quality product for your daily needs. Fresh and carefully sourced.`,
      price: Math.round((1000 + Math.random() * 15000) * 100) / 100,
      oldPrice: Math.random() > 0.7 ? Math.round((1500 + Math.random() * 10000) * 100) / 100 : undefined,
      category: categories[categoryIndex % categories.length],
      categoryId: `cat-${(categoryIndex % categories.length) + 1}`,
      stock: Math.floor(Math.random() * 100),
      image: `/images/products/product-${id}.jpg`,
      featured: Math.random() > 0.8,
      newArrival: Math.random() > 0.7,
      onSale: Math.random() > 0.6,
      inStock: Math.random() > 0.2
    }
  }

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const productId = params.id as string
        const mockProduct = generateMockProduct(productId)
        setProduct(mockProduct)
      } catch (err) {
        setError('Failed to load product. Please try again.')
        console.error('Error loading product:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading && user && params.id) {
      loadProduct()
    }
  }, [loading, user, params.id])

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Simulate API call to update product
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real app, this would call your Supabase service
      console.log('Updating product:', data)

      // Show success message
      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/products')
      }, 2000)

    } catch (err) {
      setError('Failed to update product. Please try again.')
      console.error('Error updating product:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  if (loading || isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Product updated successfully!
              </p>
              <p className="text-sm text-green-700">
                Redirecting to products list...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </motion.div>
    </div>
  )
}
