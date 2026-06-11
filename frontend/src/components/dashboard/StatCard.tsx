import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  title: string
  value: string
  detail: string
  icon: LucideIcon
}

export function StatCard({ title, value, detail, icon: Icon }: StatCardProps) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="rounded-[22px] border border-[var(--card-border)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
            {value}
          </p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-orange-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-stone-100">
        <div className="h-1.5 w-2/3 rounded-full bg-[linear-gradient(90deg,#fb923c_0%,#f97316_100%)]" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </motion.article>
  )
}
