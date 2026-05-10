export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  images: string[]
  status: 'active' | 'inactive' | 'out_of_stock' | 'low_stock'
  sku: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  price: number
  stock: number
  sku: string
  attributes: Record<string, string>
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}
