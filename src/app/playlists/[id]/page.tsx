'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import TrackList from '@/components/tracks/TrackList'

interface Playlist {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  isCollaborative: boolean
  userId: string
  user: {
    id: string
    name: string | null
    avatar: string | null
  }
  tracks: any[]
  contributors?: Array<{
    user: {
      id: string
      name: string | null
      avatar: string | null
    }
  }>
  _count?: {
    tracks: number
    contributors: number
  }
}

export default function PlaylistDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchPlaylist()
    }
  }, [user, authLoading, router, params.id])

  const fetchPlaylist = async () => {
    try {
      const data = await apiClient.get<Playlist>(`/api/playlists/${params.id}`)
      setPlaylist(data)
    } catch (error) {
      console.error('Failed to fetch playlist:', error)
      router.push('/playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsToggle = async (setting: 'isPublic' | 'isCollaborative', value: boolean) => {
    if (!playlist) return

    try {
      const response = await apiClient.patch(`/api/playlists/${params.id}/settings`, {
        [setting]: value
      })

      if (response.success) {
        setPlaylist(response.playlist)
      }
    } catch (error) {
      console.error('Failed to update playlist settings:', error)
    }
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/playlists/${params.id}`
    navigator.clipboard.writeText(url)
    alert('Playlist link copied to clipboard!')
  }

  const isOwner = user && playlist && playlist.userId === user.id

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!playlist) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a]">
      {/* Playlist Header */}
      <div className="bg-gradient-to-b from-[#00d9ff]/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-end gap-6">
            {/* Playlist Cover */}
            <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
              <div className="w-full h-full flex items-center justify-center text-8xl">
                📝
              </div>
            </div>

            {/* Playlist Info */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-sm font-semibold text-accent">PLAYLIST</p>
                {playlist.isPublic && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                    PUBLIC
                  </span>
                )}
                {playlist.isCollaborative && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded">
                    COLLABORATIVE
                  </span>
                )}
              </div>
              <h1 className="text-6xl font-bold text-white mb-4">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-gray-300 mb-3">{playlist.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span className="font-semibold text-white">Made by {playlist.user.name || 'Unknown User'}</span>
                <span>•</span>
                <span>{playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}</span>
                {playlist.isCollaborative && playlist._count && playlist._count.contributors > 0 && (
                  <>
                    <span>•</span>
                    <span>{playlist._count.contributors} {playlist._count.contributors === 1 ? 'contributor' : 'contributors'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={copyShareLink}
              className="px-6 py-3 bg-gray-200 dark:bg-[#1a1a1a] hover:bg-gray-300 dark:hover:bg-[#2a2a2a] text-black dark:text-white rounded-full font-semibold transition-colors border border-gray-300 dark:border-gray-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Link
            </button>
            
            {isOwner && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-6 py-3 bg-accent hover:opacity-90 text-white rounded-full font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            )}
          </div>

          {/* Settings Panel */}
          {isOwner && showSettings && (
            <div className="mt-6 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Playlist Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold mb-1">Make Public</h4>
                    <p className="text-gray-400 text-sm">Anyone can see and listen to this playlist</p>
                  </div>
                  <button
                    onClick={() => handleSettingsToggle('isPublic', !playlist.isPublic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      playlist.isPublic ? 'bg-accent' : 'bg-gray-400 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        playlist.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold mb-1">Collaborative</h4>
                    <p className="text-gray-400 text-sm">Allow others to add tracks to this playlist</p>
                  </div>
                  <button
                    onClick={() => handleSettingsToggle('isCollaborative', !playlist.isCollaborative)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      playlist.isCollaborative ? 'bg-accent' : 'bg-gray-400 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        playlist.isCollaborative ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracks */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {playlist.tracks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-white mb-2">No tracks yet</h2>
            <p className="text-gray-400">Add some tracks to this playlist</p>
          </div>
        ) : (
          <TrackList tracks={playlist.tracks} />
        )}
      </div>
    </div>
  )
}
