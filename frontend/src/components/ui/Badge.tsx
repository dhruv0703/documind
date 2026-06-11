import { cn } from '../../lib/utils'
import type { DocumentStatus } from '../../api/types'

const statusClassName: Record<DocumentStatus, string> = {
  READY: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  PROCESSING: 'border border-amber-200 bg-amber-50 text-amber-700',
  FAILED: 'border border-rose-200 bg-rose-50 text-rose-700',
  UPLOADED: 'border border-sky-200 bg-sky-50 text-sky-700',
}

export function Badge({ status, className }: { status: DocumentStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em]',
        statusClassName[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
