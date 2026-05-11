import Link from 'next/link'
import { Tag, Truck, Percent, Gift } from 'lucide-react'

const offers = [
  {
    icon: Percent,
    title: '20% Off Fresh Produce',
    description: 'Get 20% off all fresh fruits and vegetables this week.',
    code: 'FRESH20',
    color: 'bg-green-500',
    href: '/products?category=fresh-produce',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Enjoy free delivery on orders over MK 50,000.',
    code: 'FREESHIP',
    color: 'bg-blue-500',
    href: '/products',
  },
  {
    icon: Gift,
    title: 'Buy 2 Get 1 Free',
    description: 'On selected bakery items every weekend.',
    code: 'B2G1BAKE',
    color: 'bg-orange-500',
    href: '/products?category=bakery',
  },
  {
    icon: Tag,
    title: 'Dairy Discount',
    description: '15% off all dairy products and eggs.',
    code: 'DAIRY15',
    color: 'bg-purple-500',
    href: '/products?category=dairy',
  },
]

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0B1F3A] mb-4">Current Offers</h1>
          <p className="text-lg text-gray-600">Save more on your favorite groceries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((o) => {
            const Icon = o.icon
            return (
              <Link
                key={o.title}
                href={o.href}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden p-6 flex items-start gap-4"
              >
                <div className={`${o.color} text-white p-4 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">{o.title}</h3>
                  <p className="text-gray-600 mb-3">{o.description}</p>
                  <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                    <span className="text-xs text-gray-500">Code:</span>
                    <span className="font-mono font-bold text-[#16A34A]">{o.code}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
