export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  avatar?: string
  addresses: Address[]
  preferences: UserPreferences
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  type: 'shipping' | 'billing'
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface UserPreferences {
  newsletter: boolean
  smsNotifications: boolean
  emailNotifications: boolean
  language: string
  currency: string
}

export interface UserProfile {
  user: User
  orderHistory: OrderSummary[]
  wishlist: Product[]
  paymentMethods: PaymentMethod[]
}

export interface OrderSummary {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  image?: string
}

export interface PaymentMethod {
  id: string
  type: 'credit_card' | 'debit_card' | 'paypal'
  lastFour?: string
  expiryDate?: string
  isDefault: boolean
}
