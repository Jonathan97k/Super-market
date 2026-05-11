import Hero from '@/components/home/hero'
import HomeShop from '@/components/home/home-shop'

export default function StoreHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact hero on mobile, full hero on tablet+ */}
      <div className="hidden md:block">
        <Hero />
      </div>

      {/* Mobile-friendly compact hero */}
      <div className="md:hidden bg-gradient-to-br from-[#0B1F3A] to-[#16A34A] text-white px-4 py-6">
        <h1 className="text-2xl font-bold leading-tight mb-1">Fresh Groceries, Delivered</h1>
        <p className="text-sm text-white/90 mb-4">Premium quality at family-friendly prices</p>
        <a
          href="/products"
          className="inline-flex items-center gap-2 bg-white text-[#16A34A] font-semibold px-4 py-2 rounded-lg text-sm shadow"
        >
          Start Shopping
        </a>
      </div>

      <div className="py-6 md:py-10">
        <HomeShop />
      </div>
    </div>
  )
}
