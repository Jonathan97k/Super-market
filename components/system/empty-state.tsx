import { Package, Search, ShoppingCart, Inbox } from 'lucide-react'

interface EmptyStateProps {
  type?: 'products' | 'cart' | 'search' | 'orders' | 'categories'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const emptyStateConfig = {
  products: {
    icon: Package,
    title: 'No products found',
    description: 'We couldn\'t find any products in this category. Check back later or browse other categories.',
    actionLabel: 'Browse Categories'
  },
  cart: {
    icon: ShoppingCart,
    title: 'Your cart is empty',
    description: 'Add some delicious items to your cart. We have fresh produce, dairy, meat, and more!',
    actionLabel: 'Start Shopping'
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try searching with different keywords or browse our categories.',
    actionLabel: 'Browse Categories'
  },
  orders: {
    icon: Inbox,
    title: 'No orders yet',
    description: 'You haven\'t placed any orders yet. Start shopping to see your order history.',
    actionLabel: 'Start Shopping'
  },
  categories: {
    icon: Package,
    title: 'No categories available',
    description: 'Categories are being updated. Please check back later.',
    actionLabel: 'Go Home'
  }
}

export default function EmptyState({ 
  type = 'products', 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title || config.title}
      </h3>
      
      <p className="text-gray-600 max-w-md mb-8">
        {description || config.description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {action.label || config.actionLabel}
        </button>
      )}
    </div>
  )
}

export function ProductEmptyState() {
  return <EmptyState type="products" />
}

export function CartEmptyState({ onStartShopping }: { onStartShopping: () => void }) {
  return (
    <EmptyState 
      type="cart"
      action={{
        label: 'Start Shopping',
        onClick: onStartShopping
      }}
    />
  )
}

export function SearchEmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState 
      type="search"
      action={{
        label: 'Browse Categories',
        onClick: onBrowse
      }}
    />
  )
}
