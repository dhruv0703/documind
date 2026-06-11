import { AnimatePresence, motion } from 'framer-motion'
import {
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { cn } from '../../lib/utils'
import { useUiPreferences } from '../../ui/UiPreferencesContext'

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Ask AI', to: '/chat', icon: MessageSquareText },
  { label: 'Activity', to: '/activity', icon: History },
  { label: 'Settings', to: '/settings', icon: Settings },
]

type SidebarProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const { logout } = useAuth()
  const { richMotion } = useUiPreferences()

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[linear-gradient(135deg,#f97316_0%,#fb923c_100%)] text-lg font-black text-white shadow-[0_14px_25px_rgba(249,115,22,0.3)]">
            D
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">DocuMind AI</p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Control panel</p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          whileTap={richMotion ? { scale: 0.94 } : undefined}
        >
          <X className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/6 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-orange-300">Workspace status</p>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          PDF ingestion, semantic retrieval, and grounded answers from one operator console.
        </p>
      </div>

      <motion.nav
        className="mt-8 flex flex-1 flex-col gap-2"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              delayChildren: 0.08,
              staggerChildren: 0.05,
            },
          },
        }}
      >
        {items.map((item) => {
          const Icon = item.icon

          return (
            <motion.div
              key={item.to}
              variants={{
                hidden: { opacity: 0, x: -18 },
                show: { opacity: 1, x: 0, transition: { duration: 0.22 } },
              }}
            >
              <NavLink
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition active:scale-[0.985]',
                    isActive
                      ? 'bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.1)]'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white',
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </motion.div>
          )
        })}
      </motion.nav>

      <motion.button
        type="button"
        onClick={logout}
        className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        whileHover={richMotion ? { y: -1 } : undefined}
        whileTap={richMotion ? { scale: 0.98 } : undefined}
      >
        <LogOut className="h-5 w-5" />
        Logout
      </motion.button>
    </>
  )

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-xl border border-black/10 bg-[var(--sidebar-bg)] p-3 text-white shadow-lg lg:hidden"
        whileTap={richMotion ? { scale: 0.94 } : undefined}
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: -320, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0.85 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-white/8 bg-[linear-gradient(180deg,#1f2027_0%,#242633_55%,#292b3a_100%)] px-5 py-5 text-white shadow-[20px_0_60px_rgba(20,20,20,0.2)] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] flex-col border-r border-white/8 bg-[linear-gradient(180deg,#1f2027_0%,#242633_55%,#292b3a_100%)] px-5 py-5 text-white shadow-[20px_0_60px_rgba(20,20,20,0.2)] lg:flex">
        {sidebarContent}
      </aside>
    </>
  )
}
