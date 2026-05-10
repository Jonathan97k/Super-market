import { Slot } from '@radix-ui/react-slot'

export default function Button({ children, variant = 'primary', size = 'medium', asChild = false, className = '', ...props }: any) {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center'

  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  }

  const sizes: Record<string, string> = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }

  const Comp: any = asChild ? Slot : 'button'

  return (
    <Comp
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.medium} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}
