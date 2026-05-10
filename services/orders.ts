import { getPocketBaseClient } from '@/lib/pocketbase/client'
import { Order } from '@/types/order'
import { validateOrder } from '@/lib/validations'

export class OrderService {
  static async getOrders(userId?: string): Promise<Order[]> {
    const pb = getPocketBaseClient()
    let filter = ''

    if (userId) {
      filter = `user_id = '${userId.replace(/'/g, "\\'")}'`
    }

    try {
      const orders = await pb.collection('orders').getFullList({
        filter: filter || undefined,
        sort: '-created'
      })
      return orders.filter(validateOrder) as Order[]
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      return []
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const pb = getPocketBaseClient()
    try {
      const order = await pb.collection('orders').getOne(id)
      return validateOrder(order) ? (order as Order) : null
    } catch (error: any) {
      if (error.status !== 404) {
        console.error('Unexpected error fetching order:', error)
      }
      return null
    }
  }

  static async createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const pb = getPocketBaseClient()
    const orderNumber = `ORD-${Date.now()}`

    try {
      const data = await pb.collection('orders').create({
        ...order,
        order_number: orderNumber,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      })
      return data as Order
    } catch (error) {
      console.error('Failed to create order:', error)
      throw error
    }
  }

  static async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const pb = getPocketBaseClient()
    try {
      const data = await pb.collection('orders').update(id, {
        status,
        updated: new Date().toISOString(),
      })
      return data as Order
    } catch (error) {
      console.error('Failed to update order status:', error)
      throw error
    }
  }

  static async addTrackingInfo(orderId: string, trackingNumber: string): Promise<Order> {
    const pb = getPocketBaseClient()
    try {
      const data = await pb.collection('orders').update(orderId, {
        tracking_number: trackingNumber,
        status: 'shipped',
        updated: new Date().toISOString(),
      })
      return data as Order
    } catch (error) {
      console.error('Failed to add tracking info:', error)
      throw error
    }
  }

  static async getOrderStats(dateRange?: { from: string; to: string }): Promise<any> {
    const pb = getPocketBaseClient()
    let filter = ''

    if (dateRange) {
      filter = `created >= '${dateRange.from.replace(/'/g, "\\'")}' && created <= '${dateRange.to.replace(/'/g, "\\'")}'`
    }

    try {
      const orders = await pb.collection('orders').getFullList({
        filter: filter || undefined
      })

      return {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0) / orders.length : 0,
        ordersByStatus: orders.reduce((acc: Record<string, number>, order: any) => {
          const status = order.status?.toLowerCase() || 'pending'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {}),
      }
    } catch (error) {
      console.error('Failed to fetch order stats:', error)
      return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, ordersByStatus: {} }
    }
  }
}
