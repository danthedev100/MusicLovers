import { NextResponse } from 'next/server'
import { getHealthInfo, validateEnvironment } from '@/lib/env'

export async function GET() {
  try {
    const health = getHealthInfo()
    const validation = validateEnvironment()
    
    // Basic health check - return 200 if core services are available
    const status = validation.valid ? 'ok' : 'degraded'
    const httpStatus = validation.valid ? 200 : 503
    
    return NextResponse.json(
      {
        status,
        ...health,
      },
      { status: httpStatus }
    )
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
