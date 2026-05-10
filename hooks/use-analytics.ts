'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  AnalyticsService, 
  AnalyticsData, 
  DateRange, 
  RealtimeActivity 
} from '@/services/analytics'

interface UseAnalyticsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealtime?: boolean
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null
  dashboardStats: any
  loading: boolean
  error: string | null
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  refresh: () => Promise<void>
  exportData: (format: 'csv' | 'pdf') => Promise<void>
  realtimeActivity: RealtimeActivity[]
}

const DEFAULT_DATE_RANGES: DateRange[] = [
  {
    from: new Date().toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    label: 'Today'
  },
  {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    label: 'Last 7 days'
  },
  {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    label: 'Last 30 days'
  },
  {
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    label: 'Last 90 days'
  }
]

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealtime = true
  } = options

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_DATE_RANGES[1]) // Default to last 7 days
  const [realtimeActivity, setRealtimeActivity] = useState<RealtimeActivity[]>([])

  const refreshIntervalRef = useRef<NodeJS.Timeout>()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [analyticsData, stats] = await Promise.all([
        AnalyticsService.getAnalyticsData(dateRange),
        AnalyticsService.getDashboardStats()
      ])

      setData(analyticsData)
      setDashboardStats(stats)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  // Initialize and setup auto-refresh
  useEffect(() => {
    loadAnalytics()

    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(loadAnalytics, refreshInterval)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [loadAnalytics, autoRefresh, refreshInterval])

  // Setup realtime subscription
  useEffect(() => {
    if (enableRealtime) {
      unsubscribeRef.current = AnalyticsService.setupRealtimeSubscription((activity) => {
        setRealtimeActivity(prev => [activity, ...prev.slice(0, 19)]) // Keep last 20 activities
      })
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [enableRealtime])

  // Manual refresh
  const refresh = useCallback(async () => {
    await loadAnalytics()
  }, [loadAnalytics])

  // Export data
  const exportData = useCallback(async (format: 'csv' | 'pdf') => {
    if (!data) {
      throw new Error('No data available to export')
    }

    try {
      const filename = `analytics_${dateRange.from}_to_${dateRange.to}`
      
      if (format === 'csv') {
        await AnalyticsService.exportToCSV(data, `${filename}.csv`)
      } else {
        await AnalyticsService.exportToPDF(data, `${filename}.pdf`)
      }
    } catch (err) {
      console.error('Failed to export data:', err)
      throw err
    }
  }, [data, dateRange])

  return {
    data,
    dashboardStats,
    loading,
    error,
    dateRange,
    setDateRange,
    refresh,
    exportData,
    realtimeActivity
  }
}

/**
 * Hook for specific analytics metrics
 */
export function useAnalyticsMetrics() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const stats = await AnalyticsService.getDashboardStats()
        setMetrics({
          totalRevenue: stats.today.sales,
          totalOrders: stats.today.orders,
          averageOrderValue: stats.today.aov,
          totalCustomers: stats.today.customers,
          lowStockCount: stats.lowStockCount,
          pendingOrders: stats.pendingOrders
        })
      } catch (err) {
        console.error('Failed to load metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [])

  return { metrics, loading }
}

/**
 * Hook for real-time activity monitoring
 */
export function useRealtimeActivity() {
  const [activities, setActivities] = useState<RealtimeActivity[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribe = AnalyticsService.setupRealtimeSubscription((activity) => {
      setActivities(prev => [activity, ...prev.slice(0, 49)]) // Keep last 50 activities
      setIsConnected(true)
    })

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [])

  return { activities, isConnected }
}

/**
 * Hook for date range management
 */
export function useDateRange() {
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_DATE_RANGES[1])
  const [customRange, setCustomRange] = useState<{ from: string; to: string }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10)
  })

  const updateDateRange = useCallback((range: DateRange) => {
    setDateRange(range)
  }, [])

  const setCustomDateRange = useCallback((from: string, to: string) => {
    const customDateRange: DateRange = {
      from,
      to,
      label: 'Custom'
    }
    setDateRange(customDateRange)
    setCustomRange({ from, to })
  }, [])

  const presetRanges = DEFAULT_DATE_RANGES

  return {
    dateRange,
    customRange,
    presetRanges,
    updateDateRange,
    setCustomDateRange
  }
}

/**
 * Hook for analytics export functionality
 */
export function useAnalyticsExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const exportData = useCallback(async (
    data: any, 
    format: 'csv' | 'pdf', 
    filename?: string
  ) => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const finalFilename = filename || `analytics_export_${new Date().toISOString().slice(0, 10)}`
      
      if (format === 'csv') {
        await AnalyticsService.exportToCSV(data, `${finalFilename}.csv`)
      } else {
        await AnalyticsService.exportToPDF(data, `${finalFilename}.pdf`)
      }

      clearInterval(progressInterval)
      setExportProgress(100)
      
      // Reset after completion
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 1000)

    } catch (err) {
      console.error('Export failed:', err)
      setIsExporting(false)
      setExportProgress(0)
      throw err
    }
  }, [])

  return {
    isExporting,
    exportProgress,
    exportData
  }
}

/**
 * Hook for analytics performance monitoring
 */
export function useAnalyticsPerformance() {
  const [performance, setPerformance] = useState({
    queryTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    lastUpdated: null as Date | null
  })

  useEffect(() => {
    const startTime = Date.now()
    
    const monitorPerformance = async () => {
      try {
        const startQuery = Date.now()
        await AnalyticsService.getDashboardStats()
        const queryTime = Date.now() - startQuery

        setPerformance(prev => ({
          ...prev,
          queryTime,
          lastUpdated: new Date()
        }))
      } catch (err) {
        setPerformance(prev => ({
          ...prev,
          errorRate: prev.errorRate + 1
        }))
      }
    }

    monitorPerformance()

    const interval = setInterval(monitorPerformance, 60000) // Monitor every minute

    return () => clearInterval(interval)
  }, [])

  return performance
}
