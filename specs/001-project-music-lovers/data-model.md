# Phase 1 — Data Model

## Entities

### Artist
- id: string
- name: string
- slug: string
- imageUrl?: string
- platformIds:
  - spotifyId?: string
  - youtubeChannelId?: string
- createdAt: ISO string

### Source
- id: string
- kind: 'news' | 'youtube' | 'soundcloud' | 'spotify'
- regionHints: 'ZA' | 'UK' | 'EU' | 'GLOBAL' []
- domain?: string
- channelId?: string
- createdAt: ISO string

### Item
- id: string
- artistId: string
- sourceId: string
- kind: 'news' | 'youtube' | 'soundcloud' | 'spotify'
- title: string
- url: string
- embedHtml?: string
- oEmbedUrl?: string
- publishedAt: ISO string
- regionScore: number
- pinned: boolean
- note?: string
- hash: string
- createdAt: ISO string

## Validation Rules
- `slug` must be URL-safe; unique per artist.
- `hash` = sha1(kind + externalId|url); unique per artist + kind.
- `publishedAt` must be a valid ISO timestamp.
- `regionScore` is derived; non-negative.
- Items must link to original `url` and include clear source attribution.

## Relationships
- Artist 1..* Item
- Source 1..* Item
- Item belongs to exactly one Artist and one Source
