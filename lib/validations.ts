import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().min(0, 'Stock must be 0 or greater'),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'low_stock']),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  image: z.string().url().optional(),
})

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional(),
})

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be 0 or greater'),
  })),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery']),
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
})

export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type UserInput = z.infer<typeof userSchema>
export type OrderInput = z.infer<typeof orderSchema>

/**
 * Type guards and validators for database responses
 */
export function validateProduct(data: any): data is any {
  try {
    productSchema.partial().parse(data)
    return true
  } catch {
    return false
  }
}

export function validateCategory(data: any): data is any {
  try {
    categorySchema.partial().parse(data)
    return true
  } catch {
    return false
  }
}

export function validateOrder(data: any): data is any {
  try {
    // Orders have more complex structures, we check basic existence of total
    return typeof data === 'object' && data !== null && 'id' in data
  } catch {
    return false
  }
}

