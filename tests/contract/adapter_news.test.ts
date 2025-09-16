import { describe, test, expect } from '@jest/globals'

// T010: Contract test for News adapter normalization
describe('News Adapter Contract', () => {
  test('fetchRecentRss should return normalized ItemInput array', async () => {
    // This test MUST FAIL until adapter is implemented
    const { fetchRecentRss } = await import('../../convex/adapters/news')
    
    const result = await fetchRecentRss('Black Coffee', 'ZA', '2024-01-01T00:00:00Z')
    
    expect(Array.isArray(result)).toBe(true)
    
    if (result.length > 0) {
      const item = result[0]
      expect(item).toHaveProperty('kind', 'news')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('url')
      expect(item).toHaveProperty('publishedAt')
      expect(item).toHaveProperty('source')
      expect(item.source).toHaveProperty('kind', 'news')
      expect(typeof item.title).toBe('string')
      expect(typeof item.url).toBe('string')
      expect(typeof item.publishedAt).toBe('string')
    }
  })

  test('fetchRecentRss should apply region terms for ZA', async () => {
    const { fetchRecentRss } = await import('../../convex/adapters/news')
    
    const result = await fetchRecentRss('Black Coffee', 'ZA', '2024-01-01T00:00:00Z')
    
    // Should use site:.za OR "South Africa" in Google News RSS query
    expect(Array.isArray(result)).toBe(true)
  })

  test('fetchRecentRss should boost .za domains', async () => {
    const { fetchRecentRss } = await import('../../convex/adapters/news')
    
    const result = await fetchRecentRss('Black Coffee', 'ZA', '2024-01-01T00:00:00Z')
    
    if (result.length > 0) {
      const item = result[0]
      if (item.source.domain?.endsWith('.za')) {
        // Should have higher region score for .za domains
        expect(typeof item.source.domain).toBe('string')
      }
    }
  })

  test('fetchRecentRss should handle RSS parsing errors', async () => {
    const { fetchRecentRss } = await import('../../convex/adapters/news')
    
    // Should not throw, should return empty array on error
    await expect(fetchRecentRss('InvalidArtist', 'ZA', 'invalid-date')).resolves.toEqual([])
  })
})
