'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const token = apiClient.getToken()
        if (token) {
          const userData = await apiClient.get<{ user: User }>('/api/auth/me')
          setUser(userData.user)
        }
      } catch (error) {
        apiClient.clearToken()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ user: User; token: string }>(
      '/api/auth/login',
      { email, password }
    )
    apiClient.setToken(response.token)
    setUser(response.user)
  }

  const register = async (email: string, password: string, name?: string) => {
    try {
      console.log('Attempting registration for:', email)
      const response = await apiClient.post<{ user: User; token: string }>(
        '/api/auth/register',
        { email, password, name }
      )
      console.log('Registration successful:', response)
      apiClient.setToken(response.token)
      setUser(response.user)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
