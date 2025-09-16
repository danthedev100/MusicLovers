import { describe, test, expect } from '@jest/globals'

// T011: Unit tests for ranking (ZA-first + recency)
describe('Ranking Logic', () => {
  test('calculateRegionScore should boost ZA domains', () => {
    // This test MUST FAIL until ranking is implemented
    const { calculateRegionScore } = require('../../lib/ranking')
    
    const itemZA = {
      source: { domain: 'news24.co.za' },
      title: 'Black Coffee releases new album',
      publishedAt: '2024-01-01T00:00:00Z'
    }
    
    const itemGlobal = {
      source: { domain: 'billboard.com' },
      title: 'Black Coffee releases new album',
      publishedAt: '2024-01-01T00:00:00Z'
    }
    
    const scoreZA = calculateRegionScore(itemZA, 'ZA')
    const scoreGlobal = calculateRegionScore(itemGlobal, 'ZA')
    
    expect(scoreZA).toBeGreaterThan(scoreGlobal)
    expect(scoreZA).toBeGreaterThanOrEqual(3) // +3 for .za domain
  })

  test('calculateRegionScore should boost South Africa mentions', () => {
    const { calculateRegionScore } = require('../../lib/ranking')
    
    const itemWithZAMention = {
      source: { domain: 'example.com' },
      title: 'Black Coffee South Africa tour announcement',
      publishedAt: '2024-01-01T00:00:00Z'
    }
    
    const itemWithoutZA = {
      source: { domain: 'example.com' },
      title: 'Black Coffee new album',
      publishedAt: '2024-01-01T00:00:00Z'
    }
    
    const scoreWithZA = calculateRegionScore(itemWithZAMention, 'ZA')
    const scoreWithoutZA = calculateRegionScore(itemWithoutZA, 'ZA')
    
    expect(scoreWithZA).toBeGreaterThan(scoreWithoutZA)
    expect(scoreWithZA).toBeGreaterThanOrEqual(1) // +1 for ZA mention
  })

  test('sortItemsByZAFirstThenRecency should order correctly', () => {
    const { sortItemsByZAFirstThenRecency } = require('../../lib/ranking')
    
    const items = [
      {
        id: '1',
        publishedAt: '2024-01-02T00:00:00Z',
        regionScore: 0,
        title: 'Global recent'
      },
      {
        id: '2',
        publishedAt: '2024-01-01T00:00:00Z',
        regionScore: 3,
        title: 'ZA older'
      },
      {
        id: '3',
        publishedAt: '2024-01-03T00:00:00Z',
        regionScore: 3,
        title: 'ZA newest'
      }
    ]
    
    const sorted = sortItemsByZAFirstThenRecency(items)
    
    // ZA items first (higher regionScore), then by recency within each band
    expect(sorted[0].id).toBe('3') // ZA newest
    expect(sorted[1].id).toBe('2') // ZA older
    expect(sorted[2].id).toBe('1') // Global recent
  })
})
