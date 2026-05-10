import { useState, useEffect } from 'react'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async (filters?: any) => {
    setLoading(true)
    setError(null)
    
    try {
      // Mock API call - replace with actual Supabase query
      const mockProducts = [
        {
          id: '1',
          name: 'Organic Apples',
          description: 'Fresh organic apples from local farms',
          price: 4.99,
          category: 'Fresh Produce',
          stock: 150,
          images: ['/images/products/apples.jpg'],
          status: 'active',
          sku: 'ORG-APP-001',
          tags: ['organic', 'fresh', 'local'],
        },
        {
          id: '2',
          name: 'Fresh Milk',
          description: 'Whole milk from grass-fed cows',
          price: 3.49,
          category: 'Dairy & Eggs',
          stock: 89,
          images: ['/images/products/milk.jpg'],
          status: 'active',
          sku: 'DAI-MIL-001',
          tags: ['fresh', 'local', 'grass-fed'],
        },
      ]
      
      setProducts(mockProducts)
    } catch (err) {
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const getProductById = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Mock API call
      const product = products.find((p: any) => p.id === id)
      return product || null
    } catch (err) {
      setError('Failed to fetch product')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
  }
}
