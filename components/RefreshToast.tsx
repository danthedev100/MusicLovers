'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

interface Props {
  artistId: string
  onRefresh: () => void
}

export function RefreshToast({ artistId, onRefresh }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshArtist = useMutation(api.items.refreshArtist)
  
  const handleRefresh = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    onRefresh()
    
    try {
      const result = await refreshArtist({ artistId })
      
      if (result.updated > 0) {
        toast.success(`Found ${result.updated} new items!`, {
          action: {
            label: 'Refresh page',
            onClick: () => window.location.reload(),
          },
        })
      } else {
        toast.info('No new items found')
      }
    } catch (error) {
      console.error('Refresh error:', error)
      toast.error('Failed to refresh content')
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Auto-refresh check on mount and periodically
  useEffect(() => {
    const checkForStaleContent = () => {
      // This could check if content is stale and show a toast
      // For now, we'll just provide manual refresh
    }
    
    checkForStaleContent()
    
    // Check every 5 minutes
    const interval = setInterval(checkForStaleContent, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [artistId])
  
  // Show refresh button in a fixed position for easy access
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleRefresh}
        disabled={isRefreshing}
        size="lg"
        className="shadow-lg gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  )
}
