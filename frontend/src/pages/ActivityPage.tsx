import { History } from 'lucide-react'
import { ActivityItem } from '../components/dashboard/ActivityItem'
import { EmptyState } from '../components/dashboard/EmptyState'
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger'
import { useWorkspace } from '../workspace/WorkspaceContext'

export function ActivityPage() {
  const { recentActivity } = useWorkspace()

  return (
    <StaggerContainer>
      <StaggerItem>
        <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div>
        <p className="text-sm font-semibold text-slate-500">History</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
          Activity timeline
        </h1>
      </div>

      <StaggerContainer className="mt-6 grid gap-4 xl:grid-cols-2" delay={0.08}>
        {recentActivity.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState
              icon={History}
              title="No recent history"
              description="Uploads, indexing completions, and recent questions will appear here once the workspace is active."
            />
          </div>
        ) : (
          recentActivity.map((event) => (
            <StaggerItem key={event.id}>
              <ActivityItem event={event} />
            </StaggerItem>
          ))
        )}
      </StaggerContainer>
    </section>
      </StaggerItem>
    </StaggerContainer>
  )
}
