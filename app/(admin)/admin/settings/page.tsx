'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/button'
import { brandingManager, BrandingSettings } from '@/lib/branding'
import { Upload, Palette, Store, Phone, Mail, MapPin, Clock, Globe, Toggle } from 'lucide-react'

export default function SettingsPage() {
  const [branding, setBranding] = useState<BrandingSettings>(brandingManager.getBranding())
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Load current branding settings
    const loadBranding = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const settings = await brandingManager.loadBranding(supabaseUrl, supabaseKey)
        setBranding(settings)
      } catch (error) {
        console.error('Failed to load branding:', error)
      }
    }

    loadBranding()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      await brandingManager.updateBranding(supabaseUrl, supabaseKey, branding)
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (field: 'logo_url' | 'favicon_url', file: File) => {
    // This would integrate with your image upload service
    console.log(`Uploading ${field}:`, file)
    // For now, just set a placeholder URL
    setBranding(prev => ({
      ...prev,
      [field]: `/images/uploads/${file.name}`
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Settings</h1>
        <p className="text-gray-600">Customize your supermarket's appearance and settings</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Store className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={branding.store_name}
                onChange={(e) => setBranding(prev => ({ ...prev, store_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Supermarket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={branding.currency}
                onChange={(e) => setBranding(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Fee
              </label>
              <input
                type="number"
                step="0.01"
                value={branding.delivery_fee}
                onChange={(e) => setBranding(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5.99"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={branding.maintenance_mode}
                onChange={(e) => setBranding(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="maintenance_mode" className="ml-2 text-sm font-medium text-gray-700">
                Enable Maintenance Mode
              </label>
            </div>
          </div>
        </div>

        {/* Branding & Colors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Branding & Colors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {branding.logo_url ? (
                    <img src={branding.logo_url} alt="Logo" className="max-w-full max-h-full" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload('logo_url', file)
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                  >
                    Upload Logo
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={branding.primary_color}
                  onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primary_color}
                  onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={branding.secondary_color}
                  onChange={(e) => setBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondary_color}
                  onChange={(e) => setBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#64748b"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={branding.accent_color}
                  onChange={(e) => setBranding(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.accent_color}
                  onChange={(e) => setBranding(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#f59e0b"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Phone className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={branding.whatsapp_number || ''}
                onChange={(e) => setBranding(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={branding.email || ''}
                onChange={(e) => setBranding(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@supermarket.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={branding.phone || ''}
                onChange={(e) => setBranding(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={branding.address?.street || ''}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  address: { ...prev.address!, street: e.target.value }
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street"
              />
              <input
                type="text"
                value={branding.address?.city || ''}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  address: { ...prev.address!, city: e.target.value }
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New York"
              />
              <input
                type="text"
                value={branding.address?.state || ''}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  address: { ...prev.address!, state: e.target.value }
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NY"
              />
              <input
                type="text"
                value={branding.address?.zip || ''}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  address: { ...prev.address!, zip: e.target.value }
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10001"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Business Hours</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(branding.business_hours || {}).map(([day, hours]) => (
              <div key={day}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {day}
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setBranding(prev => ({
                    ...prev,
                    business_hours: { ...prev.business_hours!, [day]: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8:00 AM - 10:00 PM"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Social Links</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={branding.social_links?.facebook || ''}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links!, facebook: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://facebook.com/yourstore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={branding.social_links?.instagram || ''}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links!, instagram: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/yourstore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={branding.social_links?.twitter || ''}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links!, twitter: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://twitter.com/yourstore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={branding.social_links?.linkedin || ''}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links!, linkedin: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/company/yourstore"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
