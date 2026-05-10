'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, Upload, Package } from 'lucide-react'
import { useAdminAuth } from '@/hooks/use-auth'
import ProductsTable from '@/components/admin/products/products-table'
import ProductFilters from '@/components/admin/products/product-filters'
import DeleteProductModal from '@/components/admin/products/delete-product-modal'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  oldPrice?: number
  category: string
  categoryId: string
  stock: number
  image: string
  featured: boolean
  newArrival: boolean
  onSale: boolean
  inStock: boolean
  createdAt: string
  updatedAt: string
}

interface Filters {
  search: string
  category: string
  featured: boolean | null
  onSale: boolean | null
  newArrival: boolean | null
  inStock: boolean | null
  sortBy: 'newest' | 'oldest' | 'highestPrice' | 'lowestPrice' | 'name'
}

export default function AdminProductsPage() {
  const { user, loading } = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    featured: null,
    onSale: null,
    newArrival: null,
    inStock: null,
    sortBy: 'newest'
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Generate mock products data
  const generateMockProducts = (): Product[] => {
    const categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Beverages', 'Snacks', 'Frozen']
    const productNames = [
      'Fresh Milk 1L', 'Bread Loaf', 'Eggs Dozen', 'Tomatoes 1kg', 'Chicken Breast 1kg',
      'Rice 5kg', 'Cooking Oil 1L', 'Sugar 1kg', 'Pasta 500g', 'Coffee 200g',
      'Orange Juice 1L', 'Yogurt 500g', 'Cheese 200g', 'Butter 250g', 'Apples 1kg',
      'Bananas 1kg', 'Potatoes 2kg', 'Onions 1kg', 'Carrots 1kg', 'Lettuce 1pc'
    ]

    return productNames.map((name, index) => ({
      id: `product-${index + 1}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: `High-quality ${name.toLowerCase()} for your daily needs. Fresh and carefully sourced.`,
      price: Math.round((1000 + Math.random() * 15000) * 100) / 100,
      oldPrice: Math.random() > 0.7 ? Math.round((1500 + Math.random() * 10000) * 100) / 100 : undefined,
      category: categories[index % categories.length],
      categoryId: `cat-${(index % categories.length) + 1}`,
      stock: Math.floor(Math.random() * 100),
      image: `/images/products/product-${index + 1}.jpg`,
      featured: Math.random() > 0.8,
      newArrival: Math.random() > 0.7,
      onSale: Math.random() > 0.6,
      inStock: Math.random() > 0.2,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }))
  }

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProducts = generateMockProducts()
      setProducts(mockProducts)
      setIsLoading(false)
    }

    if (!loading && user) {
      loadProducts()
    }
  }, [loading, user])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    // Boolean filters
    if (filters.featured !== null) {
      filtered = filtered.filter(product => product.featured === filters.featured)
    }
    if (filters.onSale !== null) {
      filtered = filtered.filter(product => product.onSale === filters.onSale)
    }
    if (filters.newArrival !== null) {
      filtered = filtered.filter(product => product.newArrival === filters.newArrival)
    }
    if (filters.inStock !== null) {
      filtered = filtered.filter(product => product.inStock === filters.inStock)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'highestPrice':
          return b.price - a.price
        case 'lowestPrice':
          return a.price - b.price
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, filters])

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
      setDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleBulkDelete = () => {
    setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)))
    setSelectedProducts([])
  }

  const handleBulkStockUpdate = (inStock: boolean) => {
    setProducts(prev => prev.map(p => 
      selectedProducts.includes(p.id) ? { ...p, inStock } : p
    ))
    setSelectedProducts([])
  }

  if (loading || isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">
            Manage your product catalog and inventory
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </motion.button>
          
          <motion.a
            href="/admin/products/new"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </motion.a>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.inStock).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">On Sale</p>
              <p className="text-2xl font-bold text-orange-600">
                {products.filter(p => p.onSale).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Featured</p>
              <p className="text-2xl font-bold text-purple-600">
                {products.filter(p => p.featured).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <ProductFilters
          filters={filters}
          onFiltersChange={setFilters}
          selectedCount={selectedProducts.length}
          onBulkDelete={handleBulkDelete}
          onBulkStockUpdate={handleBulkStockUpdate}
        />
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ProductsTable
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectionChange={setSelectedProducts}
          onEdit={(product) => window.location.href = `/admin/products/edit/${product.id}`}
          onDelete={handleDeleteProduct}
          onDuplicate={(product) => {
            const duplicated = {
              ...product,
              id: `product-${Date.now()}`,
              name: `${product.name} (Copy)`,
              slug: `${product.slug}-copy`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            setProducts(prev => [duplicated, ...prev])
          }}
        />
      </motion.div>

      {/* Delete Modal */}
      <DeleteProductModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setProductToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
      />
    </div>
  )
}
