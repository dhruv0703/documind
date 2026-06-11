import { motion } from 'framer-motion'
import { CheckCheck, Clock3, MessageCircleMore, Upload } from 'lucide-react'
import type { ActivityEvent } from '../../api/types'

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
      className="flex items-start gap-4 rounded-2xl border border-[var(--card-border)] bg-white p-4"
    >
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${colorMap[event.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{event.description}</p>
      </div>
    </motion.article>
  )
}
