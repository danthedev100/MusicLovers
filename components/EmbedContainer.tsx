'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, ExternalLink } from 'lucide-react'

interface Item {
  _id: string
  title: string
  url: string
  embedHtml?: string
  oEmbedUrl?: string
  kind: 'news' | 'youtube' | 'soundcloud' | 'spotify'
}

interface Props {
  item: Item
  onActivate: () => void
  isActive: boolean
}

export function EmbedContainer({ item, onActivate, isActive }: Props) {
  const [embedError, setEmbedError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const getEmbedUrl = () => {
    if (item.embedHtml) {
      // Extract URL from embed HTML if needed
      return item.oEmbedUrl || item.url
    }
    
    if (item.oEmbedUrl) {
      return item.oEmbedUrl
    }
    
    // Fallback: construct embed URL
    switch (item.kind) {
      case 'youtube':
        const youtubeId = item.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
        return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null
        
      case 'spotify':
        const spotifyId = item.url.match(/(?:spotify\.com\/(?:album|track)\/|spotify:(?:album|track):)([^?&\n]+)/)?.[1]
        return spotifyId ? `https://open.spotify.com/embed/track/${spotifyId}` : null
        
      case 'soundcloud':
        // SoundCloud requires oEmbed API for proper embed URLs
        return null
        
      default:
        return null
    }
  }
  
  const embedUrl = getEmbedUrl()
  
  const handleActivate = async () => {
    if (!embedUrl) {
      setEmbedError(true)
      return
    }
    
    setIsLoading(true)
    onActivate()
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }
  
  if (!isActive) {
    return (
      <div 
        data-testid="embed-container"
        className="relative bg-muted/20 rounded-lg overflow-hidden aspect-video flex items-center justify-center"
      >
        <div 
          data-testid="embed-placeholder"
          className="text-center p-8"
        >
          <div className="mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-medium mb-2">
              {item.kind.charAt(0).toUpperCase() + item.kind.slice(1)} Content
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Click to load and play this content
            </p>
          </div>
          
          {embedUrl ? (
            <Button 
              data-testid="activate-embed"
              onClick={handleActivate}
              disabled={isLoading}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isLoading ? 'Loading...' : 'Load Content'}
            </Button>
          ) : (
            <Button 
              variant="outline"
              asChild
              className="gap-2"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                View on {item.kind.charAt(0).toUpperCase() + item.kind.slice(1)}
              </a>
            </Button>
          )}
        </div>
      </div>
    )
  }
  
  if (embedError || !embedUrl) {
    return (
      <div 
        data-testid="embed-error"
        className="relative bg-muted/20 rounded-lg overflow-hidden aspect-video flex items-center justify-center"
      >
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">
            Unable to load embed. View on the original platform instead.
          </p>
          <Button 
            variant="outline"
            asChild
            className="gap-2"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              View on {item.kind.charAt(0).toUpperCase() + item.kind.slice(1)}
            </a>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      data-testid="embed-container"
      className="relative bg-black rounded-lg overflow-hidden aspect-video"
    >
      <iframe
        src={embedUrl}
        title={item.title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onError={() => setEmbedError(true)}
      />
    </div>
  )
}
