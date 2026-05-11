'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, ShoppingCart, User, Menu, X, Phone, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useUIStore } from '@/store/ui-store'
import MobileMenu from './mobile-menu'
import SearchModal from './search-modal'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { searchOpen, setSearchOpen, toggleMobileMenu } = useUIStore()
  const pathname = usePathname()
  const { getTotalItems, toggleCart } = useCartStore()
  const cartItemsCount = getTotalItems()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActiveLink = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <>
      {/* Top Promo Bar - Hidden on mobile, shown on tablet+ */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white text-sm py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">🌟 Fresh Deals Daily</span>
            </div>
            <div className="hidden md:block text-center">
              <span>🚚 Free delivery on orders above MK 50,000</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:bg-green-700 px-3 py-1 rounded transition-colors"
                aria-label="Contact us on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0B1F3A]/95 backdrop-blur-md shadow-lg'
            : 'bg-[#0B1F3A] shadow-md'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-white/95 ring-1 ring-white/20 shadow-md group-hover:ring-green-400/50 transition">
                <Image
                  src="/logo.png"
                  alt="Jacke Mabvuka Supermarket"
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <h1 className="text-white font-bold text-base md:text-lg tracking-wide">Jacke Mabvuka</h1>
                <p className="text-green-400 text-[10px] md:text-xs font-medium">Supermarket</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 md:space-x-6 lg:space-x-8">
              {[
                { name: 'Home', href: '/' },
                { name: 'Shop', href: '/products' },
                { name: 'Categories', href: '/categories' },
                { name: 'Offers', href: '/offers' },
                { name: 'New Arrivals', href: '/new-arrivals' },
                { name: 'Contact', href: '/contact' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`relative text-white font-medium text-sm md:text-base transition-all duration-200 hover:text-green-400 group ${
                    isActiveLink(item.href) ? 'text-green-400' : ''
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-green-400 transform transition-transform duration-200 ${
                      isActiveLink(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search - Hidden on mobile (uses bottom nav) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex text-white hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart - Hidden on mobile (uses bottom nav) */}
              <button
                onClick={toggleCart}
                className="hidden md:flex relative text-white hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <a
                href="/admin/login"
                className="text-white hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-white/10 hidden sm:block"
                aria-label="User account"
              >
                <User className="w-5 h-5" />
              </a>

              {/* Mobile Menu Toggle - shows on mobile & tablet (lg and below) */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-white hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
