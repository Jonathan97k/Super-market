'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Home, Grid, Search, ShoppingCart, User } from 'lucide-react'
import { useMobileNav } from '@/hooks/use-mobile-nav'
import { useCartStore } from '@/store/cart-store'
import { useUIStore } from '@/store/ui-store'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const iconMap = {
  Home,
  Grid,
  Search,
  ShoppingCart,
  User,
}

export default function BottomNavigation() {
  const { isVisible, navItems, isActive } = useMobileNav()
  const { getTotalItems } = useCartStore()
  const { setSearchOpen } = useUIStore()
  const pathname = usePathname()
  const cartItemsCount = getTotalItems()

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          {/* Safe area padding for notched devices */}
          <div className="pb-[env(safe-area-inset-bottom)]">
            <nav className="bg-[#0B1F3A] border-t border-gray-800 px-2 pt-2">
              <div className="flex items-center justify-around">
                {navItems.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap]
                  const active = isActive(item.href)
                  const showBadge = item.id === 'cart' && cartItemsCount > 0

                  const handleClick = (e: React.MouseEvent) => {
                    if (item.id === 'search') {
                      e.preventDefault()
                      setSearchOpen(true)
                    }
                  }

                  const content = (
                    <>
                      <div className="relative">
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          className={`relative p-2 rounded-xl transition-all duration-200 ${
                            active
                              ? 'bg-green-500/20 text-green-400'
                              : 'text-gray-400 group-hover:text-gray-300'
                          }`}
                        >
                          <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                        </motion.div>

                        {showBadge && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                          >
                            {cartItemsCount > 99 ? '99+' : cartItemsCount}
                          </motion.span>
                        )}
                      </div>

                      <span
                        className={`text-[11px] font-medium mt-1 transition-colors duration-200 ${
                          active ? 'text-green-400' : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </span>

                      {active && (
                        <motion.div
                          layoutId="activeDot"
                          className="absolute -bottom-1 w-1 h-1 bg-green-400 rounded-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )

                  if (item.id === 'search') {
                    return (
                      <button
                        key={item.id}
                        onClick={handleClick}
                        className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[64px] group"
                        aria-label={item.label}
                      >
                        {content}
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[64px] group"
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                    >
                      {content}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
