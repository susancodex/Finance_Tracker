import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/users/')
      // DRF returns a list; pick first user matching stored username or just first
      const stored = localStorage.getItem('username')
      const found = response.data.find(u => u.username === stored) || response.data[0]
      setUser(found || null)
    } catch {
      setUser(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (username, password) => {
    const response = await api.post('/api/token/', { username, password })
    const { access, refresh } = response.data

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('username', username)

    // Fetch user details after login
    try {
      const userResponse = await api.get('/api/users/')
      const found = userResponse.data.find(u => u.username === username) || userResponse.data[0]
      setUser(found || { username })
    } catch {
      setUser({ username })
    }

    return response.data
  }, [])

  const register = useCallback(async (userData) => {
    const response = await api.post('/api/users/', userData)
    return response.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    setUser(null)
  }, [])

  const isAuthenticated = !!localStorage.getItem('access_token')

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
