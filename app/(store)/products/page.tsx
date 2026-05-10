import ProductGrid from '@/components/products/product-grid'

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0B1F3A] mb-4">All Products</h1>
          <p className="text-lg text-gray-600">Browse our complete product catalog with fresh groceries and essentials</p>
        </div>
        
        <ProductGrid aspectRatio="1:1" />
      </div>
    </div>
  )
}
