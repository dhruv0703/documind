import { motion } from 'framer-motion'
import { Bot, CalendarDays, FileText, Layers3, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { AskResponse } from '../../api/types'
import { formatDate } from '../../lib/utils'
import { useWorkspace } from '../../workspace/WorkspaceContext'
import { SourceSnippet } from './SourceSnippet'
import { AnswerSkeleton } from './AnswerSkeleton'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

type AskPanelProps = {
  initialDocumentId?: string
}

export function AskPanel({ initialDocumentId }: AskPanelProps) {
  const { askDocument, documents } = useWorkspace()
  const [documentId, setDocumentId] = useState(initialDocumentId ?? documents[0]?.documentId ?? '')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AskResponse | null>(null)

  const availableDocuments = useMemo(
    () => documents.filter((document) => document.status === 'READY'),
    [documents],
  )
  const selectedDocument = useMemo(
    () => documents.find((document) => document.documentId === documentId) ?? null,
    [documentId, documents],
  )

  useEffect(() => {
    if (!documentId && availableDocuments[0]) {
      const timer = window.setTimeout(() => {
        setDocumentId(availableDocuments[0].documentId)
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [availableDocuments, documentId])

  async function handleSubmit() {
    if (!documentId) {
      setError('Select a READY document first.')
      return
    }

    if (!question.trim()) {
      setError('Enter a question before submitting.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await askDocument(documentId, question.trim())
      setResult(response)
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : 'Unable to ask the document.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Research assistant</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">
            Ask focused questions over your document library
          </h3>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-orange-600">
          <Bot className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {selectedDocument ? (
          <div className="rounded-2xl border border-[var(--card-border)] bg-stone-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-orange-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Selected document</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedDocument.fileName}</p>
                </div>
              </div>
              <Badge status={selectedDocument.status} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-sm text-slate-600">
                <Layers3 className="h-4 w-4 text-orange-500" />
                {selectedDocument.chunkCount} chunks indexed
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 text-orange-500" />
                Uploaded {formatDate(selectedDocument.createdAt)}
              </div>
            </div>
          </div>
        ) : null}

        <select
          value={documentId}
          onChange={(event) => setDocumentId(event.target.value)}
          className="rounded-xl border border-[var(--card-border)] bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
        >
          <option value="">Select a READY document</option>
          {availableDocuments.map((document) => (
            <option key={document.documentId} value={document.documentId}>
              {document.fileName}
            </option>
          ))}
        </select>

        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="What are the main points of this PDF?"
          className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-4 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
        />

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Answers are drafted from the strongest matching passages in the selected document.
          </p>
          <Button onClick={() => void handleSubmit()} loading={loading}>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {loading ? <AnswerSkeleton /> : null}

      {result ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          <div className="rounded-2xl border border-[var(--card-border)] bg-stone-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Answer</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{result.answer}</p>
          </div>
          <div className="space-y-3">
            {result.sources.map((source, index) => (
              <SourceSnippet
                key={`${source.chunkIndex}-${index}`}
                chunkIndex={source.chunkIndex}
                similarity={source.similarity}
                snippet={source.snippet}
              />
            ))}
          </div>
        </motion.div>
      ) : null}
    </section>
  )
}
