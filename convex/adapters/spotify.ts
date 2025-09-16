import { Region } from '../../lib/ranking'

export interface ItemInput {
  kind: 'spotify'
  title: string
  url: string
  oEmbedUrl?: string
  embedHtml?: string
  publishedAt: string
  source: {
    kind: 'spotify'
    domain?: string
    channelId?: string
    regionHints?: Region[]
  }
  externalId?: string
}

export interface Artist {
  id: string
  name: string
  slug: string
  imageUrl?: string
  platformIds: {
    spotifyId: string
    youtubeChannelId?: string
  }
  createdAt: string
}

/**
 * Fetch artist and their latest releases using Spotify Web API (Client Credentials)
 */
export async function fetchArtistAndReleases(
  artistName: string,
  region: Region
): Promise<{ artist?: Artist; items: ItemInput[] }> {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      console.warn('Spotify credentials not configured')
      return { items: [] }
    }

    // Get access token using Client Credentials flow
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!tokenResponse.ok) {
      console.error('Spotify token error:', tokenResponse.status)
      return { items: [] }
    }

    const { access_token } = await tokenResponse.json()

    // Search for artist
    const marketParam = region !== 'GLOBAL' ? getSpotifyMarket(region) : ''
    const searchParams = new URLSearchParams({
      q: artistName,
      type: 'artist',
      limit: '5',
    })
    
    if (marketParam) {
      searchParams.set('market', marketParam)
    }

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'User-Agent': 'MusicLovers/1.0',
        },
      }
    )

    if (!searchResponse.ok) {
      console.error('Spotify search error:', searchResponse.status)
      return { items: [] }
    }

    const searchData = await searchResponse.json()
    const artists = searchData.artists?.items || []
    
    if (artists.length === 0) {
      return { items: [] }
    }

    // Take first matching artist
    const spotifyArtist = artists[0]
    
    // Create normalized artist object
    const artist: Artist = {
      id: spotifyArtist.id,
      name: spotifyArtist.name,
      slug: spotifyArtist.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      imageUrl: spotifyArtist.images?.[0]?.url,
      platformIds: {
        spotifyId: spotifyArtist.id,
      },
      createdAt: new Date().toISOString(),
    }

    // Get latest releases
    const albumsParams = new URLSearchParams({
      include_groups: 'single,album',
      limit: '10',
    })
    
    if (marketParam) {
      albumsParams.set('market', marketParam)
    }

    const albumsResponse = await fetch(
      `https://api.spotify.com/v1/artists/${spotifyArtist.id}/albums?${albumsParams}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'User-Agent': 'MusicLovers/1.0',
        },
      }
    )

    if (!albumsResponse.ok) {
      console.error('Spotify albums error:', albumsResponse.status)
      return { artist, items: [] }
    }

    const albumsData = await albumsResponse.json()
    const albums = albumsData.items || []

    // Sort by release date desc
    albums.sort((a: any, b: any) => {
      const dateA = new Date(a.release_date || '1970-01-01')
      const dateB = new Date(b.release_date || '1970-01-01')
      return dateB.getTime() - dateA.getTime()
    })

    // Transform to normalized format
    const items: ItemInput[] = albums.map((album: any) => ({
      kind: 'spotify' as const,
      title: album.name || 'Untitled Release',
      url: album.external_urls?.spotify || `https://open.spotify.com/album/${album.id}`,
      oEmbedUrl: `https://open.spotify.com/oembed?url=${encodeURIComponent(album.external_urls?.spotify || '')}`,
      publishedAt: album.release_date ? `${album.release_date}T00:00:00Z` : new Date().toISOString(),
      source: {
        kind: 'spotify' as const,
        domain: 'open.spotify.com',
        regionHints: marketParam ? [region] : [],
      },
      externalId: album.id,
    }))

    return { artist, items }
  } catch (error) {
    console.error('Spotify adapter error:', error)
    return { items: [] }
  }
}

function getSpotifyMarket(region: Region): string {
  switch (region) {
    case 'ZA':
      return 'ZA'
    case 'UK':
      return 'GB'
    case 'EU':
      return 'DE' // Use Germany as EU representative
    default:
      return ''
  }
}
