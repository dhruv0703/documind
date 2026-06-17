import { FileText, Files, MessageSquareText, Sparkles } from 'lucide-react'
import type { AskSource, DocumentSummary, QuestionRecord } from '../../api/types'
import { formatDate, formatFileSize } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from './EmptyState'
import { SourceSnippet } from './SourceSnippet'

type DocumentDetailPanelProps = {
  document: DocumentSummary | null
  questionHistory: QuestionRecord[]
  onAsk: (documentId: string) => void
}

type SourceWithQuestion = AskSource & {
  question: string
  askedAt: string
}

function buildRecentSources(questionHistory: QuestionRecord[]): SourceWithQuestion[] {
  return questionHistory
    .flatMap((entry) =>
      entry.sources.map((source) => ({
        ...source,
        question: entry.question,
        askedAt: entry.askedAt,
      })),
    )
    .slice(0, 4)
}

export function DocumentDetailPanel({ document, questionHistory, onAsk }: DocumentDetailPanelProps) {
  if (!document) {
    return (
      <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={FileText}
          title="Select a document"
          description="Choose a file from the library to review its status, recent questions, and source passages."
        />
      </section>
    )
  }

  const documentQuestions = questionHistory.filter((entry) => entry.documentId === document.documentId)
  const recentSources = buildRecentSources(documentQuestions)

  return (
    <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Document detail</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">
            {document.fileName}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Review document health, recent questions, and the passages the assistant has used so far.
          </p>
        </div>
        <Badge status={document.status} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Uploaded</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(document.createdAt)}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">File size</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{formatFileSize(document.sizeBytes)}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Indexed passages</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{document.chunkCount}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Questions asked</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{documentQuestions.length}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fffdfa_100%)] p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-orange-600 shadow-[0_8px_18px_rgba(249,115,22,0.1)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Suggested next step</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {document.status === 'READY'
                  ? 'Open the assistant with this document selected and ask for a summary, key obligations, or action items.'
                  : 'Let this file finish processing before using it for question answering.'}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => onAsk(document.documentId)}
            disabled={document.status !== 'READY'}
          >
            <MessageSquareText className="h-4 w-4" />
            Ask
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Files className="h-4 w-4 text-orange-500" />
            Recent questions
          </div>
          <div className="mt-3 space-y-3">
            {documentQuestions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-stone-50 px-4 py-5 text-sm leading-6 text-slate-500">
                No questions have been asked for this document yet.
              </div>
            ) : (
              documentQuestions.slice(0, 4).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-[var(--card-border)] bg-stone-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{entry.question}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(entry.askedAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-orange-500" />
            Recent source passages
          </div>
          <div className="mt-3 space-y-3">
            {recentSources.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-stone-50 px-4 py-5 text-sm leading-6 text-slate-500">
                Once answers are generated, their supporting passages will appear here for quick review.
              </div>
            ) : (
              recentSources.map((source, index) => (
                <SourceSnippet
                  key={`${source.chunkIndex}-${source.askedAt}-${index}`}
                  chunkIndex={source.chunkIndex}
                  similarity={source.similarity}
                  snippet={source.snippet}
                  label={`Source ${index + 1}`}
                  expandedByDefault={index === 0}
                  documentName={source.question}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
