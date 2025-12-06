'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { apiClient } from '@/lib/api-client'

interface Playlist {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  _count: {
    tracks: number
    contributors?: number
  }
  user?: {
    id: string
    name: string | null
    email: string
  }
  isPublic?: boolean
  isCollaborative?: boolean
}

export default function PlaylistsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
  const [activeTab, setActiveTab] = useState<'yours' | 'public'>('yours')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchPlaylists()
      fetchPublicPlaylists()
    }
  }, [user, authLoading, router])

  const fetchPlaylists = async () => {
    try {
      const data = await apiClient.get<Playlist[]>('/api/playlists')
      setPlaylists(data)
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicPlaylists = async () => {
    try {
      const response = await apiClient.get<{ playlists: Playlist[] }>('/api/playlists/public')
      setPublicPlaylists(response.playlists)
    } catch (error) {
      console.error('Failed to fetch public playlists:', error)
    }
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return

    try {
      await apiClient.post('/api/playlists', {
        name: newPlaylistName,
        description: newPlaylistDesc || null,
      })
      setNewPlaylistName('')
      setNewPlaylistDesc('')
      setShowCreateModal(false)
      fetchPlaylists()
    } catch (error) {
      console.error('Failed to create playlist:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Playlists</h1>
            <p className="text-gray-400">Create and discover music collections</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-accent hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Create Playlist
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('yours')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'yours'
                ? 'text-[#00d9ff] border-b-2 border-[#00d9ff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Your Playlists ({playlists.length})
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'public'
                ? 'text-[#00d9ff] border-b-2 border-[#00d9ff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Public Playlists ({publicPlaylists.length})
          </button>
        </div>

        {/* Your Playlists Tab */}
        {activeTab === 'yours' && (
          <>
            {playlists.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-white mb-2">No playlists yet</h2>
                <p className="text-gray-400 mb-6">Create your first playlist to organize your music</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-accent hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Liked Songs - Special Playlist */}
                <Link
                  href="/me/liked"
                  className="group bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg p-6 hover:scale-105 transition-transform"
                >
                  <div className="aspect-square mb-4 flex items-center justify-center text-6xl">
                    ❤️
                  </div>
                  <h3 className="font-semibold text-white text-xl mb-1">Liked Songs</h3>
                  <p className="text-gray-200 text-sm">Your favorite tracks</p>
                </Link>

                {/* User Playlists */}
                {playlists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/playlists/${playlist.id}`}
                    className="group bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-all border border-gray-800 hover:border-gray-700"
                  >
                    <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-gray-800">
                      {playlist.coverUrl ? (
                        <Image
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          📝
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-black dark:text-white truncate group-hover:text-accent transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {playlist._count.tracks} {playlist._count.tracks === 1 ? 'track' : 'tracks'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Public Playlists Tab */}
        {activeTab === 'public' && (
          <>
            {publicPlaylists.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h2 className="text-2xl font-bold text-white mb-2">No public playlists yet</h2>
                <p className="text-gray-400">Be the first to create and share a public playlist!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {publicPlaylists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/playlists/${playlist.id}`}
                    className="group bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-all border border-gray-800 hover:border-gray-700"
                  >
                    <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-gradient-to-br from-[#00d9ff]/20 to-purple-500/20">
                      {playlist.coverUrl ? (
                        <Image
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-black dark:text-white truncate group-hover:text-accent transition-colors mb-1">
                      {playlist.name}
                    </h3>
                    
                    <p className="text-sm text-gray-400 truncate mb-2">
                      By {playlist.user?.name || playlist.user?.email.split('@')[0] || 'Unknown'}
                    </p>

                    {/* Badges */}
                    {playlist.isCollaborative && (
                      <div className="mb-2">
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                          COLLABORATIVE
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      {playlist._count.tracks} {playlist._count.tracks === 1 ? 'track' : 'tracks'}
                      {playlist.isCollaborative && playlist._count.contributors && playlist._count.contributors > 0 && (
                        <> · {playlist._count.contributors} {playlist._count.contributors === 1 ? 'contributor' : 'contributors'}</>
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md border border-gray-300 dark:border-gray-800 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Create Playlist</h2>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newPlaylistDesc}
                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                    placeholder="Describe your playlist..."
                    rows={3}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d9ff]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewPlaylistName('')
                      setNewPlaylistDesc('')
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-accent hover:opacity-90 text-white font-semibold rounded-lg transition-all"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
