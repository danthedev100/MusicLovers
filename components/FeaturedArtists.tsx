'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const FEATURED_ARTISTS = [
  {
    name: 'Black Coffee',
    slug: 'black-coffee',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebcfdb7e1e83341c39f3ab0c29',
    description: 'South African DJ and producer',
  },
  {
    name: 'DJ Poizen',
    slug: 'dj-poizen',
    description: 'Electronic music producer',
  },
  {
    name: 'Kabza De Small',
    slug: 'kabza-de-small',
    description: 'Amapiano pioneer',
  },
  {
    name: 'DJ Maphorisa',
    slug: 'dj-maphorisa',
    description: 'South African DJ and producer',
  },
]

export function FeaturedArtists() {
  const router = useRouter()
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Featured Artists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURED_ARTISTS.map((artist) => (
          <Card 
            key={artist.slug}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/artist/${artist.slug}`)}
          >
            <CardContent className="p-4">
              {artist.imageUrl && (
                <div className="aspect-square mb-3 overflow-hidden rounded-md">
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium text-foreground mb-1">{artist.name}</h3>
                <p className="text-sm text-muted-foreground">{artist.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
