# Tasks: Music Lovers — V1

**Input**: Design documents from `/specs/001-project-music-lovers/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
2. Load optional design documents (data-model.md, contracts/, research.md, quickstart.md)
3. Generate tasks with TDD ordering and parallel markers
4. Validate completeness and independence
5. Return: tasks ready for execution
```

## Format: `[ID] [P] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Each task includes exact file paths

## Project Structure (from plan)
- Next.js App Router in `app/`, shared UI in `components/`, utilities in `lib/`
- Convex backend in `convex/` (functions, adapters, cron, schema)
- Tests in `tests/`

## Phase 3.1: Setup
- [x] T001 Initialize Next.js 15 (App Router) + TypeScript strict baseline
  - Create `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tsconfig.json`, `next.config.js`
- [x] T002 Tailwind CSS v4 setup
  - Add `tailwind.config.ts`, `postcss.config.js`, wire `app/globals.css`
- [x] T003 [P] Install and configure shadcn/ui with base theme
  - Add `components/ui/*` primitives, theme provider in `app/layout.tsx`
- [x] T004 [P] Convex init (skeleton)
  - Add `convex/convex.json`, `convex/schema.ts` (empty tables), `convex/_generated/*`
- [x] T005 [P] Repo hygiene and scripts
  - Enable strict TS in `tsconfig.json`; add `eslint`/`prettier` configs; `package.json` scripts: dev, build, lint, test
- [x] T006 Env scaffolding per quickstart
  - Add `env.example` with `YOUTUBE_API_KEY`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SERVER_ADMIN_KEY`, `NEWS_RSS_SEEDS`

## Phase 3.2: Tests First (TDD) — MUST FAIL BEFORE 3.3
- [x] T007 [P] Contract tests for adapters normalization
  - `tests/contract/adapter_youtube.test.ts`
- [x] T008 [P] Contract tests for adapters normalization
  - `tests/contract/adapter_soundcloud.test.ts`
- [x] T009 [P] Contract tests for adapters normalization
  - `tests/contract/adapter_spotify.test.ts`
- [x] T010 [P] Contract tests for adapters normalization
  - `tests/contract/adapter_news.test.ts`
- [x] T011 [P] Unit tests for ranking (ZA-first + recency)
  - `tests/unit/ranking.test.ts`
- [x] T012 [P] Unit tests for hash and TTL logic
  - `tests/unit/hash_ttl.test.ts`
- [x] T013 [P] Integration test: search → artist page TTI <2.5s
  - `tests/integration/search_to_artist_page.spec.ts`
- [x] T014 [P] Integration test: Region=ZA prioritization
  - `tests/integration/region_priority.spec.ts`
- [x] T015 [P] Integration test: recency windows (24h/7d/30d)
  - `tests/integration/recency_filters.spec.ts`
- [x] T016 [P] Integration test: embeds and fallbacks
  - `tests/integration/embeds_and_fallbacks.spec.ts`
- [x] T017 [P] Integration test: ambiguous names flow
  - `tests/integration/ambiguous_names.spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
### Convex data + utils
- [x] T018 Define Convex schema tables and indexes
  - `convex/schema.ts` — `artists`, `sources`, `items`
- [x] T019 [P] Implement hash + region score utilities
  - `lib/hash.ts`, `lib/ranking.ts`

### Source adapters (pure functions)
- [x] T020 Implement YouTube adapter (search + regionCode + since)
  - `convex/adapters/youtube.ts`
- [x] T021 Implement SoundCloud adapter (oEmbed + RSS)
  - `convex/adapters/soundcloud.ts`
- [x] T022 Implement Spotify adapter (client creds; artist→releases; market)
  - `convex/adapters/spotify.ts`
- [x] T023 Implement News adapter (Google News RSS + region terms)
  - `convex/adapters/news.ts`

### Convex functions (server)
- [x] T024 Artists search (canonicalize via Spotify), getBySlug
  - `convex/artists.ts` — `searchByName`, `getBySlug`
- [x] T025 Items list + ranking + pagination
  - `convex/items.ts` — `listByArtist`
- [x] T026 Refresh artist orchestrator (parallel adapters, dedupe + upsert)
  - `convex/items.ts` — `refreshArtist`
- [x] T027 Admin actions (pin/unpin, add note)
  - `convex/admin.ts` — `pinItem`, `addNote`
- [x] T028 Cron for recently viewed
  - `convex/cron.ts` — `refreshRecentlyViewed`

### Next.js UI (mobile-first)
- [x] T029 App chrome and theme provider
  - `app/layout.tsx` — Tailwind, shadcn/ui, reduced motion support
- [x] T030 Home page with SearchBar, FeaturedArtists, RecentSearches
  - `app/page.tsx`, `components/SearchBar.tsx`
- [x] T031 Artist page with tabs and filters
  - `app/artist/[slug]/page.tsx`, `components/FilterBar.tsx`, `components/ItemCard.tsx`, `components/EmbedContainer.tsx`
- [x] T032 Admin page (server-key gated) for pin/note/refresh
  - `app/admin/page.tsx`

## Phase 3.4: Integration
- [x] T033 Fetch wrapper with timeout/backoff/circuit breaker
  - `lib/http.ts`
- [x] T034 On-view stale check + background refresh + toast
  - `components/RefreshToast.tsx`, hooks in `lib/useRefresh.ts`
- [x] T035 Schedule Convex cron (10–15m) and wire env
  - `convex/cron.ts`, `convex/convex.json`, `app/api/health/route.ts`
- [x] T036 Logging fields and minimal metrics
  - per-adapter logs; counters in `convex/*` (simple console or Convex)
- [x] T037 Env validation helper
  - `lib/env.ts`

## Phase 3.5: Polish
- [x] T038 [P] Lighthouse performance/accessibility pass (≥90)
  - docs in `specs/001-project-music-lovers/quickstart.md`
- [x] T039 [P] Accessibility audit (WCAG AA)
  - focus states, aria for embeds, keyboard nav
- [x] T040 [P] PWA baseline (manifest + icons; optional)
  - `public/manifest.webmanifest`, icons in `public/`
- [x] T041 Update README and add Data-Source Matrix appendix
  - `README.md`, `specs/001-project-music-lovers/research.md`

## Dependencies
- Setup (T001–T006) before tests (T007–T017)
- Tests before implementation (T018–T028, T029–T032)
- Data/schema (T018) before items functions (T025–T026)
- Adapters (T020–T023) before refresh/list (T025–T026)
- UI depends on server functions (T024–T028)
- Integration polish after core

## Parallel Example
```
# Launch adapter contract tests and unit tests together:
Task: T007  tests/contract/adapter_youtube.test.ts
Task: T008  tests/contract/adapter_soundcloud.test.ts
Task: T009  tests/contract/adapter_spotify.test.ts
Task: T010  tests/contract/adapter_news.test.ts
Task: T011  tests/unit/ranking.test.ts
Task: T012  tests/unit/hash_ttl.test.ts
```

## Validation Checklist
- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
