'use client'

import { useTheme, accentColors, AccentColor } from '@/contexts/ThemeContext'
import { useState } from 'react'

export default function ThemeToggle() {
  const { theme, accentColor, toggleTheme, setAccentColor } = useTheme()
  const [showAccentMenu, setShowAccentMenu] = useState(false)

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Accent Color Toggle Button */}
        <button
          onClick={() => setShowAccentMenu(!showAccentMenu)}
          className="p-2 rounded-lg bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
          title="Change accent color"
        >
          <svg className="w-5 h-5" style={{ color: accentColors[accentColor] }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0112 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 00-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 012.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/>
            <circle cx="6.5" cy="11.5" r="1.5"/>
            <circle cx="9.5" cy="7.5" r="1.5"/>
            <circle cx="14.5" cy="7.5" r="1.5"/>
            <circle cx="17.5" cy="11.5" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Accent Color Menu */}
      {showAccentMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowAccentMenu(false)}
          />
          <div className="absolute right-0 mt-2 p-4 bg-gray-900 dark:bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
            <p className="text-xs text-gray-400 mb-3 font-semibold">ACCENT COLOR</p>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(accentColors) as AccentColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setAccentColor(color)
                    setShowAccentMenu(false)
                  }}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                    accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                  }`}
                  style={{ backgroundColor: accentColors[color] }}
                  title={color.charAt(0).toUpperCase() + color.slice(1)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
