'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dark' | 'light'
type AccentColor = 'cyan' | 'purple' | 'green' | 'pink' | 'orange'

interface ThemeContextType {
  theme: Theme
  accentColor: AccentColor
  toggleTheme: () => void
  setAccentColor: (color: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const accentColors = {
  cyan: '#00d9ff',
  purple: '#a855f7',
  green: '#10b981',
  pink: '#ec4899',
  orange: '#f97316'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize state with lazy function to read from localStorage only once
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('soundscape-theme') as Theme) || 'dark'
    }
    return 'dark'
  })
  
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('soundscape-accent') as AccentColor) || 'cyan'
    }
    return 'cyan'
  })
  
  const [mounted, setMounted] = useState(false)

  // Mark as mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // Apply theme class
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    
    // Apply accent color CSS variable
    root.style.setProperty('--accent-color', accentColors[accentColor])
    
    // Save to localStorage
    localStorage.setItem('soundscape-theme', theme)
    localStorage.setItem('soundscape-accent', accentColor)
  }, [theme, accentColor, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color)
  }

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setAccentColor }}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export { accentColors }
export type { Theme, AccentColor }
