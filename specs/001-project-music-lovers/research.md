# Phase 0 — Research

## Decisions
- Use official/free sources only (YouTube Data API + oEmbed, SoundCloud oEmbed + RSS, Spotify Web API Client Credentials, Google News RSS).
- Convex as serverless backend: functions for adapters, persistence, cron for freshness.
- Next.js 15 App Router with server components where possible; streaming for perceived performance.
- Mobile-first UI with Tailwind v4 and shadcn/ui; lazy embeds; Next/Image for remotes.

## Rationale
- Free-tier friendly and ToS-compliant; avoids scraping and paid APIs.
- Convex simplifies background jobs and caching within a single managed service.
- App Router enables SSR/ISR/streaming which helps meet TTI/LCP targets.
- UI stack accelerates a sleek, accessible interface.

## Alternatives Considered
- Custom Node API with a database: more control but higher ops overhead vs Convex.
- Paid News APIs: better relevancy but violates free-only constraint.
- Client-only fetches: would expose keys and hit CORS/issues; rejected.

## Quotas & Limits (to verify during implementation)
- YouTube Data API: quota units for search/list; rate-limit and backoff.
- Spotify Client Credentials: token lifetime and rate limits; market parameter behavior.
- SoundCloud RSS availability varies by profile.
- Google News RSS: request frequency and site filters; avoid hammering.

## Open Items (tracked but not blocking)
- Confirm exact oEmbed availability for Spotify items; fallback to preview URLs.
- Validate ZA keyword heuristics beyond `.za` and "South Africa" for broader coverage.

