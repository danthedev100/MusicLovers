'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RecentSearch {
  name: string
  slug: string
  timestamp: number
}

export function RecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const router = useRouter()
  
  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('musicLovers:recentSearches')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentSearches(parsed.slice(0, 6)) // Show max 6 recent searches
      } catch {
        // Invalid data, clear it
        localStorage.removeItem('musicLovers:recentSearches')
      }
    }
  }, [])
  
  const handleArtistClick = (slug: string) => {
    router.push(`/artist/${slug}`)
  }
  
  const handleRemoveSearch = (slug: string) => {
    const updated = recentSearches.filter(search => search.slug !== slug)
    setRecentSearches(updated)
    localStorage.setItem('musicLovers:recentSearches', JSON.stringify(updated))
  }
  
  const clearAll = () => {
    setRecentSearches([])
    localStorage.removeItem('musicLovers:recentSearches')
  }
  
  if (recentSearches.length === 0) {
    return null
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Searches
        </h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((search) => (
          <Badge
            key={search.slug}
            variant="secondary"
            className="pl-3 pr-1 py-1 hover:bg-accent cursor-pointer group"
          >
            <span 
              onClick={() => handleArtistClick(search.slug)}
              className="mr-2"
            >
              {search.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveSearch(search.slug)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
