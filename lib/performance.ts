// Performance optimization utilities

export interface PerformanceConfig {
  enableCodeSplitting: boolean
  enableTreeShaking: boolean
  enableLazyLoading: boolean
  enableCaching: boolean
  enableCompression: boolean
}

export const defaultPerformanceConfig: PerformanceConfig = {
  enableCodeSplitting: true,
  enableTreeShaking: true,
  enableLazyLoading: true,
  enableCaching: true,
  enableCompression: true,
}

// Dynamic import wrapper for code splitting
export function dynamicImport<T>(importFunction: () => Promise<T>): Promise<T> {
  return importFunction()
}

// Lazy loading for images
export function lazyLoadImage(src: string, placeholder?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  })
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map()
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(name: string): () => void {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      this.recordMetric(name, duration)
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    const count = values.length

    return { avg, min, max, count }
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    for (const [name] of this.metrics) {
      const metrics = this.getMetrics(name)
      if (metrics) {
        result[name] = metrics
      }
    }
    
    return result
  }

  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Resource optimization utilities
export const resourceOptimization = {
  // Optimize image loading
  optimizeImage(src: string, options?: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpg' | 'png'
  }): string {
    const params = new URLSearchParams()
    
    if (options?.width) params.append('w', options.width.toString())
    if (options?.height) params.append('h', options.height.toString())
    if (options?.quality) params.append('q', options.quality.toString())
    if (options?.format) params.append('f', options.format)
    
    const paramString = params.toString()
    return paramString ? `${src}?${paramString}` : src
  },

  // Preload critical resources
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font'): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    
    switch (type) {
      case 'script':
        link.as = 'script'
        break
      case 'style':
        link.as = 'style'
        break
      case 'image':
        link.as = 'image'
        break
      case 'font':
        link.as = 'font'
        link.type = 'font/woff2'
        link.crossOrigin = 'anonymous'
        break
    }
    
    document.head.appendChild(link)
  },

  // Prefetch non-critical resources
  prefetchResource(url: string): void {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  },
}

// Cache utilities
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Global cache instance
export const globalCache = new CacheManager()

// Performance hooks for React components
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance()
  
  return {
    startRender: () => monitor.startTiming(`${componentName}-render`),
    startEffect: (effectName: string) => monitor.startTiming(`${componentName}-${effectName}`),
    recordMetric: (metricName: string, value: number) => monitor.recordMetric(`${componentName}-${metricName}`, value),
  }
}
