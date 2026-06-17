import { motion } from 'framer-motion'
import { Clock3, FileStack, MessageSquareText, Sparkles, Trash2 } from 'lucide-react'
import type { DocumentSummary } from '../../api/types'
import { formatDate, formatFileSize } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

type DocumentCardProps = {
  document: DocumentSummary
  onAsk: (documentId: string) => void
  onDelete: (documentId: string) => void
  onSelect?: (documentId: string) => void
  selected?: boolean
  questionCount?: number
  lastQuestionAt?: string | null
  deleting?: boolean
}

export function DocumentCard({
  document,
  onAsk,
  onDelete,
  onSelect,
  selected = false,
  questionCount = 0,
  lastQuestionAt = null,
  deleting = false,
}: DocumentCardProps) {
  const readinessLabel =
    document.status === 'READY'
      ? 'Ready for questions'
      : document.status === 'PROCESSING'
        ? 'Preparing document'
        : document.status === 'FAILED'
          ? 'Needs review'
          : 'Upload received'

  return (
    <motion.article
      whileHover={{ y: -3 }}
      className={cn(
        'rounded-[22px] border bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]',
        selected ? 'border-orange-300 ring-4 ring-orange-100' : 'border-[var(--card-border)]',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-orange-600">
            <FileStack className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{document.fileName}</h3>
            <p className="mt-1 text-sm text-slate-500">{formatDate(document.createdAt)}</p>
          </div>
        </div>
        <Badge status={document.status} />
      </div>

      <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Document readiness</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{readinessLabel}</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {formatFileSize(document.sizeBytes)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-stone-50 px-4 py-3">
          <p className="text-slate-500">Passages</p>
          <p className="mt-1 font-semibold text-slate-900">{document.chunkCount}</p>
        </div>
        <div className="rounded-xl bg-stone-50 px-4 py-3">
          <p className="text-slate-500">Questions</p>
          <p className="mt-1 font-semibold text-slate-900">{questionCount}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-3 py-2">
          <Clock3 className="h-3.5 w-3.5 text-slate-400" />
          {lastQuestionAt ? `Last asked ${formatDate(lastQuestionAt)}` : 'No questions yet'}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          {document.status === 'READY' ? 'Search-ready' : 'Pending preparation'}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {onSelect ? (
          <Button variant="secondary" className="flex-1" onClick={() => onSelect(document.documentId)}>
            {selected ? 'Viewing details' : 'View details'}
          </Button>
        ) : null}
        <Button variant="primary" className="flex-1" onClick={() => onAsk(document.documentId)}>
          <MessageSquareText className="h-4 w-4" />
          Ask
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          loading={deleting}
          onClick={() => onDelete(document.documentId)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </motion.article>
  )
}
