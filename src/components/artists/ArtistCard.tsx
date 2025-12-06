'use client'

import Link from 'next/link'
import Image from 'next/image'

interface Artist {
  id: string
  name: string
  image: string | null
  _count: {
    tracks: number
  }
}

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-all border border-gray-800 hover:border-gray-700"
    >
      {/* Artist Image */}
      <div className="relative aspect-square mb-4 rounded-full overflow-hidden bg-gray-800">
        {artist.image ? (
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎤
          </div>
        )}
      </div>

      {/* Artist Info */}
      <div className="text-center space-y-1">
        <h3 className="font-semibold text-white truncate group-hover:text-[#00d9ff] transition-colors">
          {artist.name}
        </h3>
        <p className="text-sm text-gray-400">
          {artist._count.tracks} {artist._count.tracks === 1 ? 'track' : 'tracks'}
        </p>
      </div>
    </Link>
  )
}
