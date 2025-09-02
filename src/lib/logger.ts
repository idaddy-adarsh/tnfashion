type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  metadata?: any
  userAgent?: string
  url?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, metadata?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    if (this.isProduction && level === 'debug') return false
    return true
  }

  private logToConsole(entry: LogEntry) {
    const { level, message, timestamp, metadata } = entry
    const logMethod = console[level] || console.log

    if (metadata) {
      logMethod(`[${timestamp}] ${message}`, metadata)
    } else {
      logMethod(`[${timestamp}] ${message}`)
    }
  }

  private async logToService(entry: LogEntry) {
    if (!this.isProduction) return

    try {
      // In production, you might want to send logs to a service like:
      // - Vercel Analytics
      // - Sentry
      // - LogRocket
      // - DataDog
      // - Custom logging endpoint

      // Example: Send to your own logging API
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail - don't break the app if logging fails
      })
    } catch (error) {
      // Silently fail - don't break the app if logging fails
    }
  }

  info(message: string, metadata?: any) {
    if (!this.shouldLog('info')) return

    const entry = this.formatMessage('info', message, metadata)
    this.logToConsole(entry)
    this.logToService(entry)
  }

  warn(message: string, metadata?: any) {
    if (!this.shouldLog('warn')) return

    const entry = this.formatMessage('warn', message, metadata)
    this.logToConsole(entry)
    this.logToService(entry)
  }

  error(message: string, metadata?: any) {
    if (!this.shouldLog('error')) return

    const entry = this.formatMessage('error', message, metadata)
    this.logToConsole(entry)
    this.logToService(entry)
  }

  debug(message: string, metadata?: any) {
    if (!this.shouldLog('debug')) return

    const entry = this.formatMessage('debug', message, metadata)
    this.logToConsole(entry)
    this.logToService(entry)
  }

  // Helper method for API errors
  apiError(endpoint: string, error: any, requestData?: any) {
    this.error(`API Error: ${endpoint}`, {
      error: error.message || error,
      stack: error.stack,
      requestData,
      endpoint,
    })
  }

  // Helper method for user actions
  userAction(action: string, metadata?: any) {
    this.info(`User Action: ${action}`, metadata)
  }

  // Helper method for performance monitoring
  performance(label: string, startTime: number, metadata?: any) {
    const duration = performance.now() - startTime
    this.info(`Performance: ${label} - ${duration.toFixed(2)}ms`, {
      duration,
      ...metadata,
    })
  }
}

export const logger = new Logger()
export default logger
