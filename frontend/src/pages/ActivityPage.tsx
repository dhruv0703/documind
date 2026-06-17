import { History } from 'lucide-react'
import { useMemo } from 'react'
import { ActivityItem } from '../components/dashboard/ActivityItem'
import { EmptyState } from '../components/dashboard/EmptyState'
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger'
import { useWorkspace } from '../workspace/WorkspaceContext'

export function ActivityPage() {
  const { recentActivity } = useWorkspace()
  const summary = useMemo(
    () => ({
      uploads: recentActivity.filter((event) => event.type === 'upload').length,
      questions: recentActivity.filter((event) => event.type === 'question').length,
      ready: recentActivity.filter((event) => event.type === 'index').length,
    }),
    [recentActivity],
  )

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">History</p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
                Activity timeline
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Follow uploads, document readiness, and question activity in one operational feed.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-stone-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Uploads</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.uploads}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Questions</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.questions}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ready items</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.ready}</p>
              </div>
            </div>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={History}
              title="No recent history"
              description="Uploads, document readiness, and recent questions will appear here once the workspace becomes active."
            />
          ) : (
            <StaggerContainer className="space-y-4" delay={0.08}>
              {recentActivity.map((event) => (
                <StaggerItem key={event.id}>
                  <ActivityItem event={event} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>
      </StaggerItem>
    </StaggerContainer>
  )
}
