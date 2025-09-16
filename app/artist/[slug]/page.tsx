import { notFound } from 'next/navigation'
import { ArtistPage } from '@/components/ArtistPage'

interface Props {
  params: { slug: string }
  searchParams: { 
    region?: string
    time?: string
    tab?: string
  }
}

export default function Artist({ params, searchParams }: Props) {
  const { slug } = params
  const { region = 'GLOBAL', time = '7d', tab = 'all' } = searchParams
  
  if (!slug) {
    notFound()
  }
  
  return (
    <ArtistPage 
      slug={slug}
      region={region as any}
      timeWindow={time as any}
      activeTab={tab}
    />
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const artistName = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return {
    title: `${artistName} - Latest Music & News | Music Lovers`,
    description: `Discover the latest music, news, and updates from ${artistName} across YouTube, SoundCloud, Spotify, and more.`,
  }
}
