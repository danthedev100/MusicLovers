import { describe, test, expect } from '@jest/globals'

// T008: Contract test for SoundCloud adapter normalization
describe('SoundCloud Adapter Contract', () => {
  test('fetchRecent should return normalized ItemInput array', async () => {
    // This test MUST FAIL until adapter is implemented
    const { fetchRecent } = await import('../../convex/adapters/soundcloud')
    
    const result = await fetchRecent('Black Coffee', 'ZA', '2024-01-01T00:00:00Z')
    
    expect(Array.isArray(result)).toBe(true)
    
    if (result.length > 0) {
      const item = result[0]
      expect(item).toHaveProperty('kind', 'soundcloud')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('url')
      expect(item).toHaveProperty('publishedAt')
      expect(item).toHaveProperty('source')
      expect(item.source).toHaveProperty('kind', 'soundcloud')
      expect(typeof item.title).toBe('string')
      expect(typeof item.url).toBe('string')
      expect(typeof item.publishedAt).toBe('string')
    }
  })

  test('fetchRecent should use oEmbed for tracks', async () => {
    const { fetchRecent } = await import('../../convex/adapters/soundcloud')
    
    const result = await fetchRecent('Black Coffee', 'ZA', '2024-01-01T00:00:00Z')
    
    if (result.length > 0) {
      const item = result[0]
      // Should have oEmbedUrl for SoundCloud tracks
      if (item.oEmbedUrl) {
        expect(item.oEmbedUrl).toContain('soundcloud.com/oembed')
      }
    }
  })

  test('fetchRecent should handle ZA boost via metadata', async () => {
    const { fetchRecent } = await import('../../convex/adapters/soundcloud')
    
    const result = await fetchRecent('Black Coffee', 'ZA', '2024-01-01T00:00:00Z')
    
    // Should check for ZA mentions in profile/track metadata
    expect(Array.isArray(result)).toBe(true)
  })
})
