import { getPocketBaseClient } from '@/lib/pocketbase/client'

export interface AnalyticsData {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topProducts: ProductAnalytics[]
  salesByCategory: CategoryAnalytics[]
  salesByMonth: MonthlyAnalytics[]
  customerMetrics: CustomerMetrics
  orderStatusBreakdown: OrderStatusMetrics
  promotionMetrics: PromotionAnalytics[]
  lowStockAlerts: LowStockAlert[]
  realtimeActivity: RealtimeActivity[]
}

export interface ProductAnalytics {
  productId: string
  productName: string
  productImage?: string
  views: number
  orders: number
  revenue: number
  quantity: number
  stock: number
  category: string
}

export interface CategoryAnalytics {
  category: string
  categoryId: string
  revenue: number
  quantity: number
  orders: number
  growth: number
}

export interface MonthlyAnalytics {
  month: string
  revenue: number
  orders: number
  customers: number
  growth: number
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  averageOrderValue: number
  repeatPurchaseRate: number
  popularShoppingTimes: ShoppingTime[]
}

export interface ShoppingTime {
  hour: number
  day: string
  orders: number
  revenue: number
}

export interface OrderStatusMetrics {
  pending: number
  completed: number
  cancelled: number
  refunded: number
}

export interface PromotionAnalytics {
  promotionId: string
  title: string
  type: string
  clicks: number
  conversions: number
  conversionRate: number
  revenue: number
}

export interface LowStockAlert {
  productId: string
  productName: string
  productImage?: string
  currentStock: number
  minStock: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  lastRestock?: string
}

export interface RealtimeActivity {
  id: string
  type: 'order' | 'customer' | 'product_view' | 'promotion_click'
  timestamp: string
  data: any
  description: string
}

export interface DateRange {
  from: string
  to: string
  label: string
}

