export type Region = 'ZA' | 'UK' | 'EU' | 'GLOBAL'

export interface RankableItem {
  source: {
    domain?: string
  }
  title: string
  publishedAt: string
}

export interface RankedItem {
  id: string
  publishedAt: string
  regionScore: number
  title: string
}

/**
 * Calculate region score for ZA-first ranking
 * +3 for .za domain
 * +2 for ZA market/region API parameter
 * +1 for "South Africa"/"ZA" mentions in title/description
 */
export function calculateRegionScore(
  item: RankableItem,
  targetRegion: Region,
  apiRegion?: string
): number {
  if (targetRegion !== 'ZA') {
    return 0 // No regional boost for non-ZA regions
  }

  let score = 0

  // +3 for .za domain
  if (item.source.domain?.endsWith('.za')) {
    score += 3
  }

  // +2 for ZA market/region from API
  if (apiRegion === 'ZA') {
    score += 2
  }

  // +1 for South Africa mentions (case-insensitive)
  const text = item.title.toLowerCase()
  if (text.includes('south africa') || text.includes(' za ') || text.includes(' za,')) {
    score += 1
  }

  return score
}

/**
 * Sort items by ZA-first ranking: regionScore desc, then publishedAt desc
 */
export function sortItemsByZAFirstThenRecency(items: RankedItem[]): RankedItem[] {
  return [...items].sort((a, b) => {
    // First by region score (higher = more relevant to ZA)
    if (a.regionScore !== b.regionScore) {
      return b.regionScore - a.regionScore
    }
    
    // Then by recency (newer first)
    const dateA = new Date(a.publishedAt)
    const dateB = new Date(b.publishedAt)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Filter items by recency window
 */
export function filterByRecencyWindow(
  items: { publishedAt: string }[],
  window: '24h' | '7d' | '30d'
): typeof items {
  const now = new Date()
  let cutoffDate: Date

  switch (window) {
    case '24h':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      return items
  }

  return items.filter(item => {
    const publishedDate = new Date(item.publishedAt)
    return publishedDate >= cutoffDate
  })
}
