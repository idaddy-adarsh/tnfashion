import { z } from 'zod'

// Define the schema for environment variables
const envSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Authentication
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  
  // Database
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid MongoDB connection string'),
  MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME is required'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  
  // Email Configuration
  EMAIL_SERVER_HOST: z.string().min(1, 'EMAIL_SERVER_HOST is required'),
  EMAIL_SERVER_PORT: z.string().regex(/^\d+$/, 'EMAIL_SERVER_PORT must be a number'),
  EMAIL_SERVER_USER: z.string().email('EMAIL_SERVER_USER must be a valid email'),
  EMAIL_SERVER_PASSWORD: z.string().min(1, 'EMAIL_SERVER_PASSWORD is required'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email'),
  
  // Optional Admin Configuration
  ADMIN_EMAILS: z.string().optional(),
  
  // Optional Security Configuration
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
})

type EnvConfig = z.infer<typeof envSchema>

let validatedEnv: EnvConfig | null = null

export function validateEnvironmentVariables(): EnvConfig {
  if (validatedEnv) {
    return validatedEnv
  }

  try {
    validatedEnv = envSchema.parse(process.env)
    
    // Additional validation
    validateAdditionalConstraints(validatedEnv)
    
    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')
      
      throw new Error(`Environment validation failed:\n${errorMessages}`)
    }
    throw error
  }
}

function validateAdditionalConstraints(env: EnvConfig) {
  // Validate NEXTAUTH_SECRET strength
  if (env.NEXTAUTH_SECRET.length < 64) {
    console.warn('⚠️  NEXTAUTH_SECRET should be at least 64 characters for production')
  }

  // Validate email configuration
  if (env.EMAIL_SERVER_HOST === 'smtp.gmail.com' && !env.EMAIL_SERVER_PASSWORD.match(/^[a-z]{16}$/)) {
    console.warn('⚠️  For Gmail, EMAIL_SERVER_PASSWORD should be an app password (16 lowercase letters)')
  }

  // Validate production settings
  if (env.NODE_ENV === 'production') {
    if (env.NEXTAUTH_URL.includes('localhost')) {
      throw new Error('NEXTAUTH_URL cannot contain localhost in production')
    }
    
    if (!env.ENCRYPTION_KEY) {
      console.warn('⚠️  ENCRYPTION_KEY is recommended for production')
    }
  }

  // Validate MongoDB connection
  if (!env.MONGODB_URI.includes('mongodb')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string')
  }
}

// Utility functions
export function getEnv(): EnvConfig {
  if (!validatedEnv) {
    throw new Error('Environment variables not validated. Call validateEnvironmentVariables() first.')
  }
  return validatedEnv
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development'
}

export function getAdminEmails(): string[] {
  const env = getEnv()
  return env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase().trim())
}

// Database connection string helpers
export function getMongoDbUrl(): string {
  return getEnv().MONGODB_URI
}

export function getMongoDbName(): string {
  return getEnv().MONGODB_DB_NAME
}

// Email configuration helpers
export function getEmailConfig() {
  const env = getEnv()
  return {
    host: env.EMAIL_SERVER_HOST,
    port: parseInt(env.EMAIL_SERVER_PORT),
    user: env.EMAIL_SERVER_USER,
    password: env.EMAIL_SERVER_PASSWORD,
    from: env.EMAIL_FROM
  }
}

// OAuth configuration helpers
export function getGoogleOAuthConfig() {
  const env = getEnv()
  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET
  }
}

// Security configuration
export function getSecurityConfig() {
  const env = getEnv()
  return {
    secret: env.NEXTAUTH_SECRET,
    encryptionKey: env.ENCRYPTION_KEY,
    isProduction: env.NODE_ENV === 'production'
  }
}

// Initialization function to be called at app startup
export function initializeEnvironment() {
  try {
    console.log('🔍 Validating environment variables...')
    const env = validateEnvironmentVariables()
    
    console.log('✅ Environment validation passed')
    console.log(`📊 Running in ${env.NODE_ENV} mode`)
    console.log(`🔗 Auth URL: ${env.NEXTAUTH_URL}`)
    console.log(`📧 Email configured: ${env.EMAIL_FROM}`)
    
    if (env.ADMIN_EMAILS) {
      const adminCount = getAdminEmails().length
      console.log(`👑 ${adminCount} admin email${adminCount !== 1 ? 's' : ''} configured`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Environment validation failed:')
    console.error(error instanceof Error ? error.message : 'Unknown error')
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1) // Exit in production
    }
    
    return false
  }
}

// Runtime environment check
export function checkRuntimeEnvironment() {
  const checks = {
    mongodbConnection: false,
    emailConfiguration: false,
    oauthConfiguration: false,
    authSecret: false
  }

  try {
    const env = getEnv()
    
    // Check MongoDB
    checks.mongodbConnection = !!env.MONGODB_URI && !!env.MONGODB_DB_NAME
    
    // Check Email
    checks.emailConfiguration = !!(
      env.EMAIL_SERVER_HOST && 
      env.EMAIL_SERVER_PORT && 
      env.EMAIL_SERVER_USER && 
      env.EMAIL_SERVER_PASSWORD
    )
    
    // Check OAuth
    checks.oauthConfiguration = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
    
    // Check Auth Secret
    checks.authSecret = !!env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length >= 32
    
  } catch (error) {
    console.error('Runtime environment check failed:', error)
  }

  return checks
}

// Generate missing environment variables (development only)
export function generateMissingEnvVars(): Partial<Record<string, string>> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot generate env vars in production')
  }

  const missing: Partial<Record<string, string>> = {}

  if (!process.env.NEXTAUTH_SECRET) {
    missing.NEXTAUTH_SECRET = generateSecureSecret()
  }

  return missing
}

function generateSecureSecret(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Generate a secure 64-character secret
    return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  }
  
  // Fallback for older environments
  return Math.random().toString(36).substring(2) + 
         Math.random().toString(36).substring(2) + 
         Math.random().toString(36).substring(2) + 
         Date.now().toString(36)
}
