'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Mic, Camera, TrendingUp } from 'lucide-react'
import LiveSearchDropdown from './live-search-dropdown'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  showSuggestions?: boolean
  popularSearches?: string[]
  isLoading?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  autoFocus?: boolean
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search products, categories...',
  showSuggestions = true,
  popularSearches = [],
  isLoading = false,
  className = '',
  size = 'md',
  autoFocus = false
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Size classes
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  }

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowDropdown(true)
  }

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true)
    setShowDropdown(true)
  }

  // Handle blur
  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking on dropdown
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsFocused(false)
      // Delay hiding dropdown to allow click events
      setTimeout(() => setShowDropdown(false), 150)
    }
  }

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit?.(value.trim())
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  // Handle clear
  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  // Handle popular search click
  const handlePopularSearchClick = (searchTerm: string) => {
    onChange(searchTerm)
    onSubmit?.(searchTerm)
    setShowDropdown(false)
  }

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative flex items-center bg-white border rounded-xl transition-all
          ${isFocused 
            ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${sizeClasses[size]}
        `}>
          {/* Search Icon */}
          <div className="flex items-center justify-center pl-4">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`${iconSize[size]} text-blue-500`}
              >
                <Search />
              </motion.div>
            ) : (
              <Search className={`${iconSize[size]} text-gray-400`} />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-4 py-0 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            autoComplete="off"
          />

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 pr-2">
            {/* Clear Button */}
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                title="Clear search"
              >
                <X className={iconSize[size]} />
              </motion.button>
            )}

            {/* Voice Search (Mobile) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors md:hidden"
              title="Voice search"
            >
              <Mic className={iconSize[size]} />
            </motion.button>

            {/* Camera Search (Mobile) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors md:hidden"
              title="Search by image"
            >
              <Camera className={iconSize[size]} />
            </motion.button>
          </div>
        </div>
      </form>

      {/* Live Search Dropdown */}
      <AnimatePresence>
        {showDropdown && showSuggestions && (
          <LiveSearchDropdown
            searchQuery={value}
            popularSearches={popularSearches}
            onSearchClick={handlePopularSearchClick}
            onClose={() => setShowDropdown(false)}
          />
        )}
      </AnimatePresence>

      {/* Search Suggestions (when not focused) */}
      {!isFocused && !value && popularSearches.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <TrendingUp className="w-4 h-4 mr-1" />
            Popular Searches
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.slice(0, 5).map((search, index) => (
              <motion.button
                key={search}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePopularSearchClick(search)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {search}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
