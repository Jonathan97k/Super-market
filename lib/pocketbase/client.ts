import PocketBase from 'pocketbase'

// Environment variable validation
const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL

export interface PocketBaseConfig {
  url: string
  isValid: boolean
  error?: string
}

/**
 * Validates PocketBase environment variables
 */
export function validatePocketBaseConfig(): PocketBaseConfig {
  if (!pocketbaseUrl) {
    return {
      url: '',
      isValid: false,
      error: 'Missing PocketBase configuration. Please set NEXT_PUBLIC_POCKETBASE_URL environment variable.'
    }
  }

  // Validate URL format
  try {
    const url = new URL(pocketbaseUrl)
    if (!url.protocol.includes('http') && !url.protocol.includes('https')) {
      return {
        url: '',
        isValid: false,
        error: 'Invalid PocketBase URL format. URL must start with http:// or https://'
      }
    }
  } catch {
    return {
      url: '',
      isValid: false,
      error: 'Invalid PocketBase URL format. Please check your NEXT_PUBLIC_POCKETBASE_URL environment variable.'
    }
  }

  return {
    url: pocketbaseUrl,
    isValid: true
  }
}

/**
 * Creates a PocketBase client with proper error handling
 */
export function createPocketBaseClient() {
  const config = validatePocketBaseConfig()

  if (!config.isValid) {
    console.warn('PocketBase configuration warning:', config.error, '— falling back to http://127.0.0.1:8090')
    const pb = new PocketBase('http://127.0.0.1:8090')
    pb.autoCancellation(false)
    return pb
  }

  const pb = new PocketBase(config.url)

  // Auto-refresh auth token
  pb.autoCancellation(false)

  return pb
}

/**
 * Singleton PocketBase client instance
 */
let pocketbaseClient: ReturnType<typeof createPocketBaseClient> | null = null

export function getPocketBaseClient() {
  if (!pocketbaseClient) {
    pocketbaseClient = createPocketBaseClient()
  }
  return pocketbaseClient
}

/**
 * Check if PocketBase is properly configured
 */
export function isPocketBaseConfigured(): boolean {
  return validatePocketBaseConfig().isValid
}

/**
 * Get PocketBase configuration status for UI display
 */
export function getPocketBaseStatus() {
  const config = validatePocketBaseConfig()
  
  return {
    isConfigured: config.isValid,
    error: config.error,
    hasUrl: !!pocketbaseUrl,
    urlPreview: pocketbaseUrl ? pocketbaseUrl.replace(/https?:\/\/([^\.]+).*/, 'https://$1') : null
  }
}

// Export the default client instance
export const pocketbase = getPocketBaseClient()
