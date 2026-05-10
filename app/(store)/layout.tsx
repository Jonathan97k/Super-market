import Navbar from '@/components/layout/navbar'
import CartSheet from '@/components/cart/cart-sheet'
import BottomNavigation from '@/components/mobile/bottom-navigation'
import FloatingCartButton from '@/components/mobile/floating-cart-button'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Navbar />
      <main>{children}</main>
      <CartSheet />
      <BottomNavigation />
      <FloatingCartButton />
    </div>
  )
}
