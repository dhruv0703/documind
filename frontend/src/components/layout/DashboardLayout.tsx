import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PageTransition } from '../motion/PageTransition'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useWorkspace } from '../../workspace/WorkspaceContext'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { documentsError } = useWorkspace()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[var(--app-shell)]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:pl-[288px]">
        <main className="min-h-screen px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto flex max-w-[1560px] flex-col gap-6">
            <Topbar />
            {documentsError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {documentsError}
              </div>
            ) : null}
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
