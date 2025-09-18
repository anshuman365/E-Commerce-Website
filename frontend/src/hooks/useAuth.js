import { useState, useEffect } from 'react'
import { authService } from '../services/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user info
      authService.getProfile()
        .then(response => setUser(response.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const response = await authService.login(credentials)
    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
    return response
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    authService.logout().catch(() => {}) // Optional: call backend logout
  }

  return { user, loading, login, logout }
}