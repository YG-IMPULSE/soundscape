import { prisma } from '@/lib/db'
import ArtistCard from '@/components/artists/ArtistCard'

export const dynamic = 'force-dynamic'

async function getArtists() {
  const artists = await prisma.artist.findMany({
    include: {
      _count: {
        select: { tracks: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  return artists
}

export default async function ArtistsPage() {
  const artists = await getArtists()

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Artists</h1>
          <p className="text-gray-400">Discover your favorite artists</p>
        </div>

        {artists.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-2xl font-bold text-white mb-2">No artists yet</h2>
            <p className="text-gray-400">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
