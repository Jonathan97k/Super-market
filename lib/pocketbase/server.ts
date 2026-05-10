import PocketBase from 'pocketbase'
import { cookies } from 'next/headers'

// Environment variable validation for server-side
const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
const pocketbaseAdminEmail = process.env.POCKETBASE_ADMIN_EMAIL
const pocketbaseAdminPassword = process.env.POCKETBASE_ADMIN_PASSWORD

export interface ServerPocketBaseConfig {
  url: string
  adminEmail?: string
  adminPassword?: string
  isValid: boolean
  error?: string
}

/**
 * Validates server-side PocketBase environment variables
 */
export function validateServerPocketBaseConfig(): ServerPocketBaseConfig {
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
    adminEmail: pocketbaseAdminEmail,
    adminPassword: pocketbaseAdminPassword,
    isValid: true
  }
}

/**
 * Creates a server-side PocketBase client with session management
 */
export function createServerPocketBaseClient() {
  const config = validateServerPocketBaseConfig()

  const url = config.isValid ? config.url : 'http://127.0.0.1:8090'
  if (!config.isValid) {
    console.warn('Server PocketBase configuration warning:', config.error, '— falling back to', url)
  }

  const cookieStore = cookies()
  const pb = new PocketBase(url)

  // Load auth token from cookies
  const authCookie = cookieStore.get('pb_auth')
  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie.value)
  }

  pb.autoCancellation(false)

  return pb
}

/**
 * Creates a server-side PocketBase client with admin credentials for admin operations
 */
export function createAdminPocketBaseClient() {
  const config = validateServerPocketBaseConfig()
  
  if (!config.isValid) {
    console.error('Admin PocketBase configuration error:', config.error)
    throw new Error(config.error)
  }

  if (!config.adminEmail || !config.adminPassword) {
    throw new Error('POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD are required for admin operations')
  }

  const pb = new PocketBase(config.url)
  
  // Authenticate as admin
  return pb.collection('users').authWithPassword(config.adminEmail, config.adminPassword).then(() => {
    pb.autoCancellation(false)
    return pb
  })
}

/**
 * Check if server-side PocketBase is properly configured
 */
export function isServerPocketBaseConfigured(): boolean {
  return validateServerPocketBaseConfig().isValid
}

/**
 * Get server-side PocketBase configuration status
 */
export function getServerPocketBaseStatus() {
  const config = validateServerPocketBaseConfig()
  
  return {
    isConfigured: config.isValid,
    error: config.error,
    hasUrl: !!pocketbaseUrl,
    hasAdminEmail: !!pocketbaseAdminEmail,
    hasAdminPassword: !!pocketbaseAdminPassword,
    urlPreview: pocketbaseUrl ? pocketbaseUrl.replace(/https?:\/\/([^\.]+).*/, 'https://$1') : null
  }
}

/**
 * Singleton server-side PocketBase client instances
 */
let adminPocketbaseClient: ReturnType<typeof createAdminPocketBaseClient> | null = null

export function getServerPocketBaseClient() {
  return createServerPocketBaseClient()
}

export async function getAdminPocketBaseClient() {
  if (!adminPocketbaseClient) {
    adminPocketbaseClient = createAdminPocketBaseClient()
  }
  return adminPocketbaseClient
}
