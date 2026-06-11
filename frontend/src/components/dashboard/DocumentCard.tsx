import { motion } from 'framer-motion'
import { FileStack, MessageSquareText, Trash2 } from 'lucide-react'
import type { DocumentSummary } from '../../api/types'
import { formatDate } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

type DocumentCardProps = {
  document: DocumentSummary
  onAsk: (documentId: string) => void
  onDelete: (documentId: string) => void
  deleting?: boolean
}

export function DocumentCard({ document, onAsk, onDelete, deleting = false }: DocumentCardProps) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="rounded-[22px] border border-[var(--card-border)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
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

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-stone-50 px-4 py-3">
          <p className="text-slate-500">Chunks</p>
          <p className="mt-1 font-semibold text-slate-900">{document.chunkCount}</p>
        </div>
        <div className="rounded-xl bg-stone-50 px-4 py-3">
          <p className="text-slate-500">Status</p>
          <p className="mt-1 font-semibold text-slate-900">{document.status}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
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
