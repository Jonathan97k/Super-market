import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0B1F3A] mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">Get in touch with the VELOX MART team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold text-[#0B1F3A]">Reach Out</h2>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-[#16A34A] p-3 rounded-lg">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <a href="tel:+265000000000" className="text-gray-600 hover:text-[#16A34A]">+265 000 000 000</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-[#16A34A] p-3 rounded-lg">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                <a href="https://wa.me/265000000000" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#16A34A]">+265 000 000 000</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-[#16A34A] p-3 rounded-lg">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <a href="mailto:hello@veloxmart.mw" className="text-gray-600 hover:text-[#16A34A]">hello@veloxmart.mw</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-[#16A34A] p-3 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Address</h3>
                <p className="text-gray-600">Area 47, Lilongwe, Malawi</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-[#16A34A] p-3 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Business Hours</h3>
                <p className="text-gray-600">Mon &ndash; Sat: 7:00 AM &ndash; 8:00 PM</p>
                <p className="text-gray-600">Sun: 8:00 AM &ndash; 6:00 PM</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-4">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]" placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" className="w-full bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#158a3d] transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
