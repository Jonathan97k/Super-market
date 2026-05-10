export interface Order {
  id: string
  userId?: string
  orderNumber: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingMethod: 'standard' | 'express' | 'overnight'
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  quantity: number
  price: number
  total: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface OrderTracking {
  id: string
  orderId: string
  status: string
  location?: string
  timestamp: string
  description: string
}
