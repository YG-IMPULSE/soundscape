'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import SearchBar from '@/components/search/SearchBar'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-black dark:text-white">
              🎵 Soundscape
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          {user && (
            <div className="hidden md:block flex-1 max-w-2xl">
              <SearchBar />
            </div>
          )}

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
              <Link
                href="/"
                className={`${
                  isActive('/') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
                } hover:text-black dark:hover:text-white transition-colors`}
              >
                Home
              </Link>
              <Link
                href="/tracks"
                className={`${
                  isActive('/tracks') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
                } hover:text-black dark:hover:text-white transition-colors`}
              >
                Tracks
              </Link>
              <Link
                href="/albums"
                className={`${
                  isActive('/albums') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
                } hover:text-black dark:hover:text-white transition-colors`}
              >
                Albums
              </Link>
              <Link
                href="/artists"
                className={`${
                  isActive('/artists') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
                } hover:text-black dark:hover:text-white transition-colors`}
              >
                Artists
              </Link>
              <Link
                href="/playlists"
                className={`${
                  isActive('/playlists') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
                } hover:text-black dark:hover:text-white transition-colors`}
              >
                Playlists
              </Link>
              {user?.isAdmin && (
                <Link
                  href="/admin"
                  className={`${
                    isActive('/admin') ? 'text-accent' : 'text-gray-600 dark:text-gray-300'
                  } hover:text-accent transition-colors flex items-center gap-2`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {user ? (
              <>
                <Link
                  href="/me"
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {user.name || user.email}
                </Link>
                <button
                  onClick={logout}
                  className="bg-gray-200 dark:bg-[#1a1a1a] hover:bg-gray-300 dark:hover:bg-[#2a2a2a] text-black dark:text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-accent hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-200 dark:border-gray-800">
            {/* Mobile Search */}
            <div className="px-3">
              <SearchBar />
            </div>
            
            {/* Theme Toggle in Mobile */}
            <div className="px-3">
              <ThemeToggle />
            </div>
            
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${
                isActive('/') ? 'bg-gray-200 dark:bg-[#1a1a1a] text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
              } hover:bg-gray-200 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/tracks"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${
                isActive('/tracks') ? 'bg-gray-200 dark:bg-[#1a1a1a] text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
              } hover:bg-gray-200 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors`}
            >
              Tracks
            </Link>
            <Link
              href="/albums"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${
                isActive('/albums') ? 'bg-gray-200 dark:bg-[#1a1a1a] text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
              } hover:bg-gray-200 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors`}
            >
              Albums
            </Link>
            <Link
              href="/artists"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${
                isActive('/artists') ? 'bg-gray-200 dark:bg-[#1a1a1a] text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
              } hover:bg-gray-200 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors`}
            >
              Artists
            </Link>
            <Link
              href="/playlists"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${
                isActive('/playlists') ? 'bg-gray-200 dark:bg-[#1a1a1a] text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'
              } hover:bg-gray-200 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors`}
            >
              Playlists
            </Link>
            <Link
              href="/me"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                logout()
                setMobileMenuOpen(false)
              }}
              className="w-full text-left px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
