'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  badge?: number
}

export function useMobileNav() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', href: '/', icon: 'Home' },
    { id: 'categories', label: 'Categories', href: '/categories', icon: 'Grid' },
    { id: 'search', label: 'Search', href: '/search', icon: 'Search' },
    { id: 'cart', label: 'Cart', href: '/cart', icon: 'ShoppingCart' },
    { id: 'account', label: 'Account', href: '/account', icon: 'User' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up'

      // Hide on scroll down, show on scroll up
      if (scrollDirection === 'down' && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true
    return pathname.startsWith(href) && href !== '/'
  }

  return {
    isVisible,
    navItems,
    isActive,
  }
}
