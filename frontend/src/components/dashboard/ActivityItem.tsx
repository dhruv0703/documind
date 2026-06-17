import { motion } from 'framer-motion'
import { CheckCheck, Clock3, MessageCircleMore, Upload } from 'lucide-react'
import type { ActivityEvent } from '../../api/types'
import { formatDate, formatRelativeTime } from '../../lib/utils'

const iconMap = {
  upload: Upload,
  question: MessageCircleMore,
  index: CheckCheck,
}

const colorMap = {
  upload: 'bg-cyan-100 text-cyan-700',
  question: 'bg-violet-100 text-violet-700',
  index: 'bg-emerald-100 text-emerald-700',
}

export function ActivityItem({ event }: { event: ActivityEvent }) {
  const Icon = iconMap[event.type] ?? Clock3

  return (
    <motion.article
      whileHover={{ x: 3 }}
      className="relative flex items-start gap-4 rounded-2xl border border-[var(--card-border)] bg-white p-4 transition hover:border-orange-200 hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
    >
      <div className="absolute left-[21px] top-14 h-[calc(100%-3.8rem)] w-px bg-[linear-gradient(180deg,rgba(226,232,240,0.9)_0%,rgba(226,232,240,0)_100%)]" />
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${colorMap[event.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">{event.title}</p>
          <div className="rounded-full bg-stone-50 px-3 py-1 text-xs font-semibold text-slate-500">
            {formatRelativeTime(event.timestamp)}
          </div>
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{formatDate(event.timestamp)}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{event.description}</p>
      </div>
    </motion.article>
  )
}
