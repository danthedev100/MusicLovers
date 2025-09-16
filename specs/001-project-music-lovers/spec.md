# Feature Specification: Music Lovers — Artist Search & Unified Feed

**Feature Branch**: `001-project-music-lovers`  
**Created**: 2025-09-16  
**Status**: Draft  
**Input**: User description: "Project: Music Lovers— community music discovery (non-commercial). Objective: Search an artist (e.g., Black Coffee, DJ Poizen) and surface the latest news, YouTube interviews, SoundCloud uploads, and Spotify releases. Clean, fast, sleek + modern UI; fun to use, but not playful/childish. Why: Music updates are scattered; provide a single place using free/official APIs or public RSS/oEmbed; no scraping behind auth, no downloads. V1 Goals: artist search (type-ahead, fuzzy); per-artist unified feed with tabs/filters (All | News | YouTube | SoundCloud | Spotify); recency filters (24h/7d/30d); sort newest; regional narrowing with ZA/UK/EU/Global and default priority ZA; light curation (pin/unpin, editor notes); lightweight social share (copy link, no trackers). Non-Goals: user accounts, comments, ratings/playlists; native apps (PWA baseline only); audio/file downloading or re-hosting; alias mapping/disambiguation. Success Criteria: artist page loads < 2.5s TTI on a mid-range phone; new items within ≤15m; at least one playable/embed when permitted; Lighthouse ≥ 90; all items link to source; no paid data sources. Tech & Architecture: Next.js 15 + TypeScript (strict) + Tailwind CSS v4 + shadcn/ui + Lucide; Framer Motion sparingly; Convex backend; Vercel hosting; no auth (admin key-gated). Data Sources (Free Only): YouTube Data API + oEmbed; SoundCloud public oEmbed + profile RSS; Spotify Web API Client Credentials; News via Google News RSS with region keywords. Region & Ranking Rules: ZA/UK/EU/Global filters; ZA boosts; then recency; narrow queries per region; no alias logic. Data Model (Convex): artists, sources, items; dedup by hash; TTLs 15m/15m/15m/30m. Caching & Freshness: serve from cache; background refresh; cron 10–15m; rate-limit/backoff. Pages: /, /artist/[slug], /admin. UI/UX: sleek, minimal, accessible; shadcn/ui; responsive lazy embeds. Performance: TTFB ≤ 400ms, LCP ≤ 2.5s, CLS ≈ 0; Next/Image; defer iframes. Security: server-side keys; ToS compliance; minimal telemetry. Risks: quotas; ambiguous names; regional variance. Deliverables: Data-Source Matrix; diagrams; acceptance tests; milestones."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## User Scenarios & Testing (mandatory)

### Primary User Story
As a music fan, I search for an artist (e.g., "Black Coffee") and immediately see a clean, unified feed of timely items across News, YouTube, SoundCloud, and Spotify, with quick filters for region and time window, the ability to sort by newest, and lightweight sharing. Editors can pin items and add short notes.

### Acceptance Scenarios
1. Given the home page, when I type "Black Coffee" and select from type-ahead, then I see the artist page within 2.5s TTI on a mid-range mobile phone.
2. Given an artist page with mixed items, when I switch tabs to YouTube, then only YouTube videos are shown, sorted newest first.
3. Given Region = ZA, when items exist with .za domains or ZA market/metadata, then those items appear boosted above equally recent global items; within each band, newest first.
4. Given Time = 7d, when I view the All tab, then only items published within the last 7 days are shown.
5. Given an editor pin, when I open the artist page, then pinned items appear at the top of All (and their source tab) with a subtle "Pinned" badge and optional note.
6. Given a slow third-party provider, when its request times out, then I still see partial results from other providers, with a non-blocking notice and a retry option.
7. Given embed restrictions, when a platform permits oEmbed/preview, then at least one playable/embed is available in the feed; otherwise a link card is shown.
8. Given the share action, when I click "Copy link", then a canonical, shareable URL to the current artist view is copied with a confirmation toast and no trackers.

### Edge Cases
- Ambiguous artist names return multiple candidates; user selects the intended one (no alias mapping in V1).
- No results in selected time window → show empty state with quick toggles to expand window/region.
- API rate limits or partial outages → show partial results with per-source notices; auto-retry with backoff.
- Mixed regions → ZA boost applies first, then recency; when Region filter is Global, show pure recency.
- Duplicate links across sources → deduplicated via content hash; show the most authoritative source.

