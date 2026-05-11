'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowRight, Tag, Truck, Clock, ShieldCheck } from 'lucide-react'
import ProductCard from '@/components/products/product-card'
import { ProductService } from '@/services/products'
import { CategoryService } from '@/services/categories'
import type { Product } from '@/types/product'

export default function HomeShop() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([
      ProductService.getProducts({ status: 'active' }),
      CategoryService.getCategories(),
    ])
      .then(([p, c]) => {
        if (!mounted) return
        setProducts(p)
        setCategories(c)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const featured = products.slice(0, 8)
  const newArrivals = products.slice(-6).reverse()

  return (
    <div className="space-y-8 md:space-y-12 pb-8">
      {/* Trust strip */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Truck, title: 'Free Delivery', sub: 'Orders over MK 50,000' },
            { icon: Clock, title: 'Same-Day', sub: 'In Lilongwe' },
            { icon: ShieldCheck, title: 'Quality Guaranteed', sub: 'Fresh & safe' },
            { icon: Tag, title: 'Best Prices', sub: 'Daily deals' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="bg-white rounded-xl p-3 md:p-4 shadow-sm flex items-center gap-3">
              <div className="bg-green-100 text-[#16A34A] p-2 rounded-lg">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm md:text-base leading-tight">{title}</p>
                <p className="text-[11px] md:text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories strip */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#0B1F3A]">Shop by Category</h2>
          <Link href="/categories" className="text-sm text-[#16A34A] font-medium flex items-center gap-1 hover:gap-2 transition-all">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-6 snap-x snap-mandatory scrollbar-hide">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex-shrink-0 w-24 md:w-auto snap-start group"
            >
              <div className="relative w-24 h-24 md:w-full md:h-28 rounded-xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="100px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-900 text-center mt-2 line-clamp-1">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#0B1F3A]">Popular Items</h2>
          <Link href="/products" className="text-sm text-[#16A34A] font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} aspectRatio="1:1" />
            ))}
          </div>
        )}
      </section>

      {/* Promo banner */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-green-700 p-6 md:p-10 text-white">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block bg-white/20 text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-3">
              Limited Time
            </span>
            <h3 className="text-2xl md:text-4xl font-bold mb-2">Weekend Family Savings</h3>
            <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">
              Up to 30% off on selected groceries. Stock up your kitchen and save more.
            </p>
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 bg-white text-[#16A34A] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Shop Deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=60')] bg-cover bg-center" />
        </div>
      </section>

      {/* New arrivals */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#0B1F3A]">New Arrivals</h2>
          <Link href="/new-arrivals" className="text-sm text-[#16A34A] font-medium flex items-center gap-1 hover:gap-2 transition-all">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? null : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} aspectRatio="1:1" />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
