import { NextRequest, NextResponse } from 'next/server'
import { validateApiAdminSession } from '@/lib/session'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'
import { getUserAuditLogs, getAuthStats, getFailedLoginAttempts } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.general,
    'admin-auth-logs',
    async () => {
      const sessionValidation = await validateApiAdminSession(request)
      
      if (sessionValidation.error) {
        return NextResponse.json(
          { success: false, error: sessionValidation.error },
          { status: sessionValidation.status }
        )
      }

      try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'recent'
        const userId = searchParams.get('userId')
        const email = searchParams.get('email')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = parseInt(searchParams.get('skip') || '0')

        let data: any

        switch (type) {
          case 'stats':
            data = await getAuthStats()
            break

          case 'user':
            if (!userId) {
              return NextResponse.json(
                { success: false, error: 'User ID required for user logs' },
                { status: 400 }
              )
            }
            data = await getUserAuditLogs(userId, limit, skip)
            break

          case 'failed':
            if (!email) {
              return NextResponse.json(
                { success: false, error: 'Email required for failed login logs' },
                { status: 400 }
              )
            }
            data = await getFailedLoginAttempts(email)
            break

          default:
            // Recent logs - implement this in audit-log.ts
            data = []
        }

        return NextResponse.json({
          success: true,
          data,
          pagination: type === 'user' ? {
            limit,
            skip,
            hasMore: data.length === limit
          } : undefined
        })

      } catch (error) {
        console.error('Admin auth logs error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch auth logs' },
          { status: 500 }
        )
      }
    }
  )
}
