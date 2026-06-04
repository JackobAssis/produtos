import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import api from '../services/api'

type User = {
  id: string
  name: string
  email: string
  role: string
  companyId: string
  company: {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    whatsapp: string | null
    plan: string
  }
}

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, companyName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const response = await api.get('/api/v1/auth/me')
      setUser(response.data.data)
    } catch {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password })
    const { token: newToken, user: userData, company } = response.data.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser({ ...userData, company })
  }

  const register = async (name: string, email: string, password: string, companyName: string) => {
    const response = await api.post('/api/v1/auth/register', { name, email, password, companyName })
    const { token: newToken, user: userData, company } = response.data.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser({ ...userData, company })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
