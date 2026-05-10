'use client'

import { useEffect, useState } from 'react'
import { clientService } from '@/services/client-service'

export interface ThemeConfig {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  light_text_color: string
  border_color: string
  success_color: string
  error_color: string
  warning_color: string
  logo_url: string
  favicon_url: string
}

export interface StoreSettings {
  store_name: string
  store_description: string
  store_phone: string
  whatsapp_number: string
  logo_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  currency_code: string
  currency_symbol: string
  standard_delivery_fee: number
  free_shipping_threshold: number
  business_hours: string
  delivery_areas: string[]
  payment_methods: string[]
  is_live: boolean
  maintenance_mode: boolean
  maintenance_message: string
}

class DynamicThemeManager {
  private static instance: DynamicThemeManager
  private themeConfig: ThemeConfig | null = null
  private storeSettings: StoreSettings | null = null
  private isLoading = true
  private listeners: Array<(theme: ThemeConfig) => void> = []
  private settingsListeners: Array<(settings: StoreSettings) => void> = []

  private constructor() {
    this.loadTheme()
  }

  static getInstance(): DynamicThemeManager {
    if (!DynamicThemeManager.instance) {
      DynamicThemeManager.instance = new DynamicThemeManager()
    }
    return DynamicThemeManager.instance
  }

  async loadTheme() {
    try {
      const response = await clientService.getThemeConfig()
      
      if (response.data && !response.error) {
        this.themeConfig = response.data
        this.applyTheme(response.data)
        this.notifyListeners(response.data)
      } else {
        // Apply default theme if loading fails
        this.applyDefaultTheme()
      }
    } catch (error) {
      console.error('Failed to load theme:', error)
      this.applyDefaultTheme()
    } finally {
      this.isLoading = false
    }
  }

