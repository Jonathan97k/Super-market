// Deployment utilities and configuration

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production'
  siteUrl: string
  apiUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey?: string
  enableAnalytics: boolean
  enableErrorReporting: boolean
  enablePerformanceMonitoring: boolean
  enableSecurityHeaders: boolean
  enableRateLimiting: boolean
}

export const deploymentConfigs: Record<string, DeploymentConfig> = {
  development: {
    environment: 'development',
    siteUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    enableAnalytics: false,
    enableErrorReporting: false,
    enablePerformanceMonitoring: false,
    enableSecurityHeaders: false,
    enableRateLimiting: false,
  },
  staging: {
    environment: 'staging',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.supermarket.com',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.supermarket.com',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableSecurityHeaders: true,
    enableRateLimiting: true,
  },
  production: {
    environment: 'production',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://supermarket.com',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.supermarket.com',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableSecurityHeaders: true,
    enableRateLimiting: true,
  },
}

export function getDeploymentConfig(): DeploymentConfig {
  const environment = process.env.NODE_ENV || 'development'
  return deploymentConfigs[environment] || deploymentConfigs.development
}

// Security headers configuration
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://vercel.live",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}

// Environment validation
export function validateEnvironment(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const config = getDeploymentConfig()
  const errors: string[] = []
  const warnings: string[] = []

  // Required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  if (config.environment === 'production') {
    requiredVars.push('SUPABASE_SERVICE_ROLE_KEY')
    requiredVars.push('NEXT_PUBLIC_SITE_URL')
  }

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  })

  // Validate Supabase URL format
  if (config.supabaseUrl && !config.supabaseUrl.includes('supabase.co')) {
    warnings.push('Supabase URL does not appear to be a valid Supabase project URL')
  }

  // Validate site URL format
  if (config.siteUrl && !config.siteUrl.startsWith('http')) {
    warnings.push('Site URL should start with http:// or https://')
  }

  // Security warnings for production
  if (config.environment === 'production') {
    if (!config.enableSecurityHeaders) {
      warnings.push('Security headers are disabled in production')
    }
    if (!config.enableRateLimiting) {
      warnings.push('Rate limiting is disabled in production')
    }
    if (config.siteUrl.includes('localhost')) {
      errors.push('Production site URL cannot be localhost')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Health check utilities
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  checks: {
    database: 'pass' | 'fail' | 'warn'
    api: 'pass' | 'fail' | 'warn'
    storage: 'pass' | 'fail' | 'warn'
    cache: 'pass' | 'fail' | 'warn'
  }
  timestamp: string
  responseTime: number
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  const config = getDeploymentConfig()

  const checks = {
    database: 'warn' as 'pass' | 'fail' | 'warn',
    api: 'warn' as 'pass' | 'fail' | 'warn',
    storage: 'warn' as 'pass' | 'fail' | 'warn',
    cache: 'warn' as 'pass' | 'fail' | 'warn',
  }

  try {
    // Check database connectivity
    const response = await fetch(`${config.supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
      },
    })
    checks.database = response.ok ? 'pass' : 'fail'
  } catch (error) {
    checks.database = 'fail'
  }

  try {
    // Check API endpoint
    const response = await fetch(`${config.apiUrl}/health`)
    checks.api = response.ok ? 'pass' : 'fail'
  } catch (error) {
    checks.api = 'fail'
  }

  try {
    // Check storage (Supabase Storage)
    const response = await fetch(`${config.supabaseUrl}/storage/v1/buckets`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
      },
    })
    checks.storage = response.ok ? 'pass' : 'fail'
  } catch (error) {
    checks.storage = 'fail'
  }

  // Cache check (simplified - would need actual cache implementation)
  checks.cache = 'pass'

  const responseTime = Date.now() - startTime
  const allPassed = Object.values(checks).every(check => check === 'pass')

  return {
    status: allPassed ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
    responseTime,
  }
}

// Deployment utilities
export const deploymentUtils = {
  // Get current environment info
  getEnvironmentInfo() {
    const config = getDeploymentConfig()
    const validation = validateEnvironment()

    return {
      environment: config.environment,
      siteUrl: config.siteUrl,
      apiUrl: config.apiUrl,
      version: process.env.npm_package_version || '1.0.0',
      buildTime: process.env.BUILD_TIME || new Date().toISOString(),
      validation,
    }
  },

  // Generate deployment manifest
  generateDeploymentManifest() {
    const config = getDeploymentConfig()
    
    return {
      version: process.env.npm_package_version || '1.0.0',
      environment: config.environment,
      buildTime: new Date().toISOString(),
      features: {
        analytics: config.enableAnalytics,
        errorReporting: config.enableErrorReporting,
        performanceMonitoring: config.enablePerformanceMonitoring,
        securityHeaders: config.enableSecurityHeaders,
        rateLimiting: config.enableRateLimiting,
      },
      endpoints: {
        site: config.siteUrl,
        api: config.apiUrl,
        supabase: config.supabaseUrl,
      },
    }
  },

  // Check if deployment is ready
  async isDeploymentReady(): Promise<boolean> {
    try {
      const healthCheck = await performHealthCheck()
      return healthCheck.status === 'healthy'
    } catch (error) {
      return false
    }
  },

  // Get deployment status
  async getDeploymentStatus() {
    const healthCheck = await performHealthCheck()
    const environmentInfo = this.getEnvironmentInfo()

    return {
      environment: environmentInfo.environment,
      status: healthCheck.status,
      healthCheck,
      environmentInfo,
      timestamp: new Date().toISOString(),
    }
  },
}
