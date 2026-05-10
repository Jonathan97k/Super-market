export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  slug: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  productCount: number
  createdAt: string
  updatedAt: string
}

export interface CategoryHierarchy {
  category: Category
  children: CategoryHierarchy[]
  level: number
}
