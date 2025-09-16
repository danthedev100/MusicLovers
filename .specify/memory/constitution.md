# MusicLovers Constitution

## Core Principles

### I. MVP-First Artist Search Aggregator
- The product must enable searching by artist name and display aggregated results from external sources.
- Initial sources: YouTube (videos), SoundCloud (tracks). A single news/articles source (e.g., RSS or a news API) is sufficient for MVP.
- Show titles, source, published date (if available), and a link out to the original content. Respect and preserve source attribution.
- Store minimal state. Use ephemeral caching (up to 24 hours) to reduce duplicate external calls and improve responsiveness.

### II. Simple, Stateless HTTP API
- Expose a single read-only endpoint: `GET /search?artist=<name>` returning JSON.
- Response schema (minimum): `[ { source, title, url, publishedAt?, type } ]`, where `type` ∈ { "video", "track", "news" }.
- Handle errors per-source and return partial results with per-item `source` clearly identified. Do not fail the whole request when one provider errors.

### III. Minimum Quality Gates
- Provide a health endpoint: `GET /health` returns `{ status: "ok" }` when dependencies are reachable.
- Add smoke tests that cover: successful search with stubbed providers, graceful handling of rate limits (429), and timeouts.
- Implement basic request timeouts and exponential backoff for provider calls. Never exceed provider rate limits.

### IV. Compliance & Attribution
- Use official APIs/feeds and comply with each provider's Terms of Service.
- Do not store personal data. Only store query text and ephemeral cache content. Include source logos/names where required by the provider.

### V. Operational Simplicity
- Configuration strictly via environment variables (no checked-in secrets): `YOUTUBE_API_KEY`, `SOUNDCLOUD_CLIENT_ID` (or token), `NEWS_API_KEY`/`RSS_URLS`.
- Provide structured logs with correlation identifiers and per-provider timing and error fields.
- Semantic versioning. Breaking API changes require a major version bump and a brief migration note.

## Minimal Functional Requirements

- A search UI with a single artist input and a results view.
- Results grouped or filterable by source, with an "All" view acceptable for MVP.
- Pagination or "Load more" is acceptable; perfection is not required. Prioritize fast first result display (show partials as they arrive if feasible).
- Basic empty/error states. Never show raw stack traces to users.

## Development Workflow

- Keep the stack simple. Any web framework is acceptable; prioritize maintainability and clear separation between UI and API calls.
- Require at least one code review approval before merging. CI runs lint + smoke tests.
- Feature flags are optional; prefer simple configuration toggles for providers.

## Technology Stack Preference

- Honor the maintainer's preferred tech stack; do not override it by default.
- When suggesting improvements, keep them optional, free-tier-friendly, and reversible with clear migration steps.
- If no preference is provided, default to a simple, free/low-cost setup (server-rendered JS framework on a free tier, Node.js runtime, serverless/low-cost hosting, and a free-tier datastore such as SQLite or Postgres free tier).
- Preferred stack (honored by default):
  - Frontend: Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui.
  - Auth: Clerk.
  - Backend/data: Convex for backend logic and data; add Prisma with a relational database only where relational modeling/joins are required.
  - Hosting: Vercel.
- Cost guardrails: Operate within free tiers by default for development and initial production; do not add paid services without explicit approval.
- Optional, free-tier-friendly improvements (non-mandatory):
  - Use Next.js ISR, route handler caching, and streaming responses for faster perceived results.
  - Leverage Vercel Edge Middleware for lightweight caching/throttling where appropriate.
  - Schedule background refreshes for popular artists via Vercel Cron.
  - Enforce provider API rate caps with exponential backoff and request deduplication.
  - Keep analytics minimal and privacy-friendly; prefer tools with free tiers or disable by default.

## Mobile-First Experience

- Design mobile-first (320–390px) and progressively enhance to tablet and desktop.
- Use responsive, fluid layouts and spacing by default; avoid fixed widths. Prefer Tailwind's mobile-first utilities.
- Ensure tap targets ≥ 44×44px, adequate spacing, and thumb-reachable controls. Avoid hover-only interactions.
- Meet accessibility: semantic HTML, labels for inputs, focus states, and WCAG AA color contrast.
- Optimize for mobile performance: lazy-load embeds (YouTube/SoundCloud), optimize images via `next/image`, defer non-critical scripts, and minimize CLS.
- Support reduced-motion preferences and a dark theme (shadcn/ui tokens) without blocking core UX.

## Governance

- This constitution sets the minimum bar. Teams may add constraints but may not go below these requirements.
- Any amendment must update the version below and note the change in the commit message. Ensure templates and examples reflect the change.

**Version**: 0.1.1 | **Ratified**: 2025-09-16 | **Last Amended**: 2025-09-16