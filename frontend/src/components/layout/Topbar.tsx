import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { triggerHaptic } from '../../lib/haptics'
import { initials } from '../../lib/utils'
import { useUiPreferences } from '../../ui/UiPreferencesContext'

export function Topbar() {
  const { user, offline } = useAuth()
  const { showStatusBadge, richMotion } = useUiPreferences()
  const prefersReducedMotion = useReducedMotion()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsRead, setNotificationsRead] = useState(false)
  const pageTitle = {
    '/dashboard': 'Dashboard',
    '/documents': 'Documents',
    '/chat': 'Ask AI',
    '/activity': 'Activity',
    '/settings': 'Settings',
  }[location.pathname] ?? 'Dashboard'

  return (
    <header className="flex flex-col gap-4 rounded-[22px] border border-[var(--card-border)] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Admin / {pageTitle}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-900">
          {pageTitle}
        </h1>
      </div>

      <div className="flex flex-1 flex-col gap-4 xl:max-w-3xl xl:flex-row xl:items-center xl:justify-end">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-[var(--card-border)] bg-stone-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your library..."
            className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-between gap-4 xl:justify-end">
          {showStatusBadge ? (
            <div className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:inline-flex">
              {offline ? 'Offline-safe mode' : 'Workspace live'}
            </div>
          ) : null}

          <div className="relative">
            <motion.button
              type="button"
              onPointerDown={() => triggerHaptic('light')}
              onClick={() => setNotificationsOpen((current) => !current)}
              className="relative rounded-xl border border-[var(--card-border)] bg-white p-3 text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)] active:scale-[0.985]"
              whileHover={prefersReducedMotion || !richMotion ? undefined : { y: -1, scale: 1.02 }}
              whileTap={prefersReducedMotion || !richMotion ? undefined : { scale: 0.97 }}
              animate={
                prefersReducedMotion || !richMotion
                  ? undefined
                  : notificationsOpen
                    ? { boxShadow: '0 12px 28px rgba(249,115,22,0.18)' }
                    : { boxShadow: '0 8px 20px rgba(15,23,42,0.04)' }
              }
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              <Bell className="h-5 w-5" />
              {!notificationsRead ? (
                <motion.span
                  className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-400"
                  animate={prefersReducedMotion || !richMotion ? undefined : { scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              ) : null}
            </motion.button>

            <AnimatePresence>
            {notificationsOpen ? (
              <motion.div
                initial={prefersReducedMotion || !richMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
                animate={prefersReducedMotion || !richMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion || !richMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-[calc(100%+12px)] z-20 w-[280px] rounded-2xl border border-[var(--card-border)] bg-white p-4 shadow-[0_22px_50px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <button
                    type="button"
                    onPointerDown={() => triggerHaptic('light')}
                    onClick={() => setNotificationsRead(true)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-500"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl bg-stone-50 px-3 py-3 text-sm text-slate-600">
                    Your workspace service is online and ready for new documents.
                  </div>
                  <div className="rounded-xl bg-stone-50 px-3 py-3 text-sm text-slate-600">
                    Account protection is active for your library and assistant tools.
                  </div>
                  <div className="rounded-xl bg-stone-50 px-3 py-3 text-sm text-slate-600">
                    Use Settings to adjust motion, metrics, and connection indicators.
                  </div>
                </div>
              </motion.div>
            ) : null}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[linear-gradient(135deg,#fb923c_0%,#f97316_100%)] text-sm font-bold text-white">
              {initials(user?.name ?? 'DocuMind User')}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name ?? 'DocuMind User'}</p>
              <p className="text-xs text-slate-500">{user?.email ?? 'user@documind.ai'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
