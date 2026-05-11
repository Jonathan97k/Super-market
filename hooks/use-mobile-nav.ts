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
  const [isVisible] = useState(true)
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', href: '/', icon: 'Home' },
    { id: 'categories', label: 'Categories', href: '/categories', icon: 'Grid' },
    { id: 'search', label: 'Search', href: '#search', icon: 'Search' },
    { id: 'cart', label: 'Cart', href: '/cart', icon: 'ShoppingCart' },
    { id: 'account', label: 'Account', href: '/admin/login', icon: 'User' },
  ]

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
