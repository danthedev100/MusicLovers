'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Filter, Globe, MapPin, Clock } from 'lucide-react'
import type { Region } from '@/lib/ranking'

interface Props {
  region: Region
  timeWindow: '24h' | '7d' | '30d'
  onRegionChange: (region: Region) => void
  onTimeWindowChange: (window: '24h' | '7d' | '30d') => void
}

export function FilterBar({ region, timeWindow, onRegionChange, onTimeWindowChange }: Props) {
  const getRegionLabel = (r: Region) => {
    switch (r) {
      case 'ZA': return 'South Africa'
      case 'UK': return 'United Kingdom'  
      case 'EU': return 'Europe'
      case 'GLOBAL': return 'Global'
      default: return 'Global'
    }
  }
  
  const getTimeLabel = (t: string) => {
    switch (t) {
      case '24h': return 'Last 24 hours'
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      default: return 'Last 7 days'
    }
  }
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filters:
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Region Filter */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Select value={region} onValueChange={onRegionChange}>
            <SelectTrigger 
              data-testid="region-filter"
              className="w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GLOBAL">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Global
                </div>
              </SelectItem>
              <SelectItem value="ZA">
                <div className="flex items-center gap-2">
                  🇿🇦 South Africa
                </div>
              </SelectItem>
              <SelectItem value="UK">
                <div className="flex items-center gap-2">
                  🇬🇧 United Kingdom
                </div>
              </SelectItem>
              <SelectItem value="EU">
                <div className="flex items-center gap-2">
                  🇪🇺 Europe
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Time Window Filter */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Select value={timeWindow} onValueChange={onTimeWindowChange}>
            <SelectTrigger 
              data-testid="time-filter"
              className="w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Active Filter Badges */}
        {region !== 'GLOBAL' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {getRegionLabel(region)}
          </Badge>
        )}
        
        {timeWindow !== '7d' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getTimeLabel(timeWindow)}
          </Badge>
        )}
      </div>
    </div>
  )
}
