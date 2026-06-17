import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '../../lib/utils'
import { triggerHaptic } from '../../lib/haptics'

export function SourceSnippet({
  chunkIndex,
  similarity,
  snippet,
  documentName,
  label,
  expandedByDefault = false,
}: {
  chunkIndex: number
  similarity: number
  snippet: string
  documentName?: string
  label?: string
  expandedByDefault?: boolean
}) {
  const [expanded, setExpanded] = useState(expandedByDefault)
  const preview = useMemo(() => {
    if (expanded || snippet.length <= 180) {
      return snippet
    }

    return `${snippet.slice(0, 180).trimEnd()}...`
  }, [expanded, snippet])
  const score = Math.round(similarity * 100)
  const quality =
    score >= 85 ? 'High match' : score >= 70 ? 'Strong match' : score >= 55 ? 'Moderate match' : 'Loose match'

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[var(--card-border)] bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.03)] transition hover:border-orange-200 hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{label ?? `Chunk ${chunkIndex}`}</p>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700">
              {quality}
            </span>
          </div>
          {documentName ? <p className="mt-1 text-xs text-slate-500">{documentName}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {score}% match
          </span>
          <button
            type="button"
            onPointerDown={() => triggerHaptic('light')}
            onClick={() => setExpanded((current) => !current)}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-orange-200 hover:text-orange-600',
              expanded && 'border-orange-200 text-orange-600',
            )}
            aria-label={expanded ? 'Collapse source passage' : 'Expand source passage'}
          >
            <ChevronDown className={cn('h-4 w-4 transition', expanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-stone-50 px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          Supporting passage
        </div>
        <p className="text-sm leading-6 text-slate-600">{preview}</p>
      </div>
    </motion.article>
  )
}
