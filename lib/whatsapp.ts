import { CartItem } from '@/store/cart-store'

export interface CustomerDetails {
  fullName: string
  phoneNumber: string
  deliveryAddress: string
  notes?: string
}

export interface OrderData {
  items: CartItem[]
  customerDetails: CustomerDetails
  subtotal: number
  shipping: number
  total: number
}

/**
 * Validates Malawi phone number format
 * Malawi phone numbers start with +265 or 09, followed by 8 digits
 */
export function validateMalawiPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Check for Malawi country code formats
  const malawiPatterns = [
    /^\+265\d{8}$/,    // +26512345678
    /^265\d{8}$/,      // 26512345678
    /^09\d{8}$/,       // 0912345678
    /^0\d{8}$/         // 012345678
  ]
  
  return malawiPatterns.some(pattern => pattern.test(cleanPhone))
}

/**
 * Formats phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.startsWith('265')) {
    return `+265${cleanPhone.slice(3)}`
  } else if (cleanPhone.startsWith('09')) {
    return `+265${cleanPhone.slice(1)}`
  } else if (cleanPhone.startsWith('0')) {
    return `+265${cleanPhone.slice(1)}`
  } else if (cleanPhone.startsWith('+265')) {
    return cleanPhone
  }
  
  return cleanPhone
}

/**
 * Generates a professional WhatsApp order message
 */
export function generateWhatsAppOrder(orderData: OrderData): string {
  const { items, customerDetails, subtotal, shipping, total } = orderData
  
  // Format order items
  const orderItems = items.map((item, index) => {
    const itemTotal = item.price * item.quantity
    return `${index + 1}. ${item.name}
Quantity: ${item.quantity}
Price: MK ${item.price.toFixed(2)}${item.quantity > 1 ? `\nItem Total: MK ${itemTotal.toFixed(2)}` : ''}`
  }).join('\n\n')
  
  // Generate the complete message
  const message = `Hello VELOX MART,

I would like to place an order:

Order Items:

${orderItems}

-------------------
Subtotal: MK ${subtotal.toFixed(2)}
Shipping: MK ${shipping.toFixed(2)}
TOTAL: MK ${total.toFixed(2)}
-------------------

Customer Details:
Name: ${customerDetails.fullName}
Phone: ${formatPhoneNumber(customerDetails.phoneNumber)}
Delivery Location: ${customerDetails.deliveryAddress}

${customerDetails.notes ? `Additional Notes:\n${customerDetails.notes}` : ''}

Please confirm availability.

Thank you.`

  return message
}

/**
 * Creates WhatsApp URL with encoded message
 */
export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '')
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`
}

/**
 * Main function to generate WhatsApp order and create URL
 */
export function generateWhatsAppOrderUrl(
  phoneNumber: string,
  orderData: OrderData
): string {
  const message = generateWhatsAppOrder(orderData)
  return createWhatsAppUrl(phoneNumber, message)
}

/**
 * Validates customer details form
 */
export function validateCustomerDetails(details: CustomerDetails): {
  isValid: boolean
  errors: Partial<Record<keyof CustomerDetails, string>>
} {
  const errors: Partial<Record<keyof CustomerDetails, string>> = {}
  
  // Full name validation
  if (!details.fullName || details.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters'
  } else if (!/^[a-zA-Z\s]+$/.test(details.fullName.trim())) {
    errors.fullName = 'Full name can only contain letters and spaces'
  }
  
  // Phone number validation
  if (!details.phoneNumber) {
    errors.phoneNumber = 'Phone number is required'
  } else if (!validateMalawiPhoneNumber(details.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid Malawi phone number (e.g., 0912345678 or +26512345678)'
  }
  
  // Delivery address validation
  if (!details.deliveryAddress || details.deliveryAddress.trim().length < 10) {
    errors.deliveryAddress = 'Delivery address must be at least 10 characters'
  }
  
  // Notes validation (optional)
  if (details.notes && details.notes.length > 500) {
    errors.notes = 'Notes must be less than 500 characters'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Gets the WhatsApp number from environment variables
 */
export function getWhatsAppNumber(): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  
  if (!number) {
    console.warn('NEXT_PUBLIC_WHATSAPP_NUMBER not found in environment variables')
    return '+265991234567' // Fallback number
  }
  
  return number
}

/**
 * Complete checkout process helper
 */
export async function processCheckout(
  customerDetails: CustomerDetails,
  items: CartItem[],
  subtotal: number,
  shipping: number,
  total: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate customer details
    const validation = validateCustomerDetails(customerDetails)
    
    if (!validation.isValid) {
      return {
        success: false,
        error: Object.values(validation.errors).join(', ')
      }
    }
    
    // Create order data
    const orderData: OrderData = {
      items,
      customerDetails,
      subtotal,
      shipping,
      total
    }
    
    // Generate WhatsApp URL
    const phoneNumber = getWhatsAppNumber()
    const whatsappUrl = generateWhatsAppOrderUrl(phoneNumber, orderData)
    
    return {
      success: true,
      url: whatsappUrl
    }
  } catch (error) {
    console.error('Checkout processing error:', error)
    return {
      success: false,
      error: 'Failed to process checkout. Please try again.'
    }
  }
}
