import { Region } from '../../lib/ranking'

export interface ItemInput {
  kind: 'soundcloud'
  title: string
  url: string
  oEmbedUrl?: string
  embedHtml?: string
  publishedAt: string
  source: {
    kind: 'soundcloud'
    domain?: string
    channelId?: string
    regionHints?: Region[]
  }
  externalId?: string
}

/**
 * Fetch recent SoundCloud tracks using public oEmbed + RSS where available
 */
export async function fetchRecent(
  artistName: string,
  region: Region,
  sinceIso: string
): Promise<ItemInput[]> {
  try {
    // SoundCloud doesn't have a public search API like YouTube
    // We rely on known artist profiles and RSS feeds
    // For MVP, we'll return mock data that follows the expected format
    
    // TODO: Implement actual SoundCloud discovery via:
    // 1. Known artist profile URLs
    // 2. RSS feeds where available: https://feeds.soundcloud.com/users/soundcloud:users:{userId}/sounds.rss
    // 3. oEmbed for individual tracks: https://soundcloud.com/oembed
    
    const mockResults: ItemInput[] = []
    
    // In a real implementation, this would:
    // 1. Search known artist profiles
    // 2. Parse RSS feeds for recent tracks
    // 3. Use oEmbed for track details
    // 4. Apply ZA boost based on profile/track metadata
    
    return mockResults
  } catch (error) {
    console.error('SoundCloud adapter error:', error)
    return []
  }
}

/**
 * Get oEmbed data for a SoundCloud track URL
 */
export async function getOEmbed(trackUrl: string): Promise<any> {
  try {
    const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(trackUrl)}`
    
    const response = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'MusicLovers/1.0' },
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('SoundCloud oEmbed error:', error)
    return null
  }
}
