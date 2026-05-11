'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X, ChevronDown, ChevronUp, ShoppingCart, MessageCircle, Phone, Star, Tag, Truck } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useUIStore } from '@/store/ui-store'

interface Category {
  name: string
  href: string
  subcategories?: { name: string; href: string }[]
}

export default function MobileMenu() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const pathname = usePathname()
  const { getTotalItems } = useCartStore()
  const { toggleCart, mobileMenuOpen, toggleMobileMenu } = useUIStore()
  const isOpen = mobileMenuOpen
  const setIsOpen = (v: boolean) => {
    if (v !== isOpen) toggleMobileMenu()
  }
  const cartItemsCount = getTotalItems()

  const categories: Category[] = [
    {
      name: 'Fresh Produce',
      href: '/categories/fresh-produce',
      subcategories: [
        { name: 'Fruits', href: '/categories/fruits' },
        { name: 'Vegetables', href: '/categories/vegetables' },
        { name: 'Herbs & Spices', href: '/categories/herbs-spices' },
      ],
    },
    {
      name: 'Dairy & Eggs',
      href: '/categories/dairy-eggs',
      subcategories: [
        { name: 'Milk & Cream', href: '/categories/milk-cream' },
        { name: 'Cheese', href: '/categories/cheese' },
        { name: 'Eggs', href: '/categories/eggs' },
        { name: 'Yogurt', href: '/categories/yogurt' },
      ],
    },
    {
      name: 'Meat & Seafood',
      href: '/categories/meat-seafood',
      subcategories: [
        { name: 'Beef', href: '/categories/beef' },
        { name: 'Chicken', href: '/categories/chicken' },
        { name: 'Fish', href: '/categories/fish' },
        { name: 'Seafood', href: '/categories/seafood' },
      ],
    },
    {
      name: 'Bakery',
      href: '/categories/bakery',
      subcategories: [
        { name: 'Bread', href: '/categories/bread' },
        { name: 'Pastries', href: '/categories/pastries' },
        { name: 'Cakes', href: '/categories/cakes' },
      ],
    },
    {
      name: 'Pantry',
      href: '/categories/pantry',
      subcategories: [
        { name: 'Rice & Grains', href: '/categories/rice-grains' },
        { name: 'Pasta', href: '/categories/pasta' },
        { name: 'Oils & Sauces', href: '/categories/oils-sauces' },
      ],
    },
  ]

  const mainNavItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Offers', href: '/offers' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Contact', href: '/contact' },
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    )
  }

  const isActiveLink = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-[#0B1F3A] text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <div>
                <h2 className="font-bold text-lg">VELOX MART</h2>
                <p className="text-green-400 text-xs">Fresh & Quality</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Preview */}
          <div className="p-4 bg-green-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Your Cart</p>
                  <p className="text-sm text-gray-600">{cartItemsCount} items</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleCart()
                  setIsOpen(false)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                View Cart
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Menu</h3>
              <nav className="space-y-2">
                {mainNavItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      isActiveLink(item.href)
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>

            {/* Categories */}
            <div className="p-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Shop by Category</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.name} className="border rounded-lg">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{category.name}</span>
                      {category.subcategories && (
                        expandedCategories.includes(category.name) ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )
                      )}
                    </button>
                    {category.subcategories && expandedCategories.includes(category.name) && (
                      <div className="border-t">
                        {category.subcategories.map((sub) => (
                          <a
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            {sub.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <a
                  href="/offers"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Tag className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Today's Offers</p>
                    <p className="text-sm text-gray-600">Special deals & discounts</p>
                  </div>
                </a>
                <a
                  href="/delivery"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Delivery Info</p>
                    <p className="text-sm text-gray-600">Free delivery on orders $50+</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="space-y-3">
              <a
                href="tel:+1234567890"
                className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Call Us</p>
                  <p className="text-sm text-gray-600">+1 234 567 890</p>
                </div>
              </a>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">WhatsApp Order</p>
                  <p className="text-sm opacity-90">Quick order via WhatsApp</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
