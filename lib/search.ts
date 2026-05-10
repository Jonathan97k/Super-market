import { getPocketBaseClient } from './pocketbase/client'

export interface Product {
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
  images: string[]
  featured: boolean
  newArrival: boolean
  onSale: boolean
  inStock: boolean
  createdAt: string
  updatedAt: string
}

export interface SearchFilters {
  search: string
  category: string
  categoryId: string
  minPrice: number
  maxPrice: number
  inStock: boolean
  featured: boolean
  newArrival: boolean
  onSale: boolean
  sortBy: 'newest' | 'oldest' | 'price-low-high' | 'price-high-low' | 'popular' | 'featured'
  page: number
  limit: number
}

export interface SearchResult {
  products: Product[]
  totalCount: number
  hasMore: boolean
  currentPage: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  productCount: number
}

class SearchService {
  private pocketbase = getPocketBaseClient()
  private cache = new Map<string, { data: SearchResult; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Get cache key for search query
   */
  private getCacheKey(filters: Partial<SearchFilters>): string {
    return JSON.stringify(filters)
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout
  }

  /**
   * Get cached results
   */
  private getCachedResult(key: string): SearchResult | null {
    const cached = this.cache.get(key)
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data
    }
    return null
  }

  /**
   * Set cache results
   */
  private setCachedResult(key: string, data: SearchResult): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Build PocketBase query with filters
   */
  private buildQuery(filters: Partial<SearchFilters>) {
    let filter = ''

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filter = `(name ~ '${searchTerm}' || description ~ '${searchTerm}' || category ~ '${searchTerm}')`
    }

    // Category filter
    if (filters.categoryId) {
      filter = filter ? `${filter} && categoryId = '${filters.categoryId}'` : `categoryId = '${filters.categoryId}'`
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      filter = filter ? `${filter} && price >= ${filters.minPrice}` : `price >= ${filters.minPrice}`
    }
    if (filters.maxPrice !== undefined) {
      filter = filter ? `${filter} && price <= ${filters.maxPrice}` : `price <= ${filters.maxPrice}`
    }

    // Boolean filters
    if (filters.inStock !== undefined) {
      filter = filter ? `${filter} && inStock = ${filters.inStock}` : `inStock = ${filters.inStock}`
    }
    if (filters.featured !== undefined) {
      filter = filter ? `${filter} && featured = ${filters.featured}` : `featured = ${filters.featured}`
    }
    if (filters.newArrival !== undefined) {
      filter = filter ? `${filter} && newArrival = ${filters.newArrival}` : `newArrival = ${filters.newArrival}`
    }
    if (filters.onSale !== undefined) {
      filter = filter ? `${filter} && onSale = ${filters.onSale}` : `onSale = ${filters.onSale}`
    }

