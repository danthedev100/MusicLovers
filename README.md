# Music Lovers 🎵

A modern, mobile-first web application for discovering the latest news, music, and updates from your favorite artists across multiple platforms.

## Features

✨ **Artist Search**: Intelligent search with type-ahead and fuzzy matching via Spotify  
🌍 **Multi-Platform Aggregation**: YouTube, SoundCloud, Spotify, and news sources  
📱 **Mobile-First Design**: Responsive, accessible interface with touch-friendly controls  
🇿🇦 **Regional Priority**: ZA-first ranking with global fallback  
⚡ **Real-Time Updates**: Background refresh with stale data detection  
🎛️ **Admin Controls**: Pin items, add editorial notes, manual refresh  
🔄 **Smart Caching**: TTL-based caching with circuit breaker protection  

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Convex (serverless functions, database, cron jobs)
- **Hosting**: Vercel
- **APIs**: YouTube Data API v3, Spotify Web API, SoundCloud oEmbed, Google News RSS

## Quick Start

### Prerequisites

- Node.js 20+
- npm/pnpm
- Convex account (free)
- Vercel account (free)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd music-lovers
   npm install
   ```

2. **Set up environment variables**:
   Copy `env.example` to `.env.local` and configure:
   ```bash
   # YouTube Data API v3
   YOUTUBE_API_KEY=your_youtube_api_key
   
   # Spotify Web API (Client Credentials)
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   
   # Admin access
   SERVER_ADMIN_KEY=your_secure_random_key
   
   # Convex (auto-generated after setup)
   NEXT_PUBLIC_CONVEX_URL=
   ```

3. **Set up Convex**:
   ```bash
   npx convex dev --configure
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### API Keys Setup

#### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → Enable YouTube Data API v3
3. Create credentials → API Key
4. Restrict key to YouTube Data API v3

#### Spotify Web API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create app → Note Client ID and Secret
3. No redirect URIs needed (using Client Credentials flow)

## Architecture

### Data Model

- **Artists**: Canonical artist records with platform IDs
- **Sources**: Platform-specific source metadata  
- **Items**: Content items with deduplication and ranking

### Caching Strategy

- **TTLs**: News 15m, YouTube 15m, SoundCloud 15m, Spotify 30m
- **Deduplication**: SHA-1 hash of `kind + externalId`
- **Background Refresh**: Cron jobs + on-demand revalidation

### Regional Ranking (ZA-First)

1. **+3 points**: `.za` domain
2. **+2 points**: ZA market/region API parameter  
3. **+1 point**: "South Africa"/"ZA" mentions
4. **Sort**: Region score desc → Published date desc

## Usage

### Searching Artists

1. Type artist name in search bar
2. Select from type-ahead suggestions
3. System canonicalizes via Spotify API
4. Navigate to artist page with unified feed

### Filtering Content

- **Tabs**: All, News, YouTube, SoundCloud, Spotify
- **Region**: Global, ZA, UK, EU (affects ranking)
- **Time**: 24h, 7d, 30d (recency window)

### Admin Functions

Access `/admin` with server admin key:
- Pin/unpin important items
- Add editorial notes
- Trigger manual refresh
- Monitor source health

## Performance

- **Target TTI**: < 2.5s on mid-range mobile
- **Lighthouse Score**: ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- **Mobile-First**: 320px+ responsive design
- **Accessibility**: WCAG AA compliance

## Development

### Running Tests

```bash
# Unit tests
npm test

# Integration tests (Playwright)
npm run test:e2e

# Lint
npm run lint
```

### Project Structure

```
├── app/                  # Next.js App Router pages
├── components/           # React components
├── convex/              # Convex backend functions
│   ├── adapters/        # Data source adapters
│   ├── schema.ts        # Database schema
│   └── cron.ts          # Scheduled jobs
├── lib/                 # Shared utilities
├── tests/               # Test suites
│   ├── contract/        # Contract tests
│   ├── unit/           # Unit tests
│   └── integration/    # E2E tests
└── specs/              # Feature specifications
```

### Adding New Data Sources

1. Create adapter in `convex/adapters/`
2. Implement `ItemInput` interface
3. Add to refresh orchestrator
4. Update environment validation
5. Add contract tests

## API Reference

### Health Check

```bash
GET /api/health
```

Returns service status and configuration.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `YOUTUBE_API_KEY` | Optional | YouTube Data API access |
| `SPOTIFY_CLIENT_ID` | Optional | Spotify Web API client ID |
| `SPOTIFY_CLIENT_SECRET` | Optional | Spotify Web API secret |
| `SERVER_ADMIN_KEY` | Optional | Admin panel access |
| `NEXT_PUBLIC_CONVEX_URL` | Required | Convex deployment URL |
| `NEWS_RSS_SEEDS` | Optional | Custom news RSS feeds |

## Contributing

1. Follow TDD principles (tests before implementation)
2. Use TypeScript strictly
3. Maintain mobile-first responsive design
4. Respect API rate limits and ToS
5. Update documentation for new features

## License

This project is for educational/personal use. Respect all third-party API terms of service.

## Deployment

### Vercel Deployment

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel handles build and hosting

### Convex Deployment

Convex deploys automatically with your functions. Ensure:
- Database schema is up to date
- Cron jobs are configured
- Environment variables are set

## Monitoring

- **Health Endpoint**: `/api/health`
- **Circuit Breaker Status**: Check console logs
- **Cache Hit Rates**: Monitor Convex dashboard
- **API Quotas**: Track usage in respective dashboards

## Troubleshooting

### Common Issues

- **No search results**: Check Spotify API credentials
- **Missing YouTube content**: Verify YouTube API key and quotas
- **Admin access denied**: Confirm `SERVER_ADMIN_KEY` matches
- **Convex errors**: Check deployment status and schema

For detailed troubleshooting, see `specs/001-project-music-lovers/quickstart.md`.
