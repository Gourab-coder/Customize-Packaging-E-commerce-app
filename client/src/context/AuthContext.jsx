import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'packaging_auth'

const parseStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    const parsed = JSON.parse(raw)
    return {
      token: parsed?.token || null,
      user: parsed?.user || null,
    }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const initialAuth = parseStoredAuth()
  const [token, setToken] = useState(initialAuth.token)
  const [user, setUser] = useState(initialAuth.user)

  const login = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: nextToken,
        user: nextUser,
      }),
    )
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