    return filter
  }

  /**
   * Apply sorting to query
   */
  private applySorting(sortBy: SearchFilters['sortBy']): string {
    switch (sortBy) {
      case 'newest':
        return '-created'
      case 'oldest':
        return 'created'
      case 'price-low-high':
        return 'price'
      case 'price-high-low':
        return '-price'
      case 'popular':
        return '-created' // Could be based on sales count
      case 'featured':
        return '-featured,-created'
      default:
        return '-created'
    }
  }

  /**
   * Search products with filters
   */
  async searchProducts(filters: Partial<SearchFilters>): Promise<SearchResult> {
    const cacheKey = this.getCacheKey(filters)
    const cached = this.getCachedResult(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const page = filters.page || 1
      const limit = filters.limit || 20
      const offset = (page - 1) * limit

      const filter = this.buildQuery(filters)
      const sort = this.applySorting(filters.sortBy || 'newest')

      const resultList = await this.pocketbase.collection('products').getList(page, limit, {
        filter: filter || undefined,
        sort: sort,
        skipTotal: false
      })

      const result: SearchResult = {
        products: resultList.items as Product[],
        totalCount: resultList.totalItems,
        hasMore: resultList.totalItems > offset + limit,
        currentPage: page
      }

      // Cache the result
      this.setCachedResult(cacheKey, result)

      return result
    } catch (error) {
      console.error('Search error:', error)
      return { products: [], totalCount: 0, hasMore: false, currentPage: page }
    }
  }

  /**
   * Get live search suggestions (limited results for dropdown)
   */
  async getLiveSearchSuggestions(query: string, limit: number = 8): Promise<Product[]> {
    if (!query || query.length < 2) {
      return []
    }

    try {
      const filter = `(name ~ '${query.toLowerCase()}' || category ~ '${query.toLowerCase()}') && inStock = true`
      const resultList = await this.pocketbase.collection('products').getList(1, limit, {
        filter: filter,
        sort: '-featured,name',
        fields: 'id,name,slug,price,oldPrice,category,stock,image,featured,inStock'
      })

      return resultList.items as Product[]
    } catch (error) {
      console.error('Live search error:', error)
      return []
    }
  }

  /**
   * Get all categories with product counts
   */
  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this.pocketbase.collection('categories').getFullList({
        sort: 'name'
      })

      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category: any) => {
          const products = await this.pocketbase.collection('products').getFullList({
            filter: `categoryId = '${category.id}'`,
            skipTotal: false
          })
          return {
            ...category,
            productCount: products.length
          }
        })
      )

      return categoriesWithCounts as Category[]
    } catch (error) {
      console.error('Categories error:', error)
      return []
    }
  }

  /**
   * Get popular search suggestions
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    // In a real implementation, this would be based on actual search analytics
    // For now, we'll return static popular searches
    return [
      'milk',
      'bread',
      'eggs',
      'chicken',
      'rice',
      'vegetables',
      'fruits',
      'dairy',
      'snacks',
      'beverages'
    ].slice(0, limit)
  }

  /**
   * Get price range for products
   */
  async getPriceRange(categoryId?: string): Promise<{ min: number; max: number }> {
    try {
      let filter = ''
      if (categoryId) {
        filter = `categoryId = '${categoryId}'`
      }

      const products = await this.pocketbase.collection('products').getFullList({
        filter: filter || undefined,
        fields: 'price'
      })

      const prices = products.map((p: any) => p.price)
      
      if (prices.length === 0) {
        return { min: 0, max: 100000 }
      }

      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    } catch (error) {
      console.error('Price range error:', error)
      return { min: 0, max: 100000 }
    }
  }

  /**
   * Get search suggestions based on partial input
   */
  async getSearchSuggestions(partial: string, limit: number = 5): Promise<string[]> {
    if (!partial || partial.length < 2) {
      return []
    }

    try {
      const filter = `name ~ '${partial}'`
      const resultList = await this.pocketbase.collection('products').getList(1, limit, {
        filter: filter,
        fields: 'name'
      })

      return resultList.items.map((p: any) => p.name)
    } catch (error) {
      console.error('Search suggestions error:', error)
      return []
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get search analytics (for future implementation)
   */
  async getSearchAnalytics(): Promise<{
    popularQueries: Array<{ query: string; count: number }>
    recentSearches: Array<{ query: string; timestamp: string }>
  }> {
    // Placeholder for future analytics implementation
    return {
      popularQueries: [],
      recentSearches: []
    }
  }

  /**
   * Record search query (for analytics)
   */
  async recordSearch(query: string, userId?: string): Promise<void> {
    // Placeholder for future analytics implementation
    console.log('Recording search:', query, userId)
  }
}

export const searchService = new SearchService()

/**
 * URL parameter utilities
 */
export class SearchUrlManager {
  /**
   * Parse URL parameters into search filters
   */
  static parseUrlParams(searchParams: URLSearchParams): Partial<SearchFilters> {
    const filters: Partial<SearchFilters> = {}

    if (searchParams.has('search')) {
      filters.search = searchParams.get('search')!
    }

    if (searchParams.has('category')) {
      filters.category = searchParams.get('category')!
    }

    if (searchParams.has('categoryId')) {
      filters.categoryId = searchParams.get('categoryId')!
    }

    if (searchParams.has('minPrice')) {
      filters.minPrice = parseFloat(searchParams.get('minPrice')!)
    }

    if (searchParams.has('maxPrice')) {
      filters.maxPrice = parseFloat(searchParams.get('maxPrice')!)
    }

    if (searchParams.has('inStock')) {
      filters.inStock = searchParams.get('inStock') === 'true'
    }

    if (searchParams.has('featured')) {
      filters.featured = searchParams.get('featured') === 'true'
    }

    if (searchParams.has('newArrival')) {
      filters.newArrival = searchParams.get('newArrival') === 'true'
    }

    if (searchParams.has('onSale')) {
      filters.onSale = searchParams.get('onSale') === 'true'
    }

    if (searchParams.has('sortBy')) {
      filters.sortBy = searchParams.get('sortBy') as SearchFilters['sortBy']
    }

    if (searchParams.has('page')) {
      filters.page = parseInt(searchParams.get('page')!)
    }

    if (searchParams.has('limit')) {
      filters.limit = parseInt(searchParams.get('limit')!)
    }

    return filters
  }

  /**
   * Convert search filters to URL parameters
   */
  static filtersToUrlParams(filters: Partial<SearchFilters>): URLSearchParams {
    const params = new URLSearchParams()

    if (filters.search) {
      params.set('search', filters.search)
    }

    if (filters.category) {
      params.set('category', filters.category)
    }

    if (filters.categoryId) {
      params.set('categoryId', filters.categoryId)
    }

    if (filters.minPrice !== undefined) {
      params.set('minPrice', filters.minPrice.toString())
    }

    if (filters.maxPrice !== undefined) {
      params.set('maxPrice', filters.maxPrice.toString())
    }

    if (filters.inStock) {
      params.set('inStock', 'true')
    }

    if (filters.featured) {
      params.set('featured', 'true')
    }

    if (filters.newArrival) {
      params.set('newArrival', 'true')
    }

    if (filters.onSale) {
      params.set('onSale', 'true')
    }

    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sortBy', filters.sortBy)
    }

    if (filters.page && filters.page !== 1) {
      params.set('page', filters.page.toString())
    }

    return params
  }

  /**
   * Get search URL from filters
   */
  static getSearchUrl(filters: Partial<SearchFilters>, basePath: string = '/products'): string {
    const params = this.filtersToUrlParams(filters)
    const paramString = params.toString()
    return paramString ? `${basePath}?${paramString}` : basePath
  }
}

/**
 * Search utilities
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (!originalPrice || originalPrice <= salePrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}
