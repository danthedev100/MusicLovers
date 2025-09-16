# Quickstart — Music Lovers V1

## Prerequisites
- Node.js 20+
- npm or pnpm
- Vercel account (free)
- Convex account (free)

## Environment Setup
Create `.env.local` and configure:
```bash
# YouTube Data API v3 (optional but recommended)
YOUTUBE_API_KEY=your_youtube_api_key_here

# Spotify Web API (optional but recommended)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Server admin key for admin panel access
SERVER_ADMIN_KEY=your_long_random_server_key_here

# Optional: Custom news RSS feeds (comma-separated)
NEWS_RSS_SEEDS=https://feeds.example.com/music,https://feeds.another.com/artists

# Convex deployment URL (auto-generated)
NEXT_PUBLIC_CONVEX_URL=
```

## Installation & Development
```bash
# Install dependencies
npm install

# Set up Convex (follow prompts)
npx convex dev --configure

# Start development server
npm run dev
```

## Testing & Quality
```bash
# Run unit tests
npm test

# Run Playwright integration tests
npm run test:e2e

# Lint code
npm run lint

# Type check
npm run build
```

## Performance & Accessibility

### Lighthouse Targets (≥90)
- **Performance**: Optimized images, lazy loading, code splitting
- **Accessibility**: WCAG AA compliance, keyboard navigation, screen readers
- **Best Practices**: HTTPS, secure APIs, error boundaries
- **SEO**: Meta tags, structured data, semantic HTML

### Mobile-First Checklist
- ✅ Responsive design (320px+)
- ✅ Touch targets ≥44×44px
- ✅ Readable text (16px+ base)
- ✅ Fast TTI (<2.5s on mid-range mobile)
- ✅ Reduced motion support
- ✅ Dark theme compatibility

### Performance Optimization
- Images: Next/Image with optimization
- Embeds: Lazy loading with click-to-activate
- Scripts: Defer non-critical JavaScript
- Fonts: Preload critical fonts
- API: Timeout/retry/circuit breaker patterns

## API Configuration

### YouTube Data API v3
1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create API key with YouTube restriction
4. Set daily quotas and monitoring

### Spotify Web API
1. Register app in [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Use Client Credentials flow (no user auth needed)
3. Note rate limits (requests per second)

## Security Notes
- All API keys are server-side only
- No user data storage (GDPR compliant)
- Admin actions require server key validation
- Rate limiting and circuit breakers prevent abuse
- Respect all third-party API terms of service

## Deployment

### Vercel
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push to main

### Convex
- Deploys automatically with functions
- Monitor via Convex dashboard
- Check cron job schedules

## Troubleshooting

### Common Issues
- **Search not working**: Check Spotify API credentials and quotas
- **No YouTube results**: Verify YouTube API key and daily quota
- **Admin access denied**: Ensure SERVER_ADMIN_KEY matches exactly
- **Convex connection failed**: Check NEXT_PUBLIC_CONVEX_URL
- **CORS errors**: Ensure API keys are server-side only

### Health Check
Visit `/api/health` to verify:
- Service configuration
- API availability  
- Environment validation
- Data source status

### Performance Debugging
- Use Chrome DevTools Lighthouse
- Check Core Web Vitals
- Monitor network requests
- Test on slow 3G connections
- Verify mobile viewport rendering