  async loadSettings() {
    try {
      const response = await clientService.getPublicSettings()
      
      if (response.data && !response.error) {
        this.storeSettings = response.data
        this.notifySettingsListeners(response.data)
        this.updatePageMetadata(response.data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  private applyTheme(theme: ThemeConfig) {
    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', theme.primary_color)
    root.style.setProperty('--secondary-color', theme.secondary_color)
    root.style.setProperty('--accent-color', theme.accent_color)
    root.style.setProperty('--background-color', theme.background_color)
    root.style.setProperty('--text-color', theme.text_color)
    root.style.setProperty('--light-text-color', theme.light_text_color)
    root.style.setProperty('--border-color', theme.border_color)
    root.style.setProperty('--success-color', theme.success_color)
    root.style.setProperty('--error-color', theme.error_color)
    root.style.setProperty('--warning-color', theme.warning_color)
    
    // Update favicon
    if (theme.favicon_url) {
      this.updateFavicon(theme.favicon_url)
    }
  }

  private applyDefaultTheme() {
    const defaultTheme: ThemeConfig = {
      primary_color: '#16A34A',
      secondary_color: '#0B1F3A',
      accent_color: '#F59E0B',
      background_color: '#FFFFFF',
      text_color: '#111827',
      light_text_color: '#6B7280',
      border_color: '#E5E7EB',
      success_color: '#10B981',
      error_color: '#EF4444',
      warning_color: '#F59E0B',
      logo_url: '',
      favicon_url: ''
    }
    
    this.themeConfig = defaultTheme
    this.applyTheme(defaultTheme)
  }

  private updateFavicon(url: string) {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    link.href = url
    document.getElementsByTagName('head')[0].appendChild(link)
  }

  private updatePageMetadata(settings: StoreSettings) {
    // Update page title
    if (settings.store_name) {
      document.title = settings.store_name
    }

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.getElementsByTagName('head')[0].appendChild(metaDescription)
    }
    
    if (settings.store_description) {
      metaDescription.content = settings.store_description
    }

    // Update Open Graph tags
    this.updateMetaTag('og:title', settings.store_name)
    this.updateMetaTag('og:description', settings.store_description)
    this.updateMetaTag('og:image', settings.logo_url)

    // Update Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image')
    this.updateMetaTag('twitter:title', settings.store_name)
    this.updateMetaTag('twitter:description', settings.store_description)
    this.updateMetaTag('twitter:image', settings.logo_url)
  }

  private updateMetaTag(property: string, content: string) {
    let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement ||
              document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement
    
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('property', property)
      document.getElementsByTagName('head')[0].appendChild(tag)
    }
    
    if (content) {
      tag.content = content
    }
  }

  private notifyListeners(theme: ThemeConfig) {
    this.listeners.forEach(listener => listener(theme))
  }

  private notifySettingsListeners(settings: StoreSettings) {
    this.settingsListeners.forEach(listener => listener(settings))
  }

  // Public methods
  getTheme(): ThemeConfig | null {
    return this.themeConfig
  }

  getSettings(): StoreSettings | null {
    return this.storeSettings
  }

  getLoadingStatus(): boolean {
    return this.isLoading
  }

  addThemeListener(listener: (theme: ThemeConfig) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  addSettingsListener(listener: (settings: StoreSettings) => void) {
    this.settingsListeners.push(listener)
    return () => {
      this.settingsListeners = this.settingsListeners.filter(l => l !== listener)
    }
  }

  async refreshTheme() {
    this.isLoading = true
    await this.loadTheme()
  }

  async refreshSettings() {
    await this.loadSettings()
  }

  // Utility methods for getting theme values
  getPrimaryColor(): string {
    return this.themeConfig?.primary_color || '#16A34A'
  }

  getSecondaryColor(): string {
    return this.themeConfig?.secondary_color || '#0B1F3A'
  }

  getAccentColor(): string {
    return this.themeConfig?.accent_color || '#F59E0B'
  }

  getStoreName(): string {
    return this.storeSettings?.store_name || 'VELOX MART'
  }

  getWhatsAppNumber(): string {
    return this.storeSettings?.whatsapp_number || '+265991234567'
  }

  getCurrencySymbol(): string {
    return this.storeSettings?.currency_symbol || 'MK'
  }

  getCurrencyCode(): string {
    return this.storeSettings?.currency_code || 'MWK'
  }

  getDeliveryFee(): number {
    return this.storeSettings?.standard_delivery_fee || 50.00
  }

  getFreeShippingThreshold(): number {
    return this.storeSettings?.free_shipping_threshold || 500.00
  }

  isMaintenanceMode(): boolean {
    return this.storeSettings?.maintenance_mode || false
  }

  getMaintenanceMessage(): string {
    return this.storeSettings?.maintenance_message || 'We are currently under maintenance. Please check back soon.'
  }

  getBusinessHours(): any {
    try {
      return this.storeSettings?.business_hours ? JSON.parse(this.storeSettings.business_hours) : {}
    } catch {
      return {}
    }
  }

  getDeliveryAreas(): string[] {
    try {
      return this.storeSettings?.delivery_areas ? JSON.parse(this.storeSettings.delivery_areas) : []
    } catch {
      return []
    }
  }

  getPaymentMethods(): string[] {
    try {
      return this.storeSettings?.payment_methods ? JSON.parse(this.storeSettings.payment_methods) : ['cash']
    } catch {
      return ['cash']
    }
  }

  // Method to apply theme programmatically (useful for admin preview)
  applyCustomTheme(theme: Partial<ThemeConfig>) {
    const mergedTheme = { ...this.themeConfig, ...theme } as ThemeConfig
    this.applyTheme(mergedTheme)
  }

  // Method to reset to default theme
  resetToDefault() {
    this.applyDefaultTheme()
  }
}

// Export singleton instance
export const themeManager = DynamicThemeManager.getInstance()

// React hook for using theme
export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig | null>(themeManager.getTheme())
  const [isLoading, setIsLoading] = useState(themeManager.getLoadingStatus())

  useEffect(() => {
    const unsubscribe = themeManager.addThemeListener((newTheme) => {
      setTheme(newTheme)
    })

    const loadingUnsubscribe = themeManager.addSettingsListener(() => {
      setIsLoading(themeManager.getLoadingStatus())
    })

    return () => {
      unsubscribe()
      loadingUnsubscribe()
    }
  }, [])

  return {
    theme,
    isLoading,
    refresh: () => themeManager.refreshTheme(),
    primaryColor: themeManager.getPrimaryColor(),
    secondaryColor: themeManager.getSecondaryColor(),
    accentColor: themeManager.getAccentColor(),
    applyCustomTheme: (customTheme: Partial<ThemeConfig>) => themeManager.applyCustomTheme(customTheme),
    resetToDefault: () => themeManager.resetToDefault()
  }
}

// React hook for using store settings
export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(themeManager.getSettings())
  const [isLoading, setIsLoading] = useState(themeManager.getLoadingStatus())

  useEffect(() => {
    const unsubscribe = themeManager.addSettingsListener((newSettings) => {
      setSettings(newSettings)
    })

    return () => unsubscribe()
  }, [])

  return {
    settings,
    isLoading,
    refresh: () => themeManager.refreshSettings(),
    storeName: themeManager.getStoreName(),
    whatsappNumber: themeManager.getWhatsAppNumber(),
    currencySymbol: themeManager.getCurrencySymbol(),
    currencyCode: themeManager.getCurrencyCode(),
    deliveryFee: themeManager.getDeliveryFee(),
    freeShippingThreshold: themeManager.getFreeShippingThreshold(),
    isMaintenanceMode: themeManager.isMaintenanceMode(),
    maintenanceMessage: themeManager.getMaintenanceMessage(),
    businessHours: themeManager.getBusinessHours(),
    deliveryAreas: themeManager.getDeliveryAreas(),
    paymentMethods: themeManager.getPaymentMethods()
  }
}

// CSS utility functions
export function getThemeVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

export function setThemeVariable(variable: string, value: string) {
  document.documentElement.style.setProperty(variable, value)
}

// Theme validation
export function validateTheme(theme: Partial<ThemeConfig>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (theme.primary_color && !/^#[0-9A-F]{6}$/i.test(theme.primary_color)) {
    errors.push('Invalid primary color format')
  }

  if (theme.secondary_color && !/^#[0-9A-F]{6}$/i.test(theme.secondary_color)) {
    errors.push('Invalid secondary color format')
  }

  if (theme.accent_color && !/^#[0-9A-F]{6}$/i.test(theme.accent_color)) {
    errors.push('Invalid accent color format')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export default themeManager
