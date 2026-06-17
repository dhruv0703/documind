import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell, FileText, History, MessageSquareText, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { triggerHaptic } from '../../lib/haptics'
import { initials } from '../../lib/utils'
import { useUiPreferences } from '../../ui/UiPreferencesContext'
import { useWorkspace } from '../../workspace/WorkspaceContext'

type SearchResult = {
  id: string
  type: 'document' | 'question' | 'activity'
  title: string
  subtitle: string
  href: string
}

export function Topbar() {
  const { user, offline } = useAuth()
  const { documents, questionHistory, recentActivity } = useWorkspace()
  const { showStatusBadge, richMotion } = useUiPreferences()
  const prefersReducedMotion = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsRead, setNotificationsRead] = useState(false)
  const pageTitle = {
    '/dashboard': 'Dashboard',
    '/documents': 'Documents',
    '/chat': 'Ask AI',
    '/activity': 'Activity',
    '/settings': 'Settings',
  }[location.pathname] ?? 'Dashboard'
  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = useMemo<SearchResult[]>(() => {
    if (normalizedQuery.length < 2) {
      return []
    }

    const documentResults = documents
      .filter((document) =>
        [document.fileName, document.status].some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
      .slice(0, 4)
      .map((document) => ({
        id: `document-${document.documentId}`,
        type: 'document' as const,
        title: document.fileName,
        subtitle: `${document.status} • ${document.chunkCount} passages`,
        href: `/documents?documentId=${document.documentId}`,
      }))

    const questionResults = questionHistory
      .filter((entry) =>
        [entry.question, entry.answer, entry.documentName].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ),
      )
      .slice(0, 4)
      .map((entry) => ({
        id: `question-${entry.id}`,
        type: 'question' as const,
        title: entry.question,
        subtitle: entry.documentName,
        href: `/chat?documentId=${entry.documentId}&questionId=${entry.id}`,
      }))

    const activityResults = recentActivity
      .filter((entry) =>
        [entry.title, entry.description].some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
      .slice(0, 4)
      .map((entry) => ({
        id: `activity-${entry.id}`,
        type: 'activity' as const,
        title: entry.title,
        subtitle: entry.description,
        href: '/activity',
      }))

    return [...documentResults, ...questionResults, ...activityResults].slice(0, 8)
  }, [documents, normalizedQuery, questionHistory, recentActivity])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node

      if (!searchContainerRef.current?.contains(target)) {
        setSearchOpen(false)
      }

      if (!notificationsRef.current?.contains(target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    setSearchOpen(false)
    setNotificationsOpen(false)
    setQuery('')
  }, [location.pathname, location.search])

  function handleResultNavigation(href: string) {
    triggerHaptic('light')
    setSearchOpen(false)
    navigate(href)
  }

  function handleSearchSubmit() {
    if (searchResults[0]) {
      handleResultNavigation(searchResults[0].href)
    }
  }

  const searchIconMap = {
    document: FileText,
    question: MessageSquareText,
    activity: History,
  }

  return (
    <header className="flex flex-col gap-4 rounded-[22px] border border-[var(--card-border)] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Admin / {pageTitle}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-900">
          {pageTitle}
        </h1>
      </div>

      <div className="flex flex-1 flex-col gap-4 xl:max-w-3xl xl:flex-row xl:items-center xl:justify-end">
        <div ref={searchContainerRef} className="relative flex-1">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-stone-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onFocus={() => {
                setNotificationsOpen(false)
                setSearchOpen(true)
              }}
              onChange={(event) => {
                setQuery(event.target.value)
                setSearchOpen(true)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSearchSubmit()
                }

                if (event.key === 'Escape') {
                  setSearchOpen(false)
                }
              }}
              placeholder="Search your library..."
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onPointerDown={() => triggerHaptic('light')}
              onClick={() => {
                setNotificationsOpen(false)
                setSearchOpen(true)
                handleSearchSubmit()
              }}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-orange-200 hover:text-orange-600"
              aria-label="Search workspace"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                initial={prefersReducedMotion || !richMotion ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
                animate={prefersReducedMotion || !richMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion || !richMotion ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-2xl border border-[var(--card-border)] bg-white p-3 shadow-[0_22px_50px_rgba(15,23,42,0.12)]"
              >
                {normalizedQuery.length < 2 ? (
                  <div className="rounded-xl bg-stone-50 px-4 py-4 text-sm text-slate-500">
                    Type at least 2 letters to search documents, questions, and activity.
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="rounded-xl bg-stone-50 px-4 py-4 text-sm text-slate-500">
                    No matches found for "{query}".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result) => {
                      const Icon = searchIconMap[result.type]

                      return (
                        <button
                          key={result.id}
                          type="button"
                          onPointerDown={() => triggerHaptic('light')}
                          onClick={() => handleResultNavigation(result.href)}
                          className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-stone-50"
                        >
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-orange-600">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">{result.title}</p>
                              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                {result.type}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-sm text-slate-500">{result.subtitle}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-4 xl:justify-end">
          {showStatusBadge ? (
            <div className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:inline-flex">
              {offline ? 'Offline-safe mode' : 'Workspace live'}
            </div>
          ) : null}

          <div ref={notificationsRef} className="relative">
            <motion.button
              type="button"
              onPointerDown={() => triggerHaptic('light')}
              onClick={() => {
                setSearchOpen(false)
                setNotificationsOpen((current) => !current)
              }}
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
                    onClick={() => {
                      setNotificationsRead(true)
                      setNotificationsOpen(false)
                    }}
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
