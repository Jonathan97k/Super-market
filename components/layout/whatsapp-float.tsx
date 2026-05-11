'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloat() {
  const whatsappNumber = '1234567890' // Replace with actual WhatsApp number

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-8 right-4 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors hover:scale-110 transform duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  )
}
