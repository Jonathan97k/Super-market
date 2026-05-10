import { getPocketBaseClient } from '@/lib/pocketbase/client'
import { Promotion } from '@/types/promotion'

export type PromotionType = 
  | 'hero_banner'
  | 'flash_sale'
  | 'category_offer'
  | 'product_discount'
  | 'countdown_offer'
  | 'announcement_strip'

export type PromotionStatus = 'scheduled' | 'live' | 'expired' | 'paused'

export interface PromotionFormData {
  title: string
  subtitle?: string
  bannerImage?: string
  type: PromotionType
  startDate: string
  endDate: string
  discountPercentage?: number
  categoryId?: string
  productId?: string
  buttonText?: string
  buttonUrl?: string
  backgroundTheme?: string
  isActive: boolean
  priority: number
}

export class PromotionService {
  private static cache = new Map<string, { data: Promotion[]; timestamp: number }>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Get all promotions with optional filtering
   */
  static async getPromotions(filters?: {
    type?: PromotionType
    status?: PromotionStatus
    categoryId?: string
    limit?: number
    offset?: number
  }): Promise<{ promotions: Promotion[]; total: number }> {
    try {
      const pb = getPocketBaseClient()
      let filter = ''
      const page = Math.floor((filters?.offset || 0) / (filters?.limit || 20)) + 1
      const limit = filters?.limit || 20

      // Apply filters
      if (filters?.type) {
        filter = filter ? `${filter} && type = '${filters.type.replace(/'/g, "\\'")}'` : `type = '${filters.type.replace(/'/g, "\\'")}'`
      }

      if (filters?.categoryId) {
        filter = filter ? `${filter} && category_id = '${filters.categoryId.replace(/'/g, "\\'")}'` : `category_id = '${filters.categoryId.replace(/'/g, "\\'")}'`
      }

      const resultList = await pb.collection('promotions').getList(page, limit, {
        filter: filter || undefined,
        sort: '-priority,-start_date'
      })

      let promotions = resultList.items as Promotion[]

      // Apply status filter client-side
      if (filters?.status) {
        promotions = promotions.filter(promo => this.getPromotionStatus(promo) === filters.status)
      }

      return {
        promotions,
        total: resultList.totalItems
      }
    } catch (error) {
      console.error('Failed to get promotions:', error)
      return { promotions: [], total: 0 }
    }
  }

