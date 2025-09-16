# Contracts — Functions & Adapters

## Convex Functions (server)
- artists.searchByName(name: string) → { candidates: { id?: string; name: string; imageUrl?: string }[] }
- artists.getBySlug(slug: string) → Artist | null
- items.listByArtist(artistId: string, filters: { region: Region; window: RecencyWindow; sort: 'newest' }) → Item[]
- items.refreshArtist(artistId: string) → { updated: number; sources: Record<string, { ok: boolean; count: number; error?: string }> }
- admin.pinItem(itemId: string, pinned: boolean) → { ok: true }
- admin.addNote(itemId: string, note: string) → { ok: true }
- cron.refreshRecentlyViewed() → { refreshed: number }

## Adapters (pure functions)
- adapter.youtube.fetchRecent(artistName: string, region: Region, sinceIso: string) → ItemInput[]
- adapter.soundcloud.fetchRecent(artistName: string, region: Region, sinceIso: string) → ItemInput[]
- adapter.spotify.fetchArtistAndReleases(artistName: string, region: Region) → { artist?: Artist; items: ItemInput[] }
- adapter.news.fetchRecentRss(artistName: string, region: Region, sinceIso: string) → ItemInput[]

### Types
- Region = 'ZA' | 'UK' | 'EU' | 'GLOBAL'
- RecencyWindow = '24h' | '7d' | '30d'
- ItemInput = { kind: ItemKind; title: string; url: string; oEmbedUrl?: string; embedHtml?: string; publishedAt: string; source: { kind: ItemKind; domain?: string; channelId?: string; regionHints?: Region[] }; externalId?: string }
- ItemKind = 'news' | 'youtube' | 'soundcloud' | 'spotify'
