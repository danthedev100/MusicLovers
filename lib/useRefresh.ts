'use client'

import { useEffect, useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { isItemStale } from './hash'
import { toast } from 'sonner'

interface UseRefreshOptions {
  artistId?: string
  checkInterval?: number // in milliseconds
  autoRefresh?: boolean
}

export function useRefresh({
  artistId,
  checkInterval = 5 * 60 * 1000, // 5 minutes
  autoRefresh = false
}: UseRefreshOptions = {}) {
  const [isStale, setIsStale] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  
  const refreshArtist = useMutation(api.items.refreshArtist)
  
  const checkForStaleData = useCallback(async () => {
    if (!artistId) return
    
    try {
      // This would typically check against the server for stale data
      // For now, we'll use a simple time-based check
      const lastRefresh = localStorage.getItem(`lastRefresh:${artistId}`)
      const now = Date.now()
      
      if (lastRefresh) {
        const refreshTime = parseInt(lastRefresh, 10)
        const timeSinceRefresh = now - refreshTime
        
        // Consider stale if more than 15 minutes old
        if (timeSinceRefresh > 15 * 60 * 1000) {
          setIsStale(true)
        }
      } else {
        // No previous refresh, consider stale
        setIsStale(true)
      }
      
      setLastCheck(new Date())
    } catch (error) {
      console.error('Stale check error:', error)
    }
  }, [artistId])
  
  const performRefresh = useCallback(async () => {
    if (!artistId || isRefreshing) return
    
    setIsRefreshing(true)
    
    try {
      const result = await refreshArtist({ artistId })
      
      // Update last refresh time
      localStorage.setItem(`lastRefresh:${artistId}`, Date.now().toString())
      setIsStale(false)
      
      if (result.updated > 0) {
        toast.success('New items available!', {
          description: `Found ${result.updated} new items`,
          action: {
            label: 'Refresh page',
            onClick: () => window.location.reload(),
          },
        })
      }
      
      return result
    } catch (error) {
      console.error('Refresh error:', error)
      toast.error('Failed to refresh content')
    } finally {
      setIsRefreshing(false)
    }
  }, [artistId, refreshArtist, isRefreshing])
  
  // Auto-check for stale data
  useEffect(() => {
    if (!artistId) return
    
    // Initial check
    checkForStaleData()
    
    // Set up interval
    const interval = setInterval(checkForStaleData, checkInterval)
    
    return () => clearInterval(interval)
  }, [artistId, checkInterval, checkForStaleData])
  
  // Auto-refresh if enabled and data is stale
  useEffect(() => {
    if (autoRefresh && isStale && !isRefreshing) {
      performRefresh()
    }
  }, [autoRefresh, isStale, isRefreshing, performRefresh])
  
  // Visibility change handler - check when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && artistId) {
        checkForStaleData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [artistId, checkForStaleData])
  
  return {
    isStale,
    isRefreshing,
    lastCheck,
    refresh: performRefresh,
    checkStale: checkForStaleData,
  }
}
