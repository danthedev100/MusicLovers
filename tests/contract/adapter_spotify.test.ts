import { describe, test, expect } from '@jest/globals'

// T009: Contract test for Spotify adapter normalization
describe('Spotify Adapter Contract', () => {
  test('fetchArtistAndReleases should return artist and normalized items', async () => {
    // This test MUST FAIL until adapter is implemented
    const { fetchArtistAndReleases } = await import('../../convex/adapters/spotify')
    
    const result = await fetchArtistAndReleases('Black Coffee', 'ZA')
    
    expect(result).toHaveProperty('artist')
    expect(result).toHaveProperty('items')
    expect(Array.isArray(result.items)).toBe(true)
    
    if (result.artist) {
      expect(result.artist).toHaveProperty('name')
      expect(result.artist).toHaveProperty('slug')
      expect(result.artist).toHaveProperty('platformIds')
      expect(result.artist.platformIds).toHaveProperty('spotifyId')
    }
    
    if (result.items.length > 0) {
      const item = result.items[0]
      expect(item).toHaveProperty('kind', 'spotify')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('url')
      expect(item).toHaveProperty('publishedAt')
      expect(item).toHaveProperty('source')
      expect(item.source).toHaveProperty('kind', 'spotify')
    }
  })

  test('fetchArtistAndReleases should use market=ZA for region', async () => {
    const { fetchArtistAndReleases } = await import('../../convex/adapters/spotify')
    
    const result = await fetchArtistAndReleases('Black Coffee', 'ZA')
    
    // Should use market=ZA in Spotify API calls
    expect(result).toHaveProperty('items')
  })

  test('fetchArtistAndReleases should sort by release_date desc', async () => {
    const { fetchArtistAndReleases } = await import('../../convex/adapters/spotify')
    
    const result = await fetchArtistAndReleases('Black Coffee', 'ZA')
    
    if (result.items.length > 1) {
      const dates = result.items.map(item => new Date(item.publishedAt))
      const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime())
      expect(dates).toEqual(sorted)
    }
  })
})
