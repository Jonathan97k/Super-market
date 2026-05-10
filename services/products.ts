import { getPocketBaseClient } from '@/lib/pocketbase/client'
import { Product } from '@/types/product'
import { validateProduct } from '@/lib/validations'
import { getMockProducts, mockProducts } from '@/lib/mock-data'

export class ProductService {
  static async getProducts(filters?: {
    category?: string
    status?: string
    minPrice?: number
    maxPrice?: number
    search?: string
  }): Promise<Product[]> {
    const pb = getPocketBaseClient()
    let filter = ''
    
    if (filters?.category) {
      filter = filter ? `${filter} && category = '${filters.category.replace(/'/g, "\\'")}'` : `category = '${filters.category.replace(/'/g, "\\'")}'`
    }

    if (filters?.status) {
      filter = filter ? `${filter} && status = '${filters.status.replace(/'/g, "\\'")}'` : `status = '${filters.status.replace(/'/g, "\\'")}'`
    }

    if (filters?.minPrice) {
      filter = filter ? `${filter} && price >= ${Number(filters.minPrice)}` : `price >= ${Number(filters.minPrice)}`
    }

    if (filters?.maxPrice) {
      filter = filter ? `${filter} && price <= ${Number(filters.maxPrice)}` : `price <= ${Number(filters.maxPrice)}`
    }

    if (filters?.search) {
      filter = filter ? `${filter} && name ~ '${filters.search.replace(/'/g, "\\'")}'` : `name ~ '${filters.search.replace(/'/g, "\\'")}'`
    }
    
    try {
      const products = await pb.collection('products').getFullList({
        filter: filter || undefined,
        sort: '-created'
      })

      const valid = products.filter(validateProduct) as Product[]
      if (valid.length === 0) {
        return getMockProducts({ category: filters?.category, search: filters?.search })
      }
      return valid
    } catch (error) {
      console.error('Failed to fetch products from PocketBase, using mock data:', error)
      return getMockProducts({ category: filters?.category, search: filters?.search })
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    const pb = getPocketBaseClient()
    try {
      const product = await pb.collection('products').getOne(id)
      if (!validateProduct(product)) {
        throw new Error('Invalid product data received from server')
      }
      return product as Product
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid product data received from server') {
        throw error
      }
      console.error('Failed to fetch product by id from PocketBase, using mock data:', error)
      return mockProducts.find(p => p.id === id) || null
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const pb = getPocketBaseClient()
    const data = await pb.collection('products').create({
      ...product,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    })
    return data as Product
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const pb = getPocketBaseClient()
    const data = await pb.collection('products').update(id, {
      ...updates,
      updated: new Date().toISOString(),
    })
    return data as Product
  }

  static async deleteProduct(id: string): Promise<void> {
    const pb = getPocketBaseClient()
    await pb.collection('products').delete(id)
  }
}
