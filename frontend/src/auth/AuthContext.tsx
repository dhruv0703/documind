/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  getCurrentUser,
  isBackendUnavailable,
  login as loginRequest,
  register as registerRequest,
} from '../api/client'
import type { LoginRequest, RegisterRequest, User } from '../api/types'

type AuthContextValue = {
  user: User | null
  token: string | null
  initializing: boolean
  offline: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => readStoredUser())
  const [initializing, setInitializing] = useState(true)
  const [offline, setOffline] = useState(false)

  const persistSession = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
    setOffline(false)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setToken(null)
    setUser(null)
    setOffline(false)
  }, [])

  useEffect(() => {
    let active = true

    async function hydrateUser() {
      if (!token) {
        setInitializing(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (!active) {
          return
        }

        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser))
        setUser(currentUser)
        setOffline(false)
      } catch (error) {
        if (!active) {
          return
        }

        if (isBackendUnavailable(error) && user) {
          setOffline(true)
        } else {
          clearSession()
        }
      } finally {
        if (active) {
          setInitializing(false)
        }
      }
    }

    hydrateUser()

    return () => {
      active = false
    }
  }, [clearSession, token, user])

  const login = useCallback(
    async (payload: LoginRequest) => {
      const response = await loginRequest(payload)
      persistSession(response.token, response.user)
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const response = await registerRequest(payload)
      persistSession(response.token, response.user)
    },
    [persistSession],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      offline,
      login,
      register,
      logout: clearSession,
    }),
    [clearSession, initializing, login, offline, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
