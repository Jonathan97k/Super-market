import { getPocketBaseClient } from '@/lib/pocketbase/client'
import { Category } from '@/types/category'
import { mockCategories } from '@/lib/mock-data'

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    const pb = getPocketBaseClient()
    try {
      const categories = await pb.collection('categories').getFullList({
        sort: 'sort_order'
      })
      if (!categories || categories.length === 0) return mockCategories
      return categories as Category[]
    } catch (error) {
      console.error('Failed to fetch categories from PocketBase, using mock data:', error)
      return mockCategories
    }
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    const pb = getPocketBaseClient()
    try {
      const category = await pb.collection('categories').getOne(id)
      return category as Category
    } catch (error: any) {
      if (error.status !== 404) {
        console.error('Unexpected error fetching category:', error)
      }
      return null
    }
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    const pb = getPocketBaseClient()
    try {
      const categories = await pb.collection('categories').getFullList({
        filter: `slug = '${slug.replace(/'/g, "\\'")}'`
      })
      return categories[0] as Category || null
    } catch (error) {
      console.error('Error fetching category by slug:', error)
      return null
    }
  }

  static async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const pb = getPocketBaseClient()
    const data = await pb.collection('categories').create(category)
    return data as Category
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const pb = getPocketBaseClient()
    const data = await pb.collection('categories').update(id, updates)
    return data as Category
  }

  static async deleteCategory(id: string): Promise<void> {
    const pb = getPocketBaseClient()
    await pb.collection('categories').delete(id)
  }

  static async getCategoryTree(): Promise<Category[]> {
    const pb = getPocketBaseClient()
    let categories: Category[] = []
    try {
      categories = await pb.collection('categories').getFullList({
        sort: 'sort_order'
      }) as Category[]
    } catch (error) {
      console.error('Failed to fetch category tree from PocketBase:', error)
      return []
    }
    
    const buildHierarchy = (categories: Category[], parentId: string | null = null): any[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildHierarchy(categories, cat.id)
        }))
    }
    
    return buildHierarchy(categories)
  }
}
