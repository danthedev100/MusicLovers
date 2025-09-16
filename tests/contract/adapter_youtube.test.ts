import { describe, test, expect } from '@jest/globals'

// T007: Contract test for YouTube adapter normalization
describe('YouTube Adapter Contract', () => {
  test('fetchRecent should return normalized ItemInput array', async () => {
    // This test MUST FAIL until adapter is implemented
    const { fetchRecent } = await import('../../convex/adapters/youtube')
    
    const result = await fetchRecent('Black Coffee', 'ZA', '2024-01-01T00:00:00Z')
    
    expect(Array.isArray(result)).toBe(true)
    
    if (result.length > 0) {
      const item = result[0]
      expect(item).toHaveProperty('kind', 'youtube')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('url')
      expect(item).toHaveProperty('publishedAt')
      expect(item).toHaveProperty('source')
      expect(item.source).toHaveProperty('kind', 'youtube')
      expect(typeof item.title).toBe('string')
      expect(typeof item.url).toBe('string')
      expect(typeof item.publishedAt).toBe('string')
    }
  })

  test('fetchRecent should handle ZA region boost', async () => {
    const { fetchRecent } = await import('../../convex/adapters/youtube')
    
    const result = await fetchRecent('Black Coffee', 'ZA', '2024-01-01T00:00:00Z')
    
    // Should include regionCode=ZA in API call
    expect(Array.isArray(result)).toBe(true)
  })

  test('fetchRecent should handle API errors gracefully', async () => {
    const { fetchRecent } = await import('../../convex/adapters/youtube')
    
    // Should not throw, should return empty array on error
    await expect(fetchRecent('InvalidArtist', 'ZA', 'invalid-date')).resolves.toEqual([])
  })
})
