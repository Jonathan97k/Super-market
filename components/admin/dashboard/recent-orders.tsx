'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Phone, Calendar, MoreVertical, Eye, Package, CheckCircle, Clock } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    phone: string
    email: string
  }
  total: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  date: string
  items: number
  paymentMethod: string
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock recent orders
  const generateRecentOrders = (): Order[] => {
    const statuses: Order['status'][] = ['pending', 'confirmed', 'delivered', 'cancelled']
    const customers = [
      { name: 'John Doe', phone: '+265 991 234 567', email: 'john@example.com' },
      { name: 'Jane Smith', phone: '+265 992 345 678', email: 'jane@example.com' },
      { name: 'Robert Johnson', phone: '+265 993 456 789', email: 'robert@example.com' },
      { name: 'Mary Williams', phone: '+265 994 567 890', email: 'mary@example.com' },
      { name: 'David Brown', phone: '+265 995 678 901', email: 'david@example.com' },
      { name: 'Sarah Davis', phone: '+265 996 789 012', email: 'sarah@example.com' },
      { name: 'Michael Miller', phone: '+265 997 890 123', email: 'michael@example.com' },
      { name: 'Emily Wilson', phone: '+265 998 901 234', email: 'emily@example.com' }
    ]

    return Array.from({ length: 8 }, (_, index) => {
      const customer = customers[index % customers.length]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const date = new Date()
      date.setHours(date.getHours() - (index * 2))
      
      return {
        id: `order-${index + 1}`,
        orderNumber: `ORD-${String(1000 + index).padStart(4, '0')}`,
        customer,
        total: Math.round((15000 + Math.random() * 35000) * 100) / 100,
        status,
        date: date.toISOString(),
        items: Math.floor(3 + Math.random() * 12),
        paymentMethod: Math.random() > 0.5 ? 'Mobile Money' : 'Cash on Delivery'
      }
    })
  }

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setOrders(generateRecentOrders())
      setIsLoading(false)
    }

    loadOrders()
  }, [])

  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      },
      confirmed: {
        label: 'Confirmed',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Package
      },
      delivered: {
        label: 'Delivered',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: Eye
      }
    }

    const badge = badges[status]
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="text-left pb-3">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="py-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="py-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="py-4">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="py-4">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Orders</h2>
          <p className="text-sm text-gray-500">Latest customer orders and their status</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          View All Orders
        </motion.button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Order
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Customer
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Total
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Date
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.items} items</p>
                  </div>
                </td>
                <td className="py-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="w-3 h-3 mr-1" />
                      {order.customer.phone}
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <p className="font-semibold text-gray-900">
                    MK {order.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                </td>
                <td className="py-4">
                  {getStatusBadge(order.status)}
                </td>
                <td className="py-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(order.date)}
                  </div>
                </td>
                <td className="py-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Order actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {orders.length} of {orders.length + 20} recent orders
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
              1
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              2
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
