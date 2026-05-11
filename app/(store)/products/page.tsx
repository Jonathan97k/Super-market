import ProductGrid from '@/components/products/product-grid'

interface ProductsPageProps {
  searchParams?: Promise<{ search?: string; category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) || {}
  const search = params.search || ''
  const category = params.category || 'all'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0B1F3A] mb-4">
            {search ? `Search results for "${search}"` : 'All Products'}
          </h1>
          <p className="text-lg text-gray-600">
            {search
              ? 'Showing products that match your search'
              : 'Browse our complete product catalog with fresh groceries and essentials'}
          </p>
        </div>

        <ProductGrid aspectRatio="1:1" initialCategory={category} initialSearch={search} />
      </div>
    </div>
  )
}
