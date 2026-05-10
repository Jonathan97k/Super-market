import { MetadataRoute } from 'next'
import { createServerPocketBaseClient } from '@/lib/pocketbase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pb = createServerPocketBaseClient()
  
  // Get base URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  try {
    // Get all categories
    const categories = await pb.collection('categories').getFullList({
      filter: 'is_active = true'
    })

    const categoryPages = categories?.map(category => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updated ? new Date(category.updated) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

    // Get all products
    const products = await pb.collection('products').getFullList({
      filter: 'is_active = true'
    })

    const productPages = products?.map(product => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updated ? new Date(product.updated) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })) || []

    return [...staticPages, ...categoryPages, ...productPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
