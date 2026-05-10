'use client'

import Link from 'next/link'
import Button from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <span className="text-4xl font-bold text-red-600">404</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex-1">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/categories" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Browse Products
              </Link>
            </Button>
          </div>
          
          <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Looking for something specific?
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link href="/categories/fresh-produce" className="text-blue-600 hover:text-blue-800 transition-colors">
              Fresh Produce
            </Link>
            <Link href="/categories/dairy" className="text-blue-600 hover:text-blue-800 transition-colors">
              Dairy & Eggs
            </Link>
            <Link href="/categories/meat" className="text-blue-600 hover:text-blue-800 transition-colors">
              Meat & Seafood
            </Link>
            <Link href="/categories/bakery" className="text-blue-600 hover:text-blue-800 transition-colors">
              Bakery
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
