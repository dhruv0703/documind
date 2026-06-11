import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--card-border)] bg-[linear-gradient(180deg,#fffdfa_0%,#f9f5ef_100%)] px-6 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-orange-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}
