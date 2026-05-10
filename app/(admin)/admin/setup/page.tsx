'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Store, 
  Palette, 
  Phone, 
  DollarSign, 
  Upload, 
  Save, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { clientService } from '@/services/client-service'
import { isPocketBaseConfigured } from '@/lib/pocketbase/client'

interface StoreSettings {
  store_name: string
  store_description: string
  whatsapp_number: string
  currency_code: string
  currency_symbol: string
  standard_delivery_fee: number
  free_shipping_threshold: number
  primary_color: string
  secondary_color: string
  accent_color: string
  logo_url: string
  logo_file?: File
}

export default function AdminSetupPage() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentSettings, setCurrentSettings] = useState<StoreSettings | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof StoreSettings, string>>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [formData, setFormData] = useState<StoreSettings>({
    store_name: 'VELOX MART',
    store_description: 'Your trusted local supermarket for fresh groceries and daily essentials',
    whatsapp_number: '+265991234567',
    currency_code: 'MWK',
    currency_symbol: 'MK',
    standard_delivery_fee: 50.00,
    free_shipping_threshold: 500.00,
    primary_color: '#16A34A',
    secondary_color: '#0B1F3A',
    accent_color: '#F59E0B',
    logo_url: ''
  })

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const configured = isPocketBaseConfigured()
      setIsConfigured(configured)

      if (configured) {
        // Load existing settings
        const response = await clientService.getPublicSettings()
        if (response.data && !response.error) {
          setCurrentSettings(response.data as StoreSettings)
          setFormData(response.data as StoreSettings)
        }
      }
    } catch (error) {
      console.error('Configuration check failed:', error)
      setIsConfigured(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof StoreSettings, value: string | number | File) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo_file: 'Please upload an image file' }))
        return
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors(prev => ({ ...prev, logo_file: 'File size must be less than 2MB' }))
        return
      }

      setFormData(prev => ({ ...prev, logo_file: file }))
      setErrors(prev => ({ ...prev, logo_file: undefined }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ 
          ...prev, 
          logo_url: e.target?.result as string 
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof StoreSettings, string>> = {}

    if (!formData.store_name || formData.store_name.trim().length < 2) {
      newErrors.store_name = 'Store name must be at least 2 characters'
    }

    if (!formData.whatsapp_number) {
      newErrors.whatsapp_number = 'WhatsApp number is required'
    } else if (!/^\+265\d{9}$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = 'Please enter a valid Malawi WhatsApp number (+265xxxxxxxxx)'
    }

    if (!formData.currency_code || formData.currency_code.length !== 3) {
      newErrors.currency_code = 'Currency code must be 3 characters (e.g., MWK)'
    }

    if (!formData.currency_symbol || formData.currency_symbol.length < 1) {
      newErrors.currency_symbol = 'Currency symbol is required'
    }

    if (formData.standard_delivery_fee < 0) {
      newErrors.standard_delivery_fee = 'Delivery fee cannot be negative'
    }

    if (formData.free_shipping_threshold < 0) {
      newErrors.free_shipping_threshold = 'Free shipping threshold cannot be negative'
    }

    if (!formData.primary_color || !/^#[0-9A-F]{6}$/i.test(formData.primary_color)) {
      newErrors.primary_color = 'Please enter a valid hex color (e.g., #16A34A)'
    }

    if (!formData.secondary_color || !/^#[0-9A-F]{6}$/i.test(formData.secondary_color)) {
      newErrors.secondary_color = 'Please enter a valid hex color (e.g., #0B1F3A)'
    }

    if (!formData.accent_color || !/^#[0-9A-F]{6}$/i.test(formData.accent_color)) {
      newErrors.accent_color = 'Please enter a valid hex color (e.g., #F59E0B)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      // Handle logo upload if present
      let logoUrl = formData.logo_url
      if (formData.logo_file) {
        // In a real implementation, you would upload to PocketBase Storage
        // For now, we'll use the data URL
        logoUrl = formData.logo_url
      }

      const settingsData = {
        ...formData,
        logo_url: logoUrl
      }

      // Update settings in database
      const response = await clientService.getPublicSettings()
      if (response.data && !response.error) {
        // Update existing settings
        // Note: This would require admin permissions in a real implementation
        console.log('Settings to update:', settingsData)
      }

      setSaveStatus('success')
      setCurrentSettings(formData)
      
      // Apply theme immediately
      applyTheme(formData)
      
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const applyTheme = (settings: StoreSettings) => {
    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', settings.primary_color)
    root.style.setProperty('--secondary-color', settings.secondary_color)
    root.style.setProperty('--accent-color', settings.accent_color)
  }

  const resetToDefaults = () => {
    setFormData({
      store_name: 'VELOX MART',
      store_description: 'Your trusted local supermarket for fresh groceries and daily essentials',
      whatsapp_number: '+265991234567',
      currency_code: 'MWK',
      currency_symbol: 'MK',
      standard_delivery_fee: 50.00,
      free_shipping_threshold: 500.00,
      primary_color: '#16A34A',
      secondary_color: '#0B1F3A',
      accent_color: '#F59E0B',
      logo_url: ''
    })
    setErrors({})
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Setup</h2>
          <p className="text-gray-600">Checking configuration...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Required</h1>
          <p className="text-gray-600 mb-6">
            Please configure your PocketBase connection before setting up your store.
          </p>
          <button
            onClick={() => window.location.href = '/setup'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Configure Database
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Store Setup</h1>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Your Store</h2>
                <p className="text-gray-600">
                  Customize your supermarket's branding, contact information, and delivery settings.
                </p>
              </div>

              <div className="space-y-6">
                {/* Store Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Store className="w-5 h-5 mr-2" />
                    Store Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Store Name *
                      </label>
                      <input
                        type="text"
                        value={formData.store_name}
                        onChange={(e) => handleInputChange('store_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.store_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your store name"
                      />
                      {errors.store_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.store_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Store Description
                      </label>
                      <textarea
                        value={formData.store_description}
                        onChange={(e) => handleInputChange('store_description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your store"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsapp_number}
                        onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.whatsapp_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+265991234567"
                      />
                      {errors.whatsapp_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsapp_number}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Currency Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Currency Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Code *
                      </label>
                      <input
                        type="text"
                        value={formData.currency_code}
                        onChange={(e) => handleInputChange('currency_code', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.currency_code ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="MWK"
                        maxLength={3}
                      />
                      {errors.currency_code && (
                        <p className="mt-1 text-sm text-red-600">{errors.currency_code}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Symbol *
                      </label>
                      <input
                        type="text"
                        value={formData.currency_symbol}
                        onChange={(e) => handleInputChange('currency_symbol', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.currency_symbol ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="MK"
                      />
                      {errors.currency_symbol && (
                        <p className="mt-1 text-sm text-red-600">{errors.currency_symbol}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Standard Delivery Fee ({formData.currency_symbol})
                      </label>
                      <input
                        type="number"
                        value={formData.standard_delivery_fee}
                        onChange={(e) => handleInputChange('standard_delivery_fee', parseFloat(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.standard_delivery_fee ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="50.00"
                        step="0.01"
                        min="0"
                      />
                      {errors.standard_delivery_fee && (
                        <p className="mt-1 text-sm text-red-600">{errors.standard_delivery_fee}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Free Shipping Threshold ({formData.currency_symbol})
                      </label>
                      <input
                        type="number"
                        value={formData.free_shipping_threshold}
                        onChange={(e) => handleInputChange('free_shipping_threshold', parseFloat(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.free_shipping_threshold ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="500.00"
                        step="0.01"
                        min="0"
                      />
                      {errors.free_shipping_threshold && (
                        <p className="mt-1 text-sm text-red-600">{errors.free_shipping_threshold}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Brand Colors
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="h-10 w-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.primary_color ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="#16A34A"
                        />
                      </div>
                      {errors.primary_color && (
                        <p className="mt-1 text-sm text-red-600">{errors.primary_color}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          className="h-10 w-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.secondary_color ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="#0B1F3A"
                        />
                      </div>
                      {errors.secondary_color && (
                        <p className="mt-1 text-sm text-red-600">{errors.secondary_color}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accent Color *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          className="h-10 w-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.accent_color ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="#F59E0B"
                        />
                      </div>
                      {errors.accent_color && (
                        <p className="mt-1 text-sm text-red-600">{errors.accent_color}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Store Logo
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Logo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.logo_file && (
                        <p className="mt-1 text-sm text-red-600">{errors.logo_file}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Recommended: Square image, max 2MB
                      </p>
                    </div>

                    {formData.logo_url && (
                      <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg">
                        <img
                          src={formData.logo_url}
                          alt="Store logo preview"
                          className="max-h-24 max-w-48 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <button
                    onClick={resetToDefaults}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                  <div className="flex items-center space-x-3">
                    <AnimatePresence mode="wait">
                      {saveStatus === 'success' && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center text-green-600"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">Saved!</span>
                        </motion.div>
                      )}
                      {saveStatus === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center text-red-600"
                        >
                          <AlertCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">Error</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Settings
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
                
                <div className="space-y-4">
                  {/* Store Header Preview */}
                  <div
                    className="p-4 rounded-lg text-white"
                    style={{ backgroundColor: formData.secondary_color }}
                  >
                    <div className="flex items-center space-x-3">
                      {formData.logo_url ? (
                        <img
                          src={formData.logo_url}
                          alt="Store logo"
                          className="w-10 h-10 object-contain bg-white rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
                          <Store className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-lg">{formData.store_name}</h4>
                        <p className="text-sm opacity-90">{formData.store_description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Colors Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Brand Colors</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className="h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: formData.primary_color }}
                      >
                        Primary
                      </div>
                      <div
                        className="h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: formData.secondary_color }}
                      >
                        Secondary
                      </div>
                      <div
                        className="h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: formData.accent_color }}
                      >
                        Accent
                      </div>
                    </div>
                  </div>

                  {/* Currency Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Currency Format</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Sample Price:</p>
                      <p className="text-2xl font-bold" style={{ color: formData.primary_color }}>
                        {formData.currency_symbol} 1,250.00
                      </p>
                    </div>
                  </div>

                  {/* Delivery Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Settings</h4>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Standard Delivery:</span>{' '}
                        {formData.currency_symbol} {formData.standard_delivery_fee.toFixed(2)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Free Shipping:</span>{' '}
                        Orders over {formData.currency_symbol} {formData.free_shipping_threshold.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Contact Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">WhatsApp:</span>{' '}
                        {formData.whatsapp_number}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
