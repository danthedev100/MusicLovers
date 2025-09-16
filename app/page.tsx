import { SearchBar } from '@/components/SearchBar'
import { FeaturedArtists } from '@/components/FeaturedArtists'
import { RecentSearches } from '@/components/RecentSearches'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Music Lovers
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the latest news, music, and updates from your favorite artists across YouTube, SoundCloud, Spotify, and more.
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <SearchBar />
        </div>

        {/* Recent Searches */}
        <div className="mb-12">
          <RecentSearches />
        </div>

        {/* Featured Artists */}
        <div className="mb-12">
          <FeaturedArtists />
        </div>
      </div>
    </main>
  )
}
