import { getPocketBaseClient } from '@/lib/pocketbase/client'

// Client-side service layer for all CRUD operations
// This provides a clean API for the frontend to interact with PocketBase

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

export interface PaginationOptions {
  page?: number
  limit?: number
  orderBy?: string
  ascending?: boolean
}

export interface FilterOptions {
  category?: string
  status?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
}

class ClientService {
  protected pocketbase = getPocketBaseClient()

  // Helper method to handle PocketBase responses
  protected async handleResponse<T>(promise: Promise<any>): Promise<ServiceResponse<T>> {
    try {
      const data = await promise
      return {
        data: data || null,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  // PRODUCTS SERVICE
  async getProducts(options: PaginationOptions & FilterOptions = {}) {
    const {
      page = 1,
      limit = 20,
      orderBy = 'created',
      ascending = false,
      category,
      status = 'active',
      search,
      minPrice,
      maxPrice,
      inStock,
      featured
    } = options

    let filter = ''
    
    // Apply filters
    if (category) {
      filter = filter ? `${filter} && categories.slug = '${category}'` : `categories.slug = '${category}'`
    }

    if (status) {
      filter = filter ? `${filter} && status = '${status}'` : `status = '${status}'`
    }

    if (search) {
      filter = filter ? `${filter} && (name ~ '${search}' || description ~ '${search}')` : `(name ~ '${search}' || description ~ '${search}')`
    }

    if (minPrice !== undefined) {
      filter = filter ? `${filter} && price >= ${minPrice}` : `price >= ${minPrice}`
    }

    if (maxPrice !== undefined) {
      filter = filter ? `${filter} && price <= ${maxPrice}` : `price <= ${maxPrice}`
    }

    if (inStock) {
      filter = filter ? `${filter} && stock > 0` : `stock > 0`
    }

    if (featured !== undefined) {
      filter = filter ? `${filter} && featured = ${featured}` : `featured = ${featured}`
    }

    // Apply ordering and pagination
    const sort = ascending ? orderBy : `-${orderBy}`

    try {
      const resultList = await this.pocketbase.collection('products').getList(page, limit, {
        filter: filter || undefined,
        sort: sort
      })

      return {
        data: resultList,
        error: null,
        isLoading: false
      }
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      return {
        data: { items: [], totalItems: 0, totalPages: 0, page, perPage: limit },
        error: error?.message || 'Failed to fetch products',
        isLoading: false
      }
    }
  }

  async getProductBySlug(slug: string) {
    try {
      const product = await this.pocketbase.collection('products').getFirstListItem(`slug = '${slug}'`)
      return {
        data: product,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getProductById(id: string) {
    try {
      const product = await this.pocketbase.collection('products').getOne(id)
      return {
        data: product,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getFeaturedProducts(limit = 8) {
    try {
      const products = await this.pocketbase.collection('products').getList(1, limit, {
        filter: 'featured = true && status = "active"',
        sort: '-created'
      })
      return {
        data: products,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getRelatedProducts(productId: string, categoryId: string, limit = 4) {
    try {
      const products = await this.pocketbase.collection('products').getList(1, limit, {
        filter: `categoryId = '${categoryId}' && id != '${productId}' && status = "active"`,
        sort: '-created'
      })
      return {
        data: products,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  // CATEGORIES SERVICE
  async getCategories() {
    try {
      const categories = await this.pocketbase.collection('categories').getList(1, 100, {
        filter: 'is_active = true',
        sort: 'sort_order'
      })
      return {
        data: categories,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getCategoryBySlug(slug: string) {
    try {
      const category = await this.pocketbase.collection('categories').getFirstListItem(`slug = '${slug}' && is_active = true`)
      return {
        data: category,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getCategoryProducts(categorySlug: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20, orderBy = 'created', ascending = false } = options

    const sort = ascending ? orderBy : `-${orderBy}`

    try {
      const products = await this.pocketbase.collection('products').getList(page, limit, {
        filter: `categories.slug = '${categorySlug}' && status = "active"`,
        sort: sort
      })
      return {
        data: products,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  // PROMOTIONS SERVICE
  async getActivePromotions() {
    try {
      const now = new Date().toISOString()
      const promotions = await this.pocketbase.collection('promotions').getFullList({
        filter: `isActive = true && (start_date = null || start_date <= '${now}') && (end_date = null || end_date >= '${now}')`,
        sort: '-priority,-start_date'
      })
      return {
        data: promotions,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async validateCouponCode(code: string, cartTotal: number) {
    try {
      const now = new Date().toISOString()
      const coupon = await this.pocketbase.collection('coupon_codes').getFirstListItem(`code = '${code}' && isActive = true && (start_date = null || start_date <= '${now}') && (end_date = null || end_date >= '${now}') && min_order_amount <= ${cartTotal}`)
      return {
        data: coupon,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async createOrder(orderData: any) {
    try {
      const order = await this.pocketbase.collection('orders').create({
        ...orderData,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      })
      return {
        data: order,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async createOrderItems(orderItems: any[]) {
    try {
      const items = await Promise.all(
        orderItems.map(item => this.pocketbase.collection('order_items').create(item))
      )
      return {
        data: items,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getCustomerOrders(customerPhone: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 10, orderBy = 'created', ascending = false } = options
    const sort = ascending ? orderBy : `-${orderBy}`

    try {
      const orders = await this.pocketbase.collection('orders').getList(page, limit, {
        filter: `customer_phone = '${customerPhone}'`,
        sort: sort
      })
      return {
        data: orders,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getOrderById(orderId: string) {
    try {
      const order = await this.pocketbase.collection('orders').getOne(orderId)
      return {
        data: order,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  // SETTINGS SERVICE
  async getPublicSettings() {
    try {
      const settings = await this.pocketbase.collection('settings').getFirstListItem('id != ""')
      return {
        data: settings,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getThemeConfig() {
    try {
      const settings = await this.pocketbase.collection('settings').getFirstListItem('id != ""')
      return {
        data: settings,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getStoreLocations() {
    try {
      const locations = await this.pocketbase.collection('store_locations').getFullList({
        filter: 'is_active = true',
        sort: '-is_primary'
      })
      return {
        data: locations,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  // SEARCH SERVICE
  async searchProducts(query: string, options: PaginationOptions & FilterOptions = {}) {
    const {
      page = 1,
      limit = 20,
      orderBy = 'created',
      ascending = false,
      category,
      minPrice,
      maxPrice,
      inStock
    } = options

    let filter = `name ~ '${query}' || description ~ '${query}'`

    // Apply additional filters
    if (category) {
      filter = filter ? `${filter} && categories.slug = '${category}'` : `categories.slug = '${category}'`
    }

    if (minPrice !== undefined) {
      filter = filter ? `${filter} && price >= ${minPrice}` : `price >= ${minPrice}`
    }

    if (maxPrice !== undefined) {
      filter = filter ? `${filter} && price <= ${maxPrice}` : `price <= ${maxPrice}`
    }

    if (inStock) {
      filter = filter ? `${filter} && stock > 0` : `stock > 0`
    }

    // Apply ordering
    const sort = ascending ? orderBy : `-${orderBy}`

    try {
      const products = await this.pocketbase.collection('products').getList(page, limit, {
        filter: filter,
        sort: sort
      })
      return {
        data: products,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getSearchSuggestions(query: string, limit = 5) {
    try {
      const products = await this.pocketbase.collection('products').getList(1, limit, {
        filter: `status = "active" && (name ~ '${query}' || description ~ '${query}')`,
        sort: 'name'
      })
      return {
        data: products,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  // UTILITY METHODS
  async calculateDeliveryFee(cartTotal: number, deliveryAddress: string) {
    try {
      // For PocketBase, we'll need to implement this logic differently
      // For now, return a simple implementation
      const settings = await this.pocketbase.collection('settings').getFirstListItem('id != ""')
      const standardFee = settings?.standard_delivery_fee || 0
      const freeThreshold = settings?.free_shipping_threshold || 0
      const fee = cartTotal >= freeThreshold ? 0 : standardFee
      return {
        data: { fee },
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: { fee: 0 },
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async validateDeliveryArea(deliveryAddress: string) {
    try {
      const settings = await this.pocketbase.collection('settings').getFirstListItem('id != ""')
      const deliveryAreas = settings?.delivery_areas || []
      // Simple validation - check if address is in delivery areas
      const isValid = deliveryAreas.length > 0 // Simplified for now
      return {
        data: { isValid },
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: { isValid: false },
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getDatabaseHealth() {
    try {
      // Simple health check by trying to fetch a record
      await this.pocketbase.collection('products').getList(1, 1)
      return {
        data: { status: 'healthy' },
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: { status: 'unhealthy' },
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  // STORAGE SERVICE
  async getProductImageUrl(path: string) {
    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090'
      const publicUrl = `${pbUrl}/api/files/products/${path}`
      return {
        data: publicUrl,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getStoreAssetUrl(path: string) {
    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090'
      const publicUrl = `${pbUrl}/api/files/store-assets/${path}`
      return {
        data: publicUrl,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  // REALTIME SUBSCRIPTIONS
  subscribeToOrderUpdates(orderId: string, callback: (payload: any) => void) {
    // PocketBase realtime subscription
    this.pocketbase.collection('orders').subscribe('*', (data) => {
      if (data.record.id === orderId) {
        callback(data.record)
      }
    })
    return () => this.pocketbase.collection('orders').unsubscribe('*')
  }

  subscribeToProductUpdates(callback: (payload: any) => void) {
    // PocketBase realtime subscription
    this.pocketbase.collection('products').subscribe('*', (data) => {
      callback(data.record)
    })
    return () => this.pocketbase.collection('products').unsubscribe('*')
  }

  // AUTH HELPERS
  async getCurrentUser() {
    try {
      const authData = this.pocketbase.authStore
      return {
        data: authData.model,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async signOut() {
    try {
      this.pocketbase.authStore.clear()
      return {
        data: { success: true },
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }
}

// Export singleton instance
export const clientService = new ClientService()

// Export individual service classes for more specific use cases
export class ProductsService extends ClientService {
  async getNewArrivals(limit = 8) {
    try {
      const products = await this.pocketbase.collection('products').getList(1, limit, {
        filter: 'status = "active"',
        sort: '-created'
      })
      return {
        data: products,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getProductsOnSale(limit = 8) {
    try {
      const products = await this.pocketbase.collection('products').getList(1, limit, {
        filter: 'status = "active" && compare_price != null && compare_price > 0',
        sort: '-created'
      })
      return {
        data: products,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async getOutOfStockProducts() {
    try {
      const products = await this.pocketbase.collection('products').getFullList({
        filter: 'status = "active" && stock <= 0',
        sort: 'name'
      })
      return {
        data: products,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }
}

export class OrdersService extends ClientService {
  async trackOrder(orderId: string) {
    try {
      const history = await this.pocketbase.collection('order_status_history').getFullList({
        filter: `order_id = '${orderId}'`,
        sort: '-created'
      })
      return {
        data: history,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }

  async cancelOrder(orderId: string, reason?: string) {
    try {
      const order = await this.pocketbase.collection('orders').update(orderId, {
        status: 'cancelled',
        updated: new Date().toISOString()
      })
      return {
        data: order,
        error: null,
        isLoading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }
    }
  }
}

export class SettingsService extends ClientService {
  async getBusinessHours() {
    const response = await this.getPublicSettings()
    return {
      data: response.data?.business_hours || null,
      error: response.error,
      isLoading: response.isLoading
    }
  }

  async getDeliveryAreas() {
    const response = await this.getPublicSettings()
    return {
      data: response.data?.delivery_areas || [],
      error: response.error,
      isLoading: response.isLoading
    }
  }

  async getPaymentMethods() {
    const response = await this.getPublicSettings()
    return {
      data: response.data?.payment_methods || [],
      error: response.error,
      isLoading: response.isLoading
    }
  }
}

export default clientService
