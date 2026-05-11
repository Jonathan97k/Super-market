import Link from 'next/link'
import Image from 'next/image'
import { CategoryService } from '@/services/categories'

export default async function CategoriesPage() {
  const categories = await CategoryService.getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0B1F3A] mb-4">Categories</h1>
          <p className="text-lg text-gray-600">Shop by category &mdash; browse our full range</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-100">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                  {cat.productCount ? (
                    <p className="text-white/80 text-sm">{cat.productCount} products</p>
                  ) : null}
                </div>
              </div>
              {cat.description ? (
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{cat.description}</p>
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
