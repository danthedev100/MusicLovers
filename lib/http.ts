interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  circuitBreakerKey?: string
}

interface CircuitBreakerState {
  failures: number
  lastFailure: number
  state: 'closed' | 'open' | 'half-open'
}

// Simple circuit breaker state management
const circuitBreakers = new Map<string, CircuitBreakerState>()

const CIRCUIT_BREAKER_THRESHOLD = 5 // failures before opening
const CIRCUIT_BREAKER_TIMEOUT = 60000 // 1 minute
const DEFAULT_TIMEOUT = 8000 // 8 seconds
const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_DELAY = 1000 // 1 second

/**
 * Enhanced fetch with timeout, retries, and circuit breaker
 */
export async function fetchWithResilience(
  url: string, 
  options: RequestOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    circuitBreakerKey,
    ...fetchOptions
  } = options

  // Check circuit breaker
  if (circuitBreakerKey) {
    const breaker = getCircuitBreakerState(circuitBreakerKey)
    
    if (breaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - breaker.lastFailure
      if (timeSinceLastFailure < CIRCUIT_BREAKER_TIMEOUT) {
        throw new Error(`Circuit breaker open for ${circuitBreakerKey}`)
      }
      // Move to half-open state
      breaker.state = 'half-open'
    }
  }

  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after')
        const delay = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : Math.min(retryDelay * Math.pow(2, attempt), 30000) // Max 30s
        
        if (attempt < retries) {
          console.warn(`Rate limited, retrying after ${delay}ms`)
          await sleep(delay)
          continue
        }
      }
      
      // Handle server errors with exponential backoff
      if (response.status >= 500 && attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000 // Jitter
        console.warn(`Server error ${response.status}, retrying after ${delay}ms`)
        await sleep(delay)
        continue
      }
      
      // Success - reset circuit breaker
      if (circuitBreakerKey) {
        resetCircuitBreaker(circuitBreakerKey)
      }
      
      return response
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Record failure for circuit breaker
      if (circuitBreakerKey) {
        recordCircuitBreakerFailure(circuitBreakerKey)
      }
      
      // Don't retry on timeout or abort
      if (lastError.name === 'AbortError' || lastError.message.includes('timeout')) {
        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000
          console.warn(`Request timeout, retrying after ${delay}ms`)
          await sleep(delay)
          continue
        }
      }
      
      // Final attempt failed
      if (attempt === retries) {
        break
      }
      
      // Exponential backoff with jitter
      const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000
      await sleep(delay)
    }
  }
  
  throw lastError || new Error('All retry attempts failed')
}

/**
 * Convenience function for JSON requests
 */
export async function fetchJson<T>(
  url: string, 
  options: RequestOptions = {}
): Promise<T> {
  const response = await fetchWithResilience(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * Get or create circuit breaker state
 */
function getCircuitBreakerState(key: string): CircuitBreakerState {
  if (!circuitBreakers.has(key)) {
    circuitBreakers.set(key, {
      failures: 0,
      lastFailure: 0,
      state: 'closed',
    })
  }
  return circuitBreakers.get(key)!
}

/**
 * Record a failure for the circuit breaker
 */
function recordCircuitBreakerFailure(key: string) {
  const breaker = getCircuitBreakerState(key)
  breaker.failures++
  breaker.lastFailure = Date.now()
  
  if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    breaker.state = 'open'
    console.warn(`Circuit breaker opened for ${key} after ${breaker.failures} failures`)
  }
}

/**
 * Reset circuit breaker on success
 */
function resetCircuitBreaker(key: string) {
  const breaker = getCircuitBreakerState(key)
  breaker.failures = 0
  breaker.state = 'closed'
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
  return Object.fromEntries(circuitBreakers.entries())
}
