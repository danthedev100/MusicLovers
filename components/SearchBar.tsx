'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface ArtistCandidate {
  id?: string
  name: string
  imageUrl?: string
  spotifyId?: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [candidates, setCandidates] = useState<ArtistCandidate[]>([])
  const [showResults, setShowResults] = useState(false)
  
  const router = useRouter()
  const searchByName = useMutation(api.artists.searchByName)
  const upsertFromSpotify = useMutation(api.artists.upsertFromSpotify)
  
  const debouncedQuery = useDebounce(query, 300)
  
  const searchArtists = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCandidates([])
      setShowResults(false)
      return
    }
    
    setIsLoading(true)
    try {
      const result = await searchByName({ name: searchQuery.trim() })
      setCandidates(result.candidates || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setCandidates([])
    } finally {
      setIsLoading(false)
    }
  }, [searchByName])
  
  useEffect(() => {
    if (debouncedQuery) {
      searchArtists(debouncedQuery)
    }
  }, [debouncedQuery, searchArtists])
  
  const handleSelectArtist = async (candidate: ArtistCandidate) => {
    try {
      let artistId = candidate.id
      
      // If no ID, create the artist from Spotify data
      if (!artistId && candidate.spotifyId) {
        const slug = candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
        artistId = await upsertFromSpotify({
          name: candidate.name,
          slug,
          imageUrl: candidate.imageUrl,
          spotifyId: candidate.spotifyId,
        })
      }
      
      if (artistId) {
        const slug = candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
        router.push(`/artist/${slug}`)
      }
    } catch (error) {
      console.error('Artist selection error:', error)
    }
    
    // Clear search
    setQuery('')
    setShowResults(false)
    setCandidates([])
  }
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          data-testid="search-input"
          type="text"
          placeholder="Search for an artist (e.g., Black Coffee, DJ Poizen)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-lg h-14 bg-card"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 
            data-testid="search-loading"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" 
          />
        )}
      </div>
      
      {/* Search Results */}
      {showResults && candidates.length > 0 && (
        <Card 
          data-testid="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-card border shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {candidates.map((candidate, index) => (
            <Button
              key={candidate.spotifyId || candidate.name}
              data-testid={`search-result-${index}`}
              variant="ghost"
              className="w-full justify-start p-4 h-auto hover:bg-accent/50"
              onClick={() => handleSelectArtist(candidate)}
            >
              <div className="flex items-center gap-3 w-full">
                {candidate.imageUrl && (
                  <img
                    data-testid="candidate-image"
                    src={candidate.imageUrl}
                    alt={candidate.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 text-left">
                  <div 
                    data-testid="candidate-name"
                    className="font-medium text-foreground"
                  >
                    {candidate.name}
                  </div>
                  {candidate.spotifyId && (
                    <div 
                      data-testid="candidate-context"
                      className="text-sm text-muted-foreground"
                    >
                      Spotify Artist
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </Card>
      )}
      
      {/* No Results */}
      {showResults && candidates.length === 0 && !isLoading && query.trim() && (
        <Card 
          data-testid="no-results"
          className="absolute top-full left-0 right-0 mt-2 bg-card border shadow-lg z-50 p-4"
        >
          <p className="text-muted-foreground text-center">
            No artists found for "{query}". Try a different search term.
          </p>
        </Card>
      )}
    </div>
  )
}
