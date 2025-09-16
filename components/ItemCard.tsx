'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmbedContainer } from '@/components/EmbedContainer'
import { ExternalLink, Pin, MessageSquare, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Item {
  _id: string
  title: string
  url: string
  embedHtml?: string
  oEmbedUrl?: string
  publishedAt: string
  regionScore: number
  pinned: boolean
  note?: string
  kind: 'news' | 'youtube' | 'soundcloud' | 'spotify'
  source?: {
    domain?: string
  }
}

interface Props {
  item: Item
}

export function ItemCard({ item }: Props) {
  const [showEmbed, setShowEmbed] = useState(false)
  
  const getSourceIcon = (kind: string) => {
    switch (kind) {
      case 'youtube': return '🎥'
      case 'soundcloud': return '🎵'
      case 'spotify': return '🎶'
      case 'news': return '📰'
      default: return '🔗'
    }
  }
  
  const getSourceColor = (kind: string) => {
    switch (kind) {
      case 'youtube': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'soundcloud': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'spotify': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'news': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }
  
  const formatPublishedDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }
  
  const hasEmbed = !!(item.embedHtml || item.oEmbedUrl)
  const canEmbed = item.kind === 'youtube' || item.kind === 'soundcloud' || item.kind === 'spotify'
  
  return (
    <Card 
      data-testid="item-card"
      className={`overflow-hidden hover:shadow-md transition-shadow ${
        item.pinned ? 'ring-2 ring-primary/20' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  data-testid="item-source"
                  className={getSourceColor(item.kind)}
                >
                  {getSourceIcon(item.kind)} {item.kind.charAt(0).toUpperCase() + item.kind.slice(1)}
                </Badge>
                
                {item.pinned && (
                  <Badge variant="outline" className="text-primary">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                
                {item.regionScore > 0 && (
                  <Badge variant="outline" className="text-emerald-600">
                    🇿🇦 ZA
                  </Badge>
                )}
              </div>
              
              <h3 
                data-testid="item-title"
                className="font-semibold text-lg leading-tight mb-2 line-clamp-2"
              >
                {item.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div 
                  data-testid="item-published"
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  {formatPublishedDate(item.publishedAt)}
                </div>
                
                {item.source?.domain && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    {item.source.domain}
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                data-testid="external-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
                View
              </a>
            </Button>
          </div>
          
          {/* Note */}
          {item.note && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-start gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground italic">{item.note}</p>
              </div>
            </div>
          )}
          
          {/* Embed or Link Card */}
          {canEmbed && hasEmbed ? (
            <EmbedContainer
              item={item}
              onActivate={() => setShowEmbed(true)}
              isActive={showEmbed}
            />
          ) : (
            <div 
              data-testid="link-card"
              className="border rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 
                    data-testid="card-title"
                    className="font-medium line-clamp-1 mb-1"
                  >
                    {item.title}
                  </h4>
                  <p 
                    data-testid="card-source"
                    className="text-sm text-muted-foreground"
                  >
                    {item.source?.domain || 'External link'}
                  </p>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
