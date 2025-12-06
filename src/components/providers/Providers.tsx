'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/hooks/useAuth'
import { PlayerProvider } from '@/hooks/usePlayer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Navbar from '@/components/layout/Navbar'
import PlayerBar from '@/components/player/PlayerBar'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pb-24">{children}</main>
            <PlayerBar />
          </div>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
