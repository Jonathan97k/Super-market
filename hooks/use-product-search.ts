'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  searchService, 
  SearchFilters, 
  SearchResult, 
  Product, 
  Category,
  SearchUrlManager 
} from '@/lib/search'

interface UseProductSearchOptions {
  initialFilters?: Partial<SearchFilters>
  autoSearch?: boolean
  updateUrl?: boolean
}

export function useProductSearch({
  initialFilters = {},
  autoSearch = true,
  updateUrl = true
}: UseProductSearchOptions = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 100000,
    inStock: false,
    featured: false,
    newArrival: false,
    onSale: false,
    sortBy: 'newest',
    page: 1,
    limit: 20,
    ...initialFilters
  })

  const [searchResult, setSearchResult] = useState<SearchResult>({
    products: [],
    totalCount: 0,
    hasMore: false,
    currentPage: 1
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [liveSearchResults, setLiveSearchResults] = useState<Product[]>([])
  const [isLiveSearching, setIsLiveSearching] = useState(false)
  const [popularSearches, setPopularSearches] = useState<string[]>([])

  // Initialize from URL params
  useEffect(() => {
    if (searchParams) {
      const urlFilters = SearchUrlManager.parseUrlParams(searchParams)
      setFilters(prev => ({ ...prev, ...urlFilters }))
    }
  }, [searchParams])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesData, priceRangeData, popularSearchesData] = await Promise.all([
          searchService.getCategories(),
          searchService.getPriceRange(),
          searchService.getPopularSearches()
        ])

        setCategories(categoriesData)
        setPriceRange(priceRangeData)
        setPopularSearches(popularSearchesData)

        // Update price range if not set
        setFilters(prev => ({
          ...prev,
          minPrice: prev.minPrice || priceRangeData.min,
          maxPrice: prev.maxPrice || priceRangeData.max
        }))
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    }

    loadInitialData()
  }, [])

  // Perform search
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await searchService.searchProducts(searchFilters)
      setSearchResult(result)

      // Record search for analytics
      if (searchFilters.search) {
        await searchService.recordSearch(searchFilters.search)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(errorMessage)
      setSearchResult({
        products: [],
        totalCount: 0,
        hasMore: false,
        currentPage: searchFilters.page || 1
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto search when filters change
  useEffect(() => {
    if (autoSearch) {
      performSearch(filters)
    }
  }, [filters, autoSearch, performSearch])

  // Update URL when filters change
  useEffect(() => {
    if (updateUrl) {
      const url = SearchUrlManager.getSearchUrl(filters)
      router.push(url, { scroll: false })
    }
  }, [filters, updateUrl, router])

  // Live search with debounce
  useEffect(() => {
    if (!filters.search || filters.search.length < 2) {
      setLiveSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLiveSearching(true)
      try {
        const results = await searchService.getLiveSearchSuggestions(filters.search, 8)
        setLiveSearchResults(results)
      } catch (err) {
        console.error('Live search failed:', err)
        setLiveSearchResults([])
      } finally {
        setIsLiveSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters.search])

  // Filter update functions
  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset page when changing other filters
    }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      categoryId: '',
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      inStock: false,
      featured: false,
      newArrival: false,
      onSale: false,
      sortBy: 'newest',
      page: 1,
      limit: 20
    })
  }, [priceRange])

  const clearSearch = useCallback(() => {
    updateFilter('search', '')
  }, [updateFilter])

  // Search functions
  const search = useCallback((query: string) => {
    updateFilter('search', query)
  }, [updateFilter])

  const searchByCategory = useCallback((categoryId: string, categoryName: string) => {
    updateFilters({
      categoryId,
      category: categoryName,
      search: '',
      page: 1
    })
  }, [updateFilters])

  const setSortBy = useCallback((sortBy: SearchFilters['sortBy']) => {
    updateFilter('sortBy', sortBy)
  }, [updateFilter])

  const setPriceRange = useCallback((min: number, max: number) => {
    updateFilters({ minPrice: min, maxPrice: max })
  }, [updateFilters])

  const toggleFilter = useCallback((key: keyof SearchFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key],
      page: 1
    }))
  }, [])

  // Pagination
  const nextPage = useCallback(() => {
    if (searchResult.hasMore && !isLoading) {
      updateFilter('page', filters.page + 1)
    }
  }, [searchResult.hasMore, isLoading, filters.page, updateFilter])

  const prevPage = useCallback(() => {
    if (filters.page > 1 && !isLoading) {
      updateFilter('page', filters.page - 1)
    }
  }, [filters.page, isLoading, updateFilter])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && !isLoading) {
      updateFilter('page', page)
    }
  }, [isLoading, updateFilter])

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.categoryId ||
      filters.minPrice !== priceRange.min ||
      filters.maxPrice !== priceRange.max ||
      filters.inStock ||
      filters.featured ||
      filters.newArrival ||
      filters.onSale
    )
  }, [filters, priceRange])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.categoryId) count++
    if (filters.minPrice !== priceRange.min) count++
    if (filters.maxPrice !== priceRange.max) count++
    if (filters.inStock) count++
    if (filters.featured) count++
    if (filters.newArrival) count++
    if (filters.onSale) count++
    return count
  }, [filters, priceRange])

  const currentCategory = useMemo(() => {
    return categories.find(cat => cat.id === filters.categoryId)
  }, [categories, filters.categoryId])

  const totalPages = useMemo(() => {
    return Math.ceil(searchResult.totalCount / filters.limit)
  }, [searchResult.totalCount, filters.limit])

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const summary: string[] = []
    
    if (filters.search) {
      summary.push(`"${filters.search}"`)
    }
    
    if (currentCategory) {
      summary.push(currentCategory.name)
    }
    
    if (filters.minPrice !== priceRange.min || filters.maxPrice !== priceRange.max) {
      summary.push(`MWK ${filters.minPrice.toLocaleString()} - MWK ${filters.maxPrice.toLocaleString()}`)
    }
    
    const booleanFilters = []
    if (filters.inStock) booleanFilters.push('In Stock')
    if (filters.featured) booleanFilters.push('Featured')
    if (filters.newArrival) booleanFilters.push('New Arrivals')
    if (filters.onSale) booleanFilters.push('On Sale')
    
    if (booleanFilters.length > 0) {
      summary.push(booleanFilters.join(', '))
    }
    
    return summary.join(' • ')
  }, [filters, currentCategory, priceRange])

  // Export search URL
  const getShareableUrl = useCallback(() => {
    return typeof window !== 'undefined' 
      ? window.location.origin + SearchUrlManager.getSearchUrl(filters)
      : ''
  }, [filters])

  return {
    // State
    filters,
    searchResult,
    isLoading,
    error,
    categories,
    priceRange,
    liveSearchResults,
    isLiveSearching,
    popularSearches,
    
    // Computed
    hasActiveFilters,
    activeFiltersCount,
    currentCategory,
    totalPages,
    
    // Actions
    updateFilter,
    updateFilters,
    clearFilters,
    clearSearch,
    search,
    searchByCategory,
    setSortBy,
    setPriceRange,
    toggleFilter,
    
    // Pagination
    nextPage,
    prevPage,
    goToPage,
    
    // Utilities
    getFilterSummary,
    getShareableUrl,
    
    // Refresh
    refresh: () => performSearch(filters)
  }
}

/**
 * Hook for search suggestions
 */
export function useSearchSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const results = await searchService.getSearchSuggestions(query, 5)
      setSuggestions(results)
    } catch (err) {
      console.error('Failed to get suggestions:', err)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    suggestions,
    isLoading,
    getSuggestions
  }
}

/**
 * Hook for search analytics
 */
export function useSearchAnalytics() {
  const [analytics, setAnalytics] = useState({
    popularQueries: [] as Array<{ query: string; count: number }>,
    recentSearches: [] as Array<{ query: string; timestamp: string }>
  })

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await searchService.getSearchAnalytics()
      setAnalytics(data)
    } catch (err) {
      console.error('Failed to load analytics:', err)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    analytics,
    loadAnalytics
  }
}
