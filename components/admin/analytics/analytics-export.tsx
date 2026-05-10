'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar, 
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Share2
} from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'
import { useAnalyticsExport } from '@/hooks/use-analytics'

interface AnalyticsExportProps {
  className?: string
  compact?: boolean
  showSchedule?: boolean
}

interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel'
  sections: string[]
  dateRange: { from: string; to: string }
  includeCharts: boolean
  emailTo?: string
}

export default function AnalyticsExport({ 
  className = '', 
  compact = false,
  showSchedule = false
}: AnalyticsExportProps) {
  const { data, dateRange } = useAnalytics()
  const { isExporting, exportProgress, exportData } = useAnalyticsExport()
  const [isExpanded, setIsExpanded] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    sections: ['overview', 'revenue', 'orders', 'products', 'categories', 'customers'],
    dateRange: dateRange,
    includeCharts: true,
    emailTo: ''
  })

  const availableSections = [
    { id: 'overview', label: 'Executive Summary', description: 'Key metrics and KPIs' },
    { id: 'revenue', label: 'Revenue Analytics', description: 'Revenue trends and breakdowns' },
    { id: 'orders', label: 'Order Analysis', description: 'Order status and patterns' },
    { id: 'products', label: 'Product Performance', description: 'Top products and inventory' },
    { id: 'categories', label: 'Category Insights', description: 'Category performance data' },
    { id: 'customers', label: 'Customer Analytics', description: 'Customer behavior and retention' },
    { id: 'promotions', label: 'Promotion Metrics', description: 'Campaign performance' },
    { id: 'stock', label: 'Inventory Alerts', description: 'Low stock warnings' }
  ]

  const handleSectionToggle = (sectionId: string) => {
    setExportOptions(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId]
    }))
  }

  const handleExport = async () => {
    if (!data) return

    try {
      // Prepare export data based on selected sections
      const exportData = prepareExportData(data, exportOptions.sections)
      const filename = `analytics_${exportOptions.dateRange.from}_to_${exportOptions.dateRange.to}`
      
      await exportData(exportData, exportOptions.format, filename)

      // Handle email if provided
      if (exportOptions.emailTo) {
        await sendEmailReport(exportOptions.emailTo, filename, exportOptions.format)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const prepareExportData = (data: any, sections: string[]) => {
    const exportData: any = {}

    sections.forEach(section => {
      switch (section) {
        case 'overview':
          exportData.overview = {
            totalRevenue: data.totalSales,
            totalOrders: data.totalOrders,
            averageOrderValue: data.averageOrderValue,
            totalCustomers: data.customerMetrics?.totalCustomers,
            lowStockCount: data.lowStockAlerts?.length
          }
          break
        case 'revenue':
          exportData.revenue = data.salesByMonth
          break
        case 'orders':
          exportData.orders = data.orderStatusBreakdown
          break
        case 'products':
          exportData.products = data.topProducts
          break
        case 'categories':
          exportData.categories = data.salesByCategory
          break
        case 'customers':
          exportData.customers = data.customerMetrics
          break
        case 'promotions':
          exportData.promotions = data.promotionMetrics
          break
        case 'stock':
          exportData.stock = data.lowStockAlerts
          break
      }
    })

    return exportData
  }

  const sendEmailReport = async (email: string, filename: string, format: string) => {
    // Mock email sending - in production, this would call an email API
    console.log(`Sending ${format} report to ${email}: ${filename}`)
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />
      case 'pdf':
        return <FileText className="w-4 h-4" />
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'csv':
        return 'CSV Spreadsheet'
      case 'pdf':
        return 'PDF Report'
      case 'excel':
        return 'Excel Workbook'
      default:
        return format.toUpperCase()
    }
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Export Analytics</h3>
          <Download className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Format:</span>
            <select
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting || !data}
            className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Analytics</h3>
            <p className="text-sm text-gray-600">Download reports and insights</p>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 space-y-6"
        >
          {/* Export Format */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Export Format</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'csv', label: 'CSV Spreadsheet', description: 'Data for spreadsheet analysis' },
                { value: 'pdf', label: 'PDF Report', description: 'Formatted presentation report' },
                { value: 'excel', label: 'Excel Workbook', description: 'Advanced Excel with charts' }
              ].map((format) => (
                <motion.button
                  key={format.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    exportOptions.format === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {getFormatIcon(format.value)}
                    <span className="ml-2 font-medium text-gray-900">{format.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{format.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Data Sections */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Include Sections</h4>
            <div className="grid grid-cols-2 gap-3">
              {availableSections.map((section) => (
                <motion.label
                  key={section.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={exportOptions.sections.includes(section.id)}
                    onChange={() => handleSectionToggle(section.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{section.label}</p>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Options</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCharts}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                />
                <span className="text-sm text-gray-700">Include charts and visualizations</span>
              </label>

              <div className="flex items-center space-x-3">
                <label className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="email"
                    placeholder="Email report to..."
                    value={exportOptions.emailTo}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, emailTo: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Date Range Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Exporting data for:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(exportOptions.dateRange.from).toLocaleDateString()} - {new Date(exportOptions.dateRange.to).toLocaleDateString()}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {exportOptions.sections.length} sections selected
              </span>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              {showSchedule && (
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </button>
              )}
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting || !data || exportOptions.sections.length === 0}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Exporting report...</span>
                <span className="text-sm text-blue-700">{exportProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-blue-600 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Preparing {getFormatLabel(exportOptions.format)} with {exportOptions.sections.length} sections...
              </p>
            </motion.div>
          )}

          {/* Success Message */}
          {!isExporting && exportProgress === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 rounded-lg p-4"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Export completed successfully!</p>
                  <p className="text-xs text-green-700">Your report has been downloaded.</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/**
 * Quick export buttons for dashboard
 */
export function QuickExportButtons({ className = '' }: { className?: string }) {
  const { data } = useAnalytics()
  const { isExporting, exportData } = useAnalyticsExport()

  const handleQuickExport = async (format: 'csv' | 'pdf') => {
    if (!data) return
    
    const filename = `analytics_quick_${new Date().toISOString().slice(0, 10)}`
    await exportData(data, format, filename)
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleQuickExport('csv')}
        disabled={isExporting || !data}
        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        CSV
      </button>
      <button
        onClick={() => handleQuickExport('pdf')}
        disabled={isExporting || !data}
        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </button>
    </div>
  )
}

/**
 * Export schedule component
 */
export function ExportSchedule({ className = '' }: { className?: string }) {
  const [schedules, setSchedules] = useState([
    {
      id: '1',
      name: 'Weekly Performance Report',
      frequency: 'weekly',
      format: 'pdf',
      recipients: ['manager@company.com'],
      sections: ['overview', 'revenue', 'orders'],
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '2',
      name: 'Monthly Inventory Report',
      frequency: 'monthly',
      format: 'csv',
      recipients: ['inventory@company.com'],
      sections: ['products', 'stock'],
      nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ])

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Scheduled Exports</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Calendar className="w-4 h-4 mr-2" />
          New Schedule
        </button>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{schedule.name}</h4>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span className="capitalize">{schedule.frequency}</span>
                  <span>{schedule.format.toUpperCase()}</span>
                  <span>{schedule.recipients.length} recipients</span>
                  <span>Next: {schedule.nextRun.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  className={`p-1 rounded ${
                    schedule.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {schedule.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
