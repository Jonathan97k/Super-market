export interface Promotion {
  id: string
  name: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  usageLimit?: number
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
  code?: string
  createdAt: string
  updatedAt: string
}

export interface PromotionUsage {
  id: string
  promotionId: string
  orderId: string
  userId?: string
  discountAmount: number
  usedAt: string
}
