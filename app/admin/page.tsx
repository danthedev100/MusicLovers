'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Pin, MessageSquare, RefreshCw, Key, Search } from 'lucide-react'

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('')
  const [selectedArtist, setSelectedArtist] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const pinItem = useMutation(api.admin.pinItem)
  const addNote = useMutation(api.admin.addNote)
  const triggerRefresh = useMutation(api.admin.triggerRefresh)
  const searchArtists = useMutation(api.artists.searchByName)
  
  // Get items for selected artist
  const artist = useQuery(
    api.artists.getBySlug, 
    selectedArtist ? { slug: selectedArtist } : 'skip'
  )
  
  const items = useQuery(
    api.items.listByArtist,
    artist ? { artistId: artist._id } : 'skip'
  )
  
  const handleAuth = () => {
    if (adminKey.trim()) {
      setIsAuthenticated(true)
      toast.success('Admin access granted')
    } else {
      toast.error('Admin key is required')
    }
  }
  
  const handlePinToggle = async (itemId: string, currentPinned: boolean) => {
    if (!isAuthenticated) return
    
    try {
      await pinItem({
        itemId,
        pinned: !currentPinned,
        adminKey,
      })
      toast.success(currentPinned ? 'Item unpinned' : 'Item pinned')
    } catch (error) {
      console.error('Pin error:', error)
      toast.error('Failed to update pin status')
    }
  }
  
  const handleAddNote = async (itemId: string, note: string) => {
    if (!isAuthenticated) return
    
    try {
      await addNote({
        itemId,
        note: note.trim(),
        adminKey,
      })
      toast.success('Note updated')
    } catch (error) {
      console.error('Note error:', error)
      toast.error('Failed to update note')
    }
  }
  
  const handleRefreshArtist = async () => {
    if (!isAuthenticated || !artist) return
    
    try {
      const result = await triggerRefresh({
        artistId: artist._id,
        adminKey,
      })
      toast.success(`Refreshed ${result.updated} items from ${Object.keys(result.sources).length} sources`)
    } catch (error) {
      console.error('Refresh error:', error)
      toast.error('Failed to refresh artist')
    }
  }
  
  const handleArtistSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      const result = await searchArtists({ name: searchQuery.trim() })
      if (result.candidates.length > 0) {
        const first = result.candidates[0]
        const slug = first.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
        setSelectedArtist(slug)
        toast.success(`Selected ${first.name}`)
      } else {
        toast.error('No artists found')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    }
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Key className="h-5 w-5" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            <Button onClick={handleAuth} className="w-full">
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage pinned items, add notes, and refresh artist content.
          </p>
        </div>
        
        {/* Artist Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Artist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search for artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArtistSearch()}
                className="flex-1"
              />
              <Button onClick={handleArtistSearch}>
                Search
              </Button>
              {artist && (
                <Button 
                  variant="outline"
                  onClick={handleRefreshArtist}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              )}
            </div>
            
            {artist && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {artist.imageUrl && (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{artist.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {items?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Items List */}
        {items && items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <AdminItemCard
                  key={item._id}
                  item={item}
                  onPinToggle={() => handlePinToggle(item._id, item.pinned)}
                  onAddNote={(note) => handleAddNote(item._id, note)}
                />
              ))}
            </CardContent>
          </Card>
        )}
        
        {items && items.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No items found for this artist.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function AdminItemCard({ 
  item, 
  onPinToggle, 
  onAddNote 
}: { 
  item: any
  onPinToggle: () => void
  onAddNote: (note: string) => void
}) {
  const [note, setNote] = useState(item.note || '')
  const [isEditingNote, setIsEditingNote] = useState(false)
  
  const handleSaveNote = () => {
    onAddNote(note)
    setIsEditingNote(false)
  }
  
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={item.pinned ? "default" : "secondary"}>
              {item.kind}
            </Badge>
            {item.pinned && (
              <Badge variant="outline" className="text-primary">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
          </div>
          <h4 className="font-medium line-clamp-2 mb-1">{item.title}</h4>
          <p className="text-sm text-muted-foreground">
            {new Date(item.publishedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={item.pinned ? "default" : "outline"}
            size="sm"
            onClick={onPinToggle}
            className="gap-2"
          >
            <Pin className="h-4 w-4" />
            {item.pinned ? 'Unpin' : 'Pin'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingNote(!isEditingNote)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Note
          </Button>
        </div>
      </div>
      
      {isEditingNote && (
        <>
          <Separator />
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note for this item..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveNote}>
                Save Note
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setNote(item.note || '')
                  setIsEditingNote(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
      
      {item.note && !isEditingNote && (
        <>
          <Separator />
          <div className="bg-muted/50 rounded p-3">
            <p className="text-sm italic">{item.note}</p>
          </div>
        </>
      )}
    </div>
  )
}
