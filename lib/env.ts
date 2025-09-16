/**
 * Environment variable validation and helpers
 */

export interface EnvironmentConfig {
  youtube: {
    apiKey: string | null
    available: boolean
  }
  spotify: {
    clientId: string | null
    clientSecret: string | null
    available: boolean
  }
  admin: {
    key: string | null
    available: boolean
  }
  convex: {
    url: string | null
    available: boolean
  }
  news: {
    rssSeeds: string[]
    available: boolean
  }
}

/**
 * Get environment configuration with validation
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    youtube: {
      apiKey: process.env.YOUTUBE_API_KEY || null,
      available: !!(process.env.YOUTUBE_API_KEY),
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID || null,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || null,
      available: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
    },
    admin: {
      key: process.env.SERVER_ADMIN_KEY || null,
      available: !!(process.env.SERVER_ADMIN_KEY),
    },
    convex: {
      url: process.env.NEXT_PUBLIC_CONVEX_URL || null,
      available: !!(process.env.NEXT_PUBLIC_CONVEX_URL),
    },
    news: {
      rssSeeds: process.env.NEWS_RSS_SEEDS 
        ? process.env.NEWS_RSS_SEEDS.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      available: true, // News via Google RSS doesn't require API key
    },
  }
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const config = getEnvironmentConfig()
  const errors: string[] = []
  
  // Check critical services
  if (!config.convex.available) {
    errors.push('NEXT_PUBLIC_CONVEX_URL is required for database connectivity')
  }
  
  // Warn about missing but non-critical services
  const warnings: string[] = []
  
  if (!config.youtube.available) {
    warnings.push('YOUTUBE_API_KEY not configured - YouTube features will be disabled')
  }
  
  if (!config.spotify.available) {
    warnings.push('Spotify credentials not configured - Spotify features will be disabled')
  }
  
  if (!config.admin.available) {
    warnings.push('SERVER_ADMIN_KEY not configured - Admin features will be disabled')
  }
  
  // Log warnings
  warnings.forEach(warning => console.warn(`Environment warning: ${warning}`))
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get available data sources based on environment
 */
export function getAvailableDataSources(): string[] {
  const config = getEnvironmentConfig()
  const sources: string[] = []
  
  if (config.youtube.available) sources.push('youtube')
  if (config.spotify.available) sources.push('spotify')
  if (config.news.available) sources.push('news')
  
  // SoundCloud uses public APIs, so it's always available
  sources.push('soundcloud')
  
  return sources
}

/**
 * Check if a specific service is configured
 */
export function isServiceAvailable(service: keyof EnvironmentConfig): boolean {
  const config = getEnvironmentConfig()
  return config[service].available
}

/**
 * Get health check info for monitoring
 */
export function getHealthInfo() {
  const config = getEnvironmentConfig()
  const validation = validateEnvironment()
  
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      youtube: config.youtube.available ? 'configured' : 'missing',
      spotify: config.spotify.available ? 'configured' : 'missing',
      soundcloud: 'available', // Public APIs
      news: 'available', // Google News RSS
      admin: config.admin.available ? 'configured' : 'missing',
      convex: config.convex.available ? 'configured' : 'missing',
    },
    validation: {
      valid: validation.valid,
      errors: validation.errors,
    },
    dataSources: getAvailableDataSources(),
  }
}
