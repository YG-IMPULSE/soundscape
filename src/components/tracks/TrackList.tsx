'use client'

import TrackCard from './TrackCard'

interface Track {
  id: string
  title: string
  audioUrl: string
  coverUrl: string | null
  duration: number
  releaseYear?: number | null
  plays?: number
  artist: {
    id: string
    name: string
  }
  album: {
    id: string
    title: string
  } | null
}

interface TrackListProps {
  tracks: Track[]
  viewMode?: 'grid' | 'list'
}

export default function TrackList({ tracks, viewMode = 'grid' }: TrackListProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    )
  }

  // List view (table-like)
  return (
    <div className="space-y-1">
      {tracks.map((track, index) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </div>
  )
}