## Requirements (mandatory)

### Functional Requirements
- FR-001: Users MUST be able to search artists with type-ahead and fuzzy matching.
- FR-002: System MUST render a per-artist unified feed with tabs: All | News | YouTube | SoundCloud | Spotify.
- FR-003: System MUST support recency filters: 24h, 7d, 30d; default to 7d.
- FR-004: System MUST support sort by newest first within the selected window.
- FR-005: System MUST support Region filters: ZA, UK, EU, Global; default ordering prioritizes ZA.
- FR-006: System MUST apply ZA-first ranking: boost items with .za domains or ZA market/metadata, then apply recency.
- FR-007: System MUST provide lightweight social share via copyable canonical links; no trackers.
- FR-008: Editors MUST be able to pin/unpin items and add short server-stored notes.
- FR-009: System MUST display at least one playable/embed per platform when allowed; otherwise link cards.
- FR-010: System MUST show partial results when any provider fails or times out, with per-source status.
- FR-011: System MUST refresh stale data in the background and notify "New items available" when updated.
- FR-012: System MUST deduplicate items by a content hash derived from kind + externalId|url.
- FR-013: System MUST respect TTLs: News 15m; YouTube 15m; SoundCloud 15m; Spotify 30m.
- FR-014: System MUST meet performance budgets on mobile: TTFB ≤ 400ms, LCP ≤ 2.5s, CLS ≈ 0.
- FR-015: System MUST meet Lighthouse ≥ 90 across Performance, Accessibility, Best Practices, and SEO.
- FR-016: System MUST meet accessibility (WCAG AA), including keyboard nav, visible focus, and alt/aria for embeds.
- FR-017: System MUST use only free/official APIs or public RSS/oEmbed; no scraping behind auth; no downloading/re-hosting.
- FR-018: System MUST log minimal telemetry (fetch timings, failures) without tracking pixels.
- FR-019: Admin actions MUST be server-key gated; no public auth required for V1.
- FR-020: All items MUST link to their original source with clear attribution.

### Key Entities (include if feature involves data)
- Artist: Canonical musical artist being searched and displayed; includes display name, slug, platform identifiers, optional image.
- Source: A logical provider (news, YouTube, SoundCloud, Spotify) with optional region hints/domain/channel identifiers.
- Item: A feed entry tied to an Artist and a Source; includes title, URL, embed/oEmbed info, published date, region score, pin/note, and deduplication hash.

---

## Assumptions (resolved)

- Default Region filter is Global; ZA-first boost still applies to ordering unless a specific region is selected.
- Default Recency window is 7d; users can switch to 24h or 30d.
- Type-ahead candidates are sourced from Spotify artist search; user selection canonicalizes the artist for all sources.
- Share links include current filters (tab, region, time, sort) in the URL so recipients see the same view.
- Embed fallback behavior: if oEmbed not available, show responsive link card with source attribution; click-to-activate for heavy iframes.
- Deduplication prefers the most authoritative or playable source when duplicates collide across providers.

---

## Review & Acceptance Checklist
GATE: Automated checks run during main() execution

### Content Quality
- [x] Focused on user value and business needs
- [x] All mandatory sections completed
- [x] Implementation details included intentionally per brief (query templates, interfaces)
- [x] Appropriate for technical planning; includes stakeholder language where relevant

### Requirement Completeness
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified
- [x] No [NEEDS CLARIFICATION] markers remain

---

## Execution Status
Updated by main() during processing

- [x] User description parsed
- [x] Key concepts extracted
- [ ] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Appendix A — Query Templates (Free/Official Sources)

Note: Use official APIs and public RSS/oEmbed only. Apply regional narrowing per selection and ZA-first boosting for ranking.

- YouTube (Data API v3)
  - Search endpoint: `GET https://www.googleapis.com/youtube/v3/search`
  - Params: `q={artist}`, `type=video`, `order=date`, `publishedAfter={iso8601}`, `regionCode={ZA|UK|...}`, `maxResults=25`, `safeSearch=none`, `fields=items(id/videoId,snippet(title,publishedAt,channelId,channelTitle))`
  - Ranking: Newest first; ZA boost when `regionCode=ZA` and/or metadata mentions South Africa.
  - Embed: oEmbed `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={videoId}&format=json`

