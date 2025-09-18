import { useState, useEffect, createContext, useContext } from 'react'
import { authService } from '../services/auth'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem('token')
    if (token) {
      authService.getProfile()
        .then(response => {
          setUser(response.data)
        })
        .catch(error => {
          console.error('Failed to get user profile:', error)
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      toast.success('Login successful!')
      
      return response
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed')
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      toast.success('Registration successful! Please login.')
      return response
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
      throw error
    }
  }

  const logout = () => {
    authService.logout().catch(() => {})
    localStorage.removeItem('token')
    setUser(null)
    toast.info('Logged out successfully')
  }

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData)
      setUser(response.data)
      toast.success('Profile updated successfully!')
      return response
    } catch (error) {
      toast.error(error.response?.data?.error || 'Profile update failed')
      throw error
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}