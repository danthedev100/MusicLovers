import { createHash } from 'crypto'

export type ItemKind = 'news' | 'youtube' | 'soundcloud' | 'spotify'

/**
 * Generate a consistent hash for deduplication
 * Uses SHA-1 of kind + externalId (or URL as fallback)
 */
export function generateItemHash(
  kind: ItemKind,
  externalId?: string,
  url?: string
): string {
  const identifier = externalId || url || ''
  const content = `${kind}:${identifier}`
  return createHash('sha1').update(content).digest('hex')
}

/**
 * Get TTL in minutes for each content type
 */
export function getTTLMinutes(kind: ItemKind): number {
  switch (kind) {
    case 'news':
      return 15
    case 'youtube':
      return 15
    case 'soundcloud':
      return 15
    case 'spotify':
      return 30
    default:
      return 15
  }
}

/**
 * Check if an item is stale based on its TTL
 */
export function isItemStale(item: { kind: ItemKind; createdAt: string }): boolean {
  const ttlMinutes = getTTLMinutes(item.kind)
  const createdAt = new Date(item.createdAt)
  const now = new Date()
  const ageMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
  
  return ageMinutes > ttlMinutes
}
