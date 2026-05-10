import PocketBase from 'pocketbase'
import { getPocketBaseClient } from './pocketbase/client'

export interface BrandingSettings {
  id?: string
  store_name: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  whatsapp_number?: string
  email?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  social_links?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  delivery_fee: number
  currency: string
  business_hours?: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  maintenance_mode: boolean
  custom_css?: string
  favicon_url?: string
}

export const defaultBranding: BrandingSettings = {
  store_name: 'Supermarket',
  primary_color: '#2563eb',
  secondary_color: '#64748b',
  accent_color: '#f59e0b',
  delivery_fee: 5.99,
  currency: 'USD',
  business_hours: {
    monday: '8:00 AM - 10:00 PM',
    tuesday: '8:00 AM - 10:00 PM',
    wednesday: '8:00 AM - 10:00 PM',
    thursday: '8:00 AM - 10:00 PM',
    friday: '8:00 AM - 10:00 PM',
    saturday: '8:00 AM - 11:00 PM',
    sunday: '9:00 AM - 9:00 PM',
  },
  maintenance_mode: false,
}

export class BrandingManager {
  private static instance: BrandingManager
  private branding: BrandingSettings = defaultBranding
  private listeners: Array<(branding: BrandingSettings) => void> = []

  static getInstance(): BrandingManager {
    if (!BrandingManager.instance) {
      BrandingManager.instance = new BrandingManager()
    }
    return BrandingManager.instance
  }

  async loadBranding(pocketbaseUrl: string): Promise<BrandingSettings> {
    try {
      const pb = new PocketBase(pocketbaseUrl)
      pb.autoCancellation(false)
      
      const data = await pb.collection('branding_settings').getFirstListItem('', {
        expand: ''
      })

      if (data) {
        this.branding = { ...defaultBranding, ...data }
        this.notifyListeners()
      }

      return this.branding
    } catch (error) {
      console.error('Failed to load branding:', error)
      return this.branding
    }
  }

  async updateBranding(
    pocketbaseUrl: string, 
    updates: Partial<BrandingSettings>
  ): Promise<BrandingSettings> {
    try {
      const pb = new PocketBase(pocketbaseUrl)
      pb.autoCancellation(false)
      
      this.branding = { ...this.branding, ...updates }
      
      const data = await pb.collection('branding_settings').update(this.branding.id || 'default', this.branding)

      if (data) {
        this.branding = data
        this.notifyListeners()
      }

      return this.branding
    } catch (error) {
      console.error('Failed to update branding:', error)
      throw error
    }
  }

  getBranding(): BrandingSettings {
    return this.branding
  }

  subscribe(listener: (branding: BrandingSettings) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.branding))
  }

  // Generate CSS variables from branding
  generateCSSVariables(): Record<string, string> {
    return {
      '--brand-primary': this.branding.primary_color,
      '--brand-secondary': this.branding.secondary_color,
      '--brand-accent': this.branding.accent_color,
      '--brand-primary-rgb': this.hexToRgb(this.branding.primary_color),
      '--brand-secondary-rgb': this.hexToRgb(this.branding.secondary_color),
      '--brand-accent-rgb': this.hexToRgb(this.branding.accent_color),
    }
  }

  // Helper function to convert hex to RGB
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0'
  }

  // Apply branding to document
  applyToDocument(): void {
    const cssVars = this.generateCSSVariables()
    
    // Apply CSS variables to root
    const root = document.documentElement
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Update page title
    if (this.branding.store_name !== defaultBranding.store_name) {
      document.title = `${this.branding.store_name} - Fresh Groceries Delivered`
    }

    // Update favicon if provided
    if (this.branding.favicon_url) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = this.branding.favicon_url
      }
    }

    // Apply custom CSS if provided
    if (this.branding.custom_css) {
      let customStyleElement = document.getElementById('branding-custom-css') as HTMLStyleElement
      if (!customStyleElement) {
        customStyleElement = document.createElement('style')
        customStyleElement.id = 'branding-custom-css'
        document.head.appendChild(customStyleElement)
      }
      customStyleElement.textContent = this.branding.custom_css
    }
  }

  // Reset to default branding
  reset(): void {
    this.branding = { ...defaultBranding }
    this.notifyListeners()
  }
}

// Global branding manager instance
export const brandingManager = BrandingManager.getInstance()

// React hook for branding
export function useBranding() {
  const [branding, setBranding] = useState(brandingManager.getBranding())

  useEffect(() => {
    const unsubscribe = brandingManager.subscribe(setBranding)
    return unsubscribe
  }, [])

  return {
    branding,
    updateBranding: (updates: Partial<BrandingSettings>) => {
      const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL!
      return brandingManager.updateBranding(pocketbaseUrl, updates)
    },
    resetBranding: () => brandingManager.reset(),
  }
}

// Theme utilities
export const themeUtils = {
  // Get theme colors based on branding
  getThemeColors(branding: BrandingSettings) {
    return {
      primary: branding.primary_color,
      secondary: branding.secondary_color,
      accent: branding.accent_color,
      background: '#ffffff',
      foreground: '#000000',
      muted: '#f8fafc',
      'muted-foreground': '#64748b',
      border: '#e2e8f0',
      input: '#ffffff',
      ring: branding.primary_color,
    }
  },

  // Generate Tailwind CSS theme
  generateTailwindTheme(branding: BrandingSettings) {
    return {
      extend: {
        colors: {
          brand: {
            primary: branding.primary_color,
            secondary: branding.secondary_color,
            accent: branding.accent_color,
          },
        },
      },
    }
  },

  // Apply theme to Tailwind config
  applyToTailwindConfig(branding: BrandingSettings) {
    return {
      content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: this.generateTailwindTheme(branding),
      plugins: [],
    }
  },
}
