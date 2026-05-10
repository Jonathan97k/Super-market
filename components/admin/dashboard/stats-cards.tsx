'use client'

import { motion } from 'framer-motion'
import { Package, ShoppingCart, DollarSign, Tag, TrendingUp, TrendingDown } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  activePromotions: number
  pendingOrders: number
  totalStockValue: number
  lowStockCount: number
  outOfStockCount: number
  revenueEstimate: number
  ordersToday: number
  ordersThisWeek: number
  ordersThisMonth: number
}

interface StatsCardsProps {
  stats: DashboardStats
}

interface StatCard {
  title: string
  value: string | number
  icon: any
  trend: number
  trendLabel: string
  sparkline: number[]
  color: string
}

export default function StatsCards({ stats }: StatsCardsProps) {
  // Generate mock sparkline data
  const generateSparkline = (baseValue: number, variance: number, points: number = 10) => {
    return Array.from({ length: points }, (_, i) => {
      const randomVariance = (Math.random() - 0.5) * variance
      return Math.max(0, baseValue + randomVariance + (i * baseValue * 0.02))
    })
  }

  const cards: StatCard[] = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      trend: 12.5,
      trendLabel: 'vs last month',
      sparkline: generateSparkline(1200, 100),
      color: 'blue'
    },
    {
      title: 'Orders Today',
      value: stats.ordersToday.toLocaleString(),
      icon: ShoppingCart,
      trend: 8.3,
      trendLabel: 'vs yesterday',
      sparkline: generateSparkline(30, 8),
      color: 'green'
    },
    {
      title: 'Revenue Estimate',
      value: `MK ${stats.revenueEstimate.toLocaleString()}`,
      icon: DollarSign,
      trend: -2.4,
      trendLabel: 'vs last week',
      sparkline: generateSparkline(45000, 3000),
      color: 'purple'
    },
    {
      title: 'Active Promotions',
      value: stats.activePromotions,
      icon: Tag,
      trend: 15.7,
      trendLabel: 'vs last month',
      sparkline: generateSparkline(7, 2),
      color: 'orange'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        trendUp: 'text-blue-600',
        trendDown: 'text-blue-600',
        sparkline: 'stroke-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        trendUp: 'text-green-600',
        trendDown: 'text-red-600',
        sparkline: 'stroke-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        trendUp: 'text-purple-600',
        trendDown: 'text-red-600',
        sparkline: 'stroke-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        trendUp: 'text-orange-600',
        trendDown: 'text-red-600',
        sparkline: 'stroke-orange-600'
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <svg width="60" height="20" viewBox="0 0 60 20" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color)
        const isPositive = card.trend > 0
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ 
              y: -4,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
              <div className="flex items-center space-x-1">
                {isPositive ? (
                  <TrendingUp className={`w-4 h-4 ${colors.trendUp}`} />
                ) : (
                  <TrendingDown className={`w-4 h-4 ${colors.trendDown}`} />
                )}
                <span className={`text-sm font-medium ${
                  isPositive ? colors.trendUp : colors.trendDown
                }`}>
                  {Math.abs(card.trend)}%
                </span>
              </div>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </h3>
              <p className="text-sm text-gray-500">
                {card.title}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {card.trendLabel}
              </p>
              <div className="opacity-60">
                <Sparkline data={card.sparkline} color={colors.sparkline} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
