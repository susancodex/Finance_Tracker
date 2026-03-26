import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)  // initial auth check

  // On mount: if a token exists, validate it by fetching the profile
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }

    authAPI.getProfile()
      .then(({ data }) => setUser(data))
      .catch(() => { localStorage.clear(); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  // Login: get tokens, then load profile
  const login = useCallback(async (credentials) => {
    const { data: tokens } = await authAPI.login(credentials)
    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    const { data: profile } = await authAPI.getProfile()
    setUser(profile)
    return profile
  }, [])

  // Register (does NOT auto-login — redirect to /login after)
  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData)
    return data
  }, [])

  // Logout: wipe storage and state
  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