export class AnalyticsService {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Get comprehensive analytics data
   */
  static async getAnalyticsData(dateRange?: DateRange): Promise<AnalyticsData> {
    const cacheKey = `analytics_${dateRange?.from || 'all'}_${dateRange?.to || 'all'}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const pb = getPocketBaseClient()
      
      let ordersFilter = ''
      if (dateRange) {
        ordersFilter = `created >= '${dateRange.from}' && created <= '${dateRange.to}'`
      }

      const [orders, products, categories, promotions, promotionAnalytics] = await Promise.all([
        pb.collection('orders').getFullList({ filter: ordersFilter || undefined, sort: '-created' }),
        pb.collection('products').getFullList({ sort: 'name' }),
        pb.collection('categories').getFullList(),
        pb.collection('promotions').getFullList(),
        pb.collection('promotion_analytics').getFullList()
      ])

      if (!orders || !products || !categories) {
        throw new Error('Failed to fetch analytics data')
      }

      // Calculate comprehensive metrics
      const totalSales = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

      // Product analytics
      const productAnalytics = await this.calculateProductAnalytics(orders, products, categories)
      
      // Category analytics
      const categoryAnalytics = await this.calculateCategoryAnalytics(orders, categories, products)
      
      // Monthly analytics
      const monthlyAnalytics = await this.calculateMonthlyAnalytics(orders)
      
      // Customer metrics
      const customerMetrics = await this.calculateCustomerMetrics(orders)
      
      // Order status breakdown
      const orderStatusBreakdown = this.calculateOrderStatusBreakdown(orders)
      
      // Promotion metrics
      const promotionMetrics = await this.calculatePromotionMetrics(promotions, promotionAnalytics)
      
      // Low stock alerts
      const lowStockAlerts = await this.calculateLowStockAlerts(products)
      
      // Realtime activity
      const realtimeActivity = await this.getRealtimeActivity()

      const analyticsData: AnalyticsData = {
        totalSales,
        totalOrders,
        averageOrderValue,
        topProducts: productAnalytics,
        salesByCategory: categoryAnalytics,
        salesByMonth: monthlyAnalytics,
        customerMetrics,
        orderStatusBreakdown,
        promotionMetrics,
        lowStockAlerts,
        realtimeActivity
      }

      this.cache.set(cacheKey, { data: analyticsData, timestamp: Date.now() })
      return analyticsData

    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      const empty: AnalyticsData = {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topProducts: [],
        salesByCategory: [],
        salesByMonth: [],
        customerMetrics: { totalCustomers: 0, newCustomers: 0, returningCustomers: 0, customerRetentionRate: 0 } as any,
        orderStatusBreakdown: [],
        promotionMetrics: [],
        lowStockAlerts: [],
        realtimeActivity: { activeUsers: 0, recentOrders: [], pendingOrders: 0, todayRevenue: 0 } as any,
      }
      return empty
    }
  }

  /**
   * Calculate product analytics
   */
  private static async calculateProductAnalytics(
    orders: any[], 
    products: any[], 
    categories: any[]
  ): Promise<ProductAnalytics[]> {
    const productStats = new Map<string, ProductAnalytics>()

    // Initialize product stats
    products.forEach(product => {
      productStats.set(product.id, {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        views: Math.floor(Math.random() * 1000), // Mock views
        orders: 0,
        revenue: 0,
        quantity: 0,
        stock: product.stock || 0,
        category: product.category || 'Uncategorized'
      })
    })

    // Calculate orders and revenue
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const stats = productStats.get(item.productId)
          if (stats) {
            stats.orders += 1
            stats.revenue += (item.price || 0) * (item.quantity || 0)
            stats.quantity += item.quantity || 0
          }
        })
      }
    })

    return Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20)
  }

  /**
   * Calculate category analytics
   */
  private static async calculateCategoryAnalytics(
    orders: any[], 
    categories: any[],
    products: any[]
  ): Promise<CategoryAnalytics[]> {
    const categoryStats = new Map<string, CategoryAnalytics>()

    // Initialize category stats
    categories.forEach(category => {
      categoryStats.set(category.id, {
        category: category.name,
        categoryId: category.id,
        revenue: 0,
        quantity: 0,
        orders: 0,
        growth: Math.random() * 20 - 10 // Mock growth percentage
      })
    })

    // Calculate category performance
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const product = products?.find((p: any) => p.id === item.productId)
          if (product) {
            const category = categories.find(c => c.id === product.categoryId)
            if (category) {
              const stats = categoryStats.get(category.id)
              if (stats) {
                stats.revenue += (item.price || 0) * (item.quantity || 0)
                stats.quantity += item.quantity || 0
                stats.orders += 1
              }
            }
          }
        })
      }
    })

    return Array.from(categoryStats.values())
      .sort((a, b) => b.revenue - a.revenue)
  }

  /**
   * Calculate monthly analytics
   */
  private static async calculateMonthlyAnalytics(orders: any[]): Promise<MonthlyAnalytics[]> {
    const monthlyStats = new Map<string, MonthlyAnalytics>()

    orders.forEach(order => {
      const month = order.created_at ? new Date(order.created_at).toISOString().slice(0, 7) : 'unknown'
      
      if (!monthlyStats.has(month)) {
        monthlyStats.set(month, {
          month,
          revenue: 0,
          orders: 0,
          customers: 0,
          growth: 0
        })
      }

      const stats = monthlyStats.get(month)!
      stats.revenue += order.total || 0
      stats.orders += 1
      stats.customers += order.userId ? 1 : 0
    })

    return Array.from(monthlyStats.values())
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  /**
   * Calculate customer metrics
   */
  private static async calculateCustomerMetrics(orders: any[]): Promise<CustomerMetrics> {
    const uniqueCustomers = new Set(orders.map(order => order.userId).filter(Boolean))
    const totalCustomers = uniqueCustomers.size
    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0

    // Mock repeat purchase rate
    const repeatPurchaseRate = 0.35

    // Mock popular shopping times
    const popularShoppingTimes: ShoppingTime[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        popularShoppingTimes.push({
          hour,
          day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day],
          orders: Math.floor(Math.random() * 50),
          revenue: Math.floor(Math.random() * 5000)
        })
      }
    }

    return {
      totalCustomers,
      newCustomers: Math.floor(totalCustomers * 0.3),
      returningCustomers: Math.floor(totalCustomers * 0.7),
      averageOrderValue,
      repeatPurchaseRate,
      popularShoppingTimes
    }
  }

  /**
   * Calculate order status breakdown
   */
  private static calculateOrderStatusBreakdown(orders: any[]): OrderStatusMetrics {
    const breakdown = {
      pending: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }

    orders.forEach(order => {
      const status = order.status?.toLowerCase() || 'pending'
      if (breakdown.hasOwnProperty(status)) {
        breakdown[status as keyof OrderStatusMetrics]++
      }
    })

    return breakdown
  }

  /**
   * Calculate promotion metrics
   */
  private static async calculatePromotionMetrics(
    promotions: any[], 
    analytics: any[]
  ): Promise<PromotionAnalytics[]> {
    return promotions.map(promotion => {
      const promoAnalytics = analytics.find(a => a.promotion_id === promotion.id)
      return {
        promotionId: promotion.id,
        title: promotion.title,
        type: promotion.type,
        clicks: promoAnalytics?.clicks || Math.floor(Math.random() * 1000),
        conversions: promoAnalytics?.conversions || Math.floor(Math.random() * 100),
        conversionRate: promoAnalytics?.clicks ? (promoAnalytics.conversions / promoAnalytics.clicks) * 100 : Math.random() * 10,
        revenue: promoAnalytics?.revenue || Math.floor(Math.random() * 10000)
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }

  /**
   * Calculate low stock alerts
   */
  private static async calculateLowStockAlerts(products: any[]): Promise<LowStockAlert[]> {
    return products
      .filter(product => (product.stock || 0) < (product.minStock || 10))
      .map(product => {
        const stock = product.stock || 0
        const minStock = product.minStock || 10
        const urgency = stock <= 0 ? 'critical' : stock <= minStock * 0.25 ? 'high' : stock <= minStock * 0.5 ? 'medium' : 'low'

        return {
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          currentStock: stock,
          minStock,
          urgency: urgency as 'low' | 'medium' | 'high' | 'critical',
          lastRestock: product.lastRestock
        }
      })
      .sort((a, b) => a.currentStock - b.currentStock)
      .slice(0, 10)
  }

  /**
   * Get realtime activity
   */
  private static async getRealtimeActivity(): Promise<RealtimeActivity[]> {
    // Mock realtime activity - in production, this would use Supabase subscriptions
    const activities: RealtimeActivity[] = []
    
    for (let i = 0; i < 20; i++) {
      const types: RealtimeActivity['type'][] = ['order', 'customer', 'product_view', 'promotion_click']
      const type = types[Math.floor(Math.random() * types.length)]
      
      activities.push({
        id: `activity_${i}`,
        type,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        data: { mock: true },
        description: this.getActivityDescription(type)
      })
    }

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  private static getActivityDescription(type: RealtimeActivity['type']): string {
    switch (type) {
      case 'order':
        return 'New order placed'
      case 'customer':
        return 'New customer registered'
      case 'product_view':
        return 'Product viewed'
      case 'promotion_click':
        return 'Promotion clicked'
      default:
        return 'Activity recorded'
    }
  }

  /**
   * Get dashboard stats for quick overview
   */
  static async getDashboardStats(): Promise<any> {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [
      todayStats,
      yesterdayStats,
      lastWeekStats,
      lastMonthStats
    ] = await Promise.all([
      this.getAnalyticsData({ 
        from: today.toISOString().slice(0, 10), 
        to: today.toISOString().slice(0, 10) 
      }),
      this.getAnalyticsData({ 
        from: yesterday.toISOString().slice(0, 10), 
        to: yesterday.toISOString().slice(0, 10) 
      }),
      this.getAnalyticsData({ 
        from: lastWeek.toISOString().slice(0, 10), 
        to: today.toISOString().slice(0, 10) 
      }),
      this.getAnalyticsData({ 
        from: lastMonth.toISOString().slice(0, 10), 
        to: today.toISOString().slice(0, 10) 
      })
    ])

    return {
      today: {
        sales: todayStats.totalSales,
        orders: todayStats.totalOrders,
        customers: todayStats.customerMetrics.newCustomers,
        aov: todayStats.averageOrderValue
      },
      yesterday: {
        sales: yesterdayStats.totalSales,
        orders: yesterdayStats.totalOrders,
        customers: yesterdayStats.customerMetrics.newCustomers,
        aov: yesterdayStats.averageOrderValue
      },
      lastWeek: {
        sales: lastWeekStats.totalSales,
        orders: lastWeekStats.totalOrders,
        customers: lastWeekStats.customerMetrics.newCustomers,
        aov: lastWeekStats.averageOrderValue
      },
      lastMonth: {
        sales: lastMonthStats.totalSales,
        orders: lastMonthStats.totalOrders,
        customers: lastMonthStats.customerMetrics.newCustomers,
        aov: lastMonthStats.averageOrderValue
      },
      growth: {
        sales: this.calculateGrowth(yesterdayStats.totalSales, todayStats.totalSales),
        orders: this.calculateGrowth(yesterdayStats.totalOrders, todayStats.totalOrders),
        customers: this.calculateGrowth(yesterdayStats.customerMetrics.newCustomers, todayStats.customerMetrics.newCustomers)
      },
      lowStockCount: todayStats.lowStockAlerts.length,
      pendingOrders: todayStats.orderStatusBreakdown.pending
    }
  }

  private static calculateGrowth(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  /**
   * Export analytics data to CSV
   */
  static async exportToCSV(data: any, filename: string): Promise<void> {
    // Mock CSV export - in production, this would generate actual CSV
    console.log('Exporting to CSV:', filename, data)
  }

  /**
   * Export analytics data to PDF
   */
  static async exportToPDF(data: any, filename: string): Promise<void> {
    // Mock PDF export - in production, this would generate actual PDF
    console.log('Exporting to PDF:', filename, data)
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * Setup realtime subscriptions
   */
  static setupRealtimeSubscription(callback: (activity: RealtimeActivity) => void): () => void {
    // Mock subscription - in production, this would use Supabase real-time
    console.log('Setting up realtime subscription')
    
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from realtime updates')
    }
  }
}