- SoundCloud (Public oEmbed + RSS)
  - oEmbed: `GET https://soundcloud.com/oembed?format=json&url={track_or_profile_url}`
  - RSS (where exposed): `https://feeds.soundcloud.com/users/soundcloud:users:{userId}/sounds.rss`
  - Discovery strategy: known artist profiles; for ambiguous names, present candidates; prefer recent items.
  - Ranking: Newest first; ZA boost when profile/track metadata mentions ZA.

- Spotify (Web API; Client Credentials)
  - Find artist: `GET https://api.spotify.com/v1/search?q={artist}&type=artist&market={ZA|GB|...}&limit=5`
  - Latest releases: `GET https://api.spotify.com/v1/artists/{id}/albums?include_groups=single,album&market={ZA|GB|...}&limit=10`
  - Sort by `release_date` desc; prefer `market=ZA` when Region=ZA.
  - Embeds: use preview URLs or oEmbed `https://open.spotify.com/oembed?url={album_or_track_url}` (subject to availability).

- News (Google News RSS)
  - Query: `https://news.google.com/rss/search?q={artist}+("interview" OR "music")+{region_terms}&hl=en-{REGION}&gl={REGION}&ceid={REGION}:en`
  - Region terms examples: ZA → `site:.za OR "South Africa"`; UK → `site:.uk OR "United Kingdom"`; EU → language-specific terms; Global → none.
  - Ranking: Newest first; ZA boost when `.za` domain or ZA mentions.

## Appendix B — Data Interfaces (TypeScript)

```ts
export type Region = 'ZA' | 'UK' | 'EU' | 'GLOBAL';
export type ItemKind = 'news' | 'youtube' | 'soundcloud' | 'spotify';

export interface PlatformIds {
  spotifyId?: string;
  youtubeChannelId?: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  platformIds: PlatformIds;
  imageUrl?: string;
  createdAt: string; // ISO
}

export interface Source {
  id: string;
  kind: ItemKind;
  regionHints: Region[];
  domain?: string;
  channelId?: string;
  createdAt: string; // ISO
}

export interface Item {
  id: string;
  artistId: string;
  sourceId: string;
  kind: ItemKind;
  title: string;
  url: string;
  embedHtml?: string;
  oEmbedUrl?: string;
  publishedAt: string; // ISO
  regionScore: number; // higher = more relevant to selected region
  pinned: boolean;
  note?: string;
  hash: string; // kind + externalId|url
}

export type RecencyWindow = '24h' | '7d' | '30d';
```

## Appendix C — Test Plan

Focus areas: (1) ZA prioritization, (2) recency windows, (3) ambiguous names without alias logic, (4) embed availability.

1. ZA Prioritization
   - Input: Region=ZA; Items: A) .za domain (published T-2d), B) global domain (published T-1d)
   - Expected: A ranked above B due to ZA boost, then recency within same band.

2. Recency Windows
   - Input: Window=24h; Items: A) T-12h, B) T-36h
   - Expected: Only A shown; count equals eligible items; sorted newest first.

3. Ambiguous Names
   - Input: Search "Phoenix"
   - Expected: Type-ahead shows multiple candidates; selecting one routes to that artist page; no alias auto-mapping.

4. Embed Availability
   - Input: YouTube item with oEmbed allowed; SoundCloud item with oEmbed unavailable
   - Expected: YouTube shows playable embed; SoundCloud shows responsive link card with title and source.

5. Partial Outage
   - Input: YouTube 429; SoundCloud/Spotify/News OK
   - Expected: Partial results render; non-blocking notice for YouTube; auto-retry with backoff.

6. Freshness SLA
   - Input: New item published; cron runs within 15m
   - Expected: Item appears within ≤15m, or on-view revalidation fetch shows toast for new items.

## Appendix D — Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| API quotas (YouTube/Spotify) | Missing items, degraded freshness | Cache with TTLs, scheduled fetch, per-artist budgets, exponential backoff, request deduplication |
| Ambiguous artist names | Wrong results page | Present candidates in type-ahead, require explicit selection |
| Regional signal variance | Inconsistent ZA boosting | Heuristic boosting (.za TLD, ZA market, keyword match), document limitations |
| Provider outages/timeouts | Partial or slow feed | Per-source timeouts, partial rendering, retries with backoff, status indicators |
| Embed restrictions | Reduced UX | Fallback to link cards, click-to-activate embeds, lazy-load iframes |


