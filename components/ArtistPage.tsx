'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { FilterBar } from '@/components/FilterBar'
import { ItemCard } from '@/components/ItemCard'
import { EmptyState } from '@/components/EmptyState'
import { RefreshToast } from '@/components/RefreshToast'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Share, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { Region } from '@/lib/ranking'

interface Props {
  slug: string
  region: Region
  timeWindow: '24h' | '7d' | '30d'
  activeTab: string
}

export function ArtistPage({ slug, region, timeWindow, activeTab }: Props) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Get artist data
  const artist = useQuery(api.artists.getBySlug, { slug })
  
  // Get items for different tabs
  const allItems = useQuery(
    api.items.listByArtist,
    artist 
      ? { 
          artistId: artist._id, 
          region, 
          window: timeWindow 
        } 
      : 'skip'
  )
  
  const newsItems = useQuery(
    api.items.listByArtist,
    artist && activeTab === 'news'
      ? { 
          artistId: artist._id, 
          region, 
          window: timeWindow,
          kind: 'news'
        } 
      : 'skip'
  )
  
  const youtubeItems = useQuery(
    api.items.listByArtist,
    artist && activeTab === 'youtube'
      ? { 
          artistId: artist._id, 
          region, 
          window: timeWindow,
          kind: 'youtube'
        } 
      : 'skip'
  )
  
  const soundcloudItems = useQuery(
    api.items.listByArtist,
    artist && activeTab === 'soundcloud'
      ? { 
          artistId: artist._id, 
          region, 
          window: timeWindow,
          kind: 'soundcloud'
        } 
      : 'skip'
  )
  
  const spotifyItems = useQuery(
    api.items.listByArtist,
    artist && activeTab === 'spotify'
      ? { 
          artistId: artist._id, 
          region, 
          window: timeWindow,
          kind: 'spotify'
        } 
      : 'skip'
  )
  
  // Update URL when filters change
  const updateUrl = (params: Partial<{ region: string; time: string; tab: string }>) => {
    const url = new URL(window.location.href)
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value)
      } else {
        url.searchParams.delete(key)
      }
    })
    router.push(url.pathname + url.search)
  }
  
  // Save to recent searches
  useEffect(() => {
    if (artist) {
      const recentSearches = JSON.parse(
        localStorage.getItem('musicLovers:recentSearches') || '[]'
      )
      
      const newSearch = {
        name: artist.name,
        slug: artist.slug,
        timestamp: Date.now(),
      }
      
      // Remove existing entry and add to front
      const filtered = recentSearches.filter((s: any) => s.slug !== artist.slug)
      const updated = [newSearch, ...filtered].slice(0, 10) // Keep max 10
      
      localStorage.setItem('musicLovers:recentSearches', JSON.stringify(updated))
    }
  }, [artist])
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${artist?.name} - Music Lovers`,
        text: `Check out the latest from ${artist?.name}`,
        url: window.location.href,
      })
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }
  
  const getTabItems = () => {
    switch (activeTab) {
      case 'news': return newsItems
      case 'youtube': return youtubeItems
      case 'soundcloud': return soundcloudItems
      case 'spotify': return spotifyItems
      default: return allItems
    }
  }
  
  const currentItems = getTabItems()
  
  if (artist === undefined) {
    return <ArtistPageSkeleton />
  }
  
  if (artist === null) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <EmptyState
            title="Artist not found"
            description="The artist you're looking for doesn't exist or hasn't been added yet."
            action={
              <Button onClick={() => router.push('/')}>
                Back to Search
              </Button>
            }
          />
        </div>
      </div>
    )
  }
  
  return (
    <div data-testid="artist-page" className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Artist Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {artist.imageUrl && (
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 
                data-testid="artist-name"
                className="text-3xl md:text-5xl font-bold mb-2"
              >
                {artist.name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {artist.platformIds.spotifyId && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={`https://open.spotify.com/artist/${artist.platformIds.spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Spotify
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            region={region}
            timeWindow={timeWindow}
            onRegionChange={(newRegion) => updateUrl({ region: newRegion })}
            onTimeWindowChange={(newTime) => updateUrl({ time: newTime })}
          />
        </div>
        
        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(tab) => updateUrl({ tab })}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger data-testid="tab-all" value="all">All</TabsTrigger>
            <TabsTrigger data-testid="tab-news" value="news">News</TabsTrigger>
            <TabsTrigger data-testid="tab-youtube" value="youtube">YouTube</TabsTrigger>
            <TabsTrigger data-testid="tab-soundcloud" value="soundcloud">SoundCloud</TabsTrigger>
            <TabsTrigger data-testid="tab-spotify" value="spotify">Spotify</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {currentItems === undefined ? (
              <ItemListSkeleton />
            ) : currentItems.length === 0 ? (
              <EmptyState
                data-testid="empty-state"
                title="No items found"
                description={`No ${activeTab === 'all' ? '' : activeTab + ' '}items found for the selected time period.`}
                action={
                  timeWindow !== '30d' ? (
                    <Button 
                      data-testid="expand-window-button"
                      variant="outline"
                      onClick={() => updateUrl({ time: '30d' })}
                    >
                      Expand to 30 days
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div data-testid="items-list" className="space-y-4">
                {currentItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <RefreshToast 
          artistId={artist._id}
          onRefresh={() => setIsRefreshing(true)}
        />
      </div>
    </div>
  )
}

function ArtistPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
          <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <ItemListSkeleton />
      </div>
    </div>
  )
}

function ItemListSkeleton() {
  return (
    <div data-testid="items-skeleton" className="space-y-4">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
}