  /**
   * Get active promotions with caching
   */
  static async getActivePromotions(type?: PromotionType): Promise<Promotion[]> {
    const cacheKey = `active_${type || 'all'}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const pb = getPocketBaseClient()
      const now = new Date().toISOString()
      let filter = `isActive = true && start_date <= '${now}' && end_date >= '${now}'`

      if (type) {
        filter = `${filter} && type = '${type}'`
      }

      const promotions = await pb.collection('promotions').getFullList({
        filter: filter,
        sort: '-priority,-start_date'
      })

      this.cache.set(cacheKey, { data: promotions, timestamp: Date.now() })

      return promotions as Promotion[]
    } catch (error) {
      console.error('Failed to get active promotions:', error)
      return []
    }
  }

  /**
   * Get promotion by ID
   */
  static async getPromotionById(id: string): Promise<Promotion | null> {
    try {
      const pb = getPocketBaseClient()
      const promotion = await pb.collection('promotions').getOne(id)
      return promotion as Promotion
    } catch (error) {
      console.error('Failed to get promotion by ID:', error)
      return null
    }
  }

  /**
   * Create new promotion
   */
  static async createPromotion(promotion: PromotionFormData): Promise<Promotion> {
    try {
      const pb = getPocketBaseClient()
      const data = await pb.collection('promotions').create({
        ...promotion,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      })

      // Clear cache
      this.clearCache()

      return data as Promotion
    } catch (error) {
      console.error('Failed to create promotion:', error)
      throw error
    }
  }

  /**
   * Update promotion
   */
  static async updatePromotion(id: string, updates: Partial<PromotionFormData>): Promise<Promotion> {
    try {
      const pb = getPocketBaseClient()
      const data = await pb.collection('promotions').update(id, {
        ...updates,
        updated: new Date().toISOString(),
      })

      // Clear cache
      this.clearCache()

      return data as Promotion
    } catch (error) {
      console.error('Failed to update promotion:', error)
      throw error
    }
  }

  /**
   * Delete promotion
   */
  static async deletePromotion(id: string): Promise<void> {
    try {
      const pb = getPocketBaseClient()
      await pb.collection('promotions').delete(id)

      // Clear cache
      this.clearCache()
    } catch (error) {
      console.error('Failed to delete promotion:', error)
      throw error
    }
  }

  /**
   * Toggle promotion status
   */
  static async togglePromotionStatus(id: string, isActive: boolean): Promise<Promotion> {
    return this.updatePromotion(id, { isActive })
  }

  /**
   * Duplicate promotion
   */
  static async duplicatePromotion(id: string, newTitle?: string): Promise<Promotion> {
    try {
      const original = await this.getPromotionById(id)
      if (!original) throw new Error('Promotion not found')

      const pb = getPocketBaseClient()
      const { title, ...originalWithoutTitle } = original as any
      const data = await pb.collection('promotions').create({
        ...originalWithoutTitle,
        title: newTitle || `${title} (Copy)`,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      })

      // Clear cache
      this.clearCache()

      return data as Promotion
    } catch (error) {
      console.error('Failed to duplicate promotion:', error)
      throw error
    }
  }

  /**
   * Reorder promotions
   */
  static async reorderPromotions(promotions: Array<{ id: string; priority: number }>): Promise<void> {
    try {
      const pb = getPocketBaseClient()
      
      for (const { id, priority } of promotions) {
        await pb.collection('promotions').update(id, {
          priority,
          updated: new Date().toISOString()
        })
      }

      // Clear cache
      this.clearCache()
    } catch (error) {
      console.error('Failed to reorder promotions:', error)
      throw error
    }
  }

  /**
   * Get promotion status based on dates
   */
  static getPromotionStatus(promotion: Promotion): PromotionStatus {
    const now = new Date()
    const startDate = new Date(promotion.startDate)
    const endDate = new Date(promotion.endDate)

    if (!promotion.isActive) {
      return 'paused'
    }

    if (now < startDate) {
      return 'scheduled'
    }

    if (now > endDate) {
      return 'expired'
    }

    return 'live'
  }

  /**
   * Auto-expire promotions (call this periodically)
   */
  static async autoExpirePromotions(): Promise<void> {
    try {
      const pb = getPocketBaseClient()
      const now = new Date().toISOString()
      
      const expiredPromotions = await pb.collection('promotions').getFullList({
        filter: `isActive = true && end_date < '${now}'`
      })

      for (const promotion of expiredPromotions) {
        await pb.collection('promotions').update(promotion.id, {
          isActive: false,
          updated: now
        })
      }

      // Clear cache
      this.clearCache()
    } catch (error) {
      console.error('Failed to auto-expire promotions:', error)
    }
  }

  /**
   * Get countdown time for promotion
   */
  static getCountdownTime(endDate: string): {
    days: number
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  } {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const difference = end - now

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, isExpired: false }
  }

  /**
   * Track promotion analytics
   */
  static async trackPromotionView(promotionId: string): Promise<void> {
    try {
      const pb = getPocketBaseClient()
      const analytics = await pb.collection('promotion_analytics').getFirstListItem(`promotion_id = '${promotionId}'`)
      if (analytics) {
        await pb.collection('promotion_analytics').update(analytics.id, {
          views: (analytics.views || 0) + 1
        })
      } else {
        await pb.collection('promotion_analytics').create({
          promotion_id: promotionId,
          views: 1,
          clicks: 0,
          conversions: 0
        })
      }
    } catch (error) {
      console.error('Failed to track promotion view:', error)
    }
  }

  static async trackPromotionClick(promotionId: string): Promise<void> {
    try {
      const pb = getPocketBaseClient()
      const analytics = await pb.collection('promotion_analytics').getFirstListItem(`promotion_id = '${promotionId}'`)
      if (analytics) {
        await pb.collection('promotion_analytics').update(analytics.id, {
          clicks: (analytics.clicks || 0) + 1
        })
      } else {
        await pb.collection('promotion_analytics').create({
          promotion_id: promotionId,
          views: 0,
          clicks: 1,
          conversions: 0
        })
      }
    } catch (error) {
      console.error('Failed to track promotion click:', error)
    }
  }

  /**
   * Get promotion analytics
   */
  static async getPromotionAnalytics(promotionId: string): Promise<{
    views: number
    clicks: number
    conversions: number
    clickRate: number
  }> {
    try {
      const pb = getPocketBaseClient()
      const data = await pb.collection('promotion_analytics').getFirstListItem(`promotion_id = '${promotionId}'`)

      return {
        views: data?.views || 0,
        clicks: data?.clicks || 0,
        conversions: data?.conversions || 0,
        clickRate: data?.views ? (data.clicks / data.views) * 100 : 0
      }
    } catch (error) {
      console.error('Failed to get promotion analytics:', error)
      return {
        views: 0,
        clicks: 0,
        conversions: 0,
        clickRate: 0
      }
    }
  }

  /**
   * Clear cache
   */
  private static clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get promotions by type for homepage
   */
  static async getHomepagePromotions(): Promise<{
    heroBanner?: Promotion
    flashSale?: Promotion
    countdownOffers: Promotion[]
    featuredOffers: Promotion[]
    announcementStrip?: Promotion
  }> {
    try {
      const activePromotions = await this.getActivePromotions()

      const heroBanner = activePromotions.find(p => p.type === 'hero_banner')
      const flashSale = activePromotions.find(p => p.type === 'flash_sale')
      const countdownOffers = activePromotions.filter(p => p.type === 'countdown_offer')
      const featuredOffers = activePromotions.filter(p => p.type === 'category_offer' || p.type === 'product_discount')
      const announcementStrip = activePromotions.find(p => p.type === 'announcement_strip')

      return {
        heroBanner,
        flashSale,
        countdownOffers,
        featuredOffers,
        announcementStrip
      }
    } catch (error) {
      console.error('Failed to get homepage promotions:', error)
      return {
        countdownOffers: [],
        featuredOffers: []
      }
    }
  }
}
