import { Region } from '../../lib/ranking'

export interface ItemInput {
  kind: 'youtube'
  title: string
  url: string
  oEmbedUrl?: string
  embedHtml?: string
  publishedAt: string
  source: {
    kind: 'youtube'
    domain?: string
    channelId?: string
    regionHints?: Region[]
  }
  externalId?: string
}

/**
 * Fetch recent YouTube videos for an artist using YouTube Data API v3
 */
export async function fetchRecent(
  artistName: string,
  region: Region,
  sinceIso: string
): Promise<ItemInput[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      console.warn('YouTube API key not configured')
      return []
    }

    // Build search query with region parameters
    const params = new URLSearchParams({
      part: 'snippet',
      q: artistName,
      type: 'video',
      order: 'date',
      publishedAfter: sinceIso,
      maxResults: '25',
      safeSearch: 'none',
      fields: 'items(id/videoId,snippet(title,publishedAt,channelId,channelTitle))',
      key: apiKey,
    })

    // Add region code if not global
    if (region !== 'GLOBAL') {
      const regionCodes = { ZA: 'ZA', UK: 'GB', EU: 'DE' }
      params.set('regionCode', regionCodes[region] || 'ZA')
    }

    const { fetchWithResilience } = await import('../../lib/http')
    
    const response = await fetchWithResilience(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      {
        headers: { 'User-Agent': 'MusicLovers/1.0' },
        circuitBreakerKey: 'youtube-api',
        timeout: 8000,
        retries: 2,
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('YouTube API rate limit exceeded')
      } else {
        console.error('YouTube API error:', response.status, response.statusText)
      }
      return []
    }

    const data = await response.json()
    
    if (!data.items || !Array.isArray(data.items)) {
      return []
    }

    // Transform to normalized format
    return data.items.map((item: any): ItemInput => {
      const videoId = item.id?.videoId
      const snippet = item.snippet || {}
      
      return {
        kind: 'youtube',
        title: snippet.title || 'Untitled Video',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        oEmbedUrl: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        source: {
          kind: 'youtube',
          domain: 'youtube.com',
          channelId: snippet.channelId,
          regionHints: region !== 'GLOBAL' ? [region] : [],
        },
        externalId: videoId,
      }
    })
  } catch (error) {
    console.error('YouTube adapter error:', error)
    return []
  }
}
