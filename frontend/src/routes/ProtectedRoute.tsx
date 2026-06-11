import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-shell)]">
        <div className="rounded-3xl border border-white/60 bg-white/70 px-8 py-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--accent-strong)]" />
            Loading your workspace
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
