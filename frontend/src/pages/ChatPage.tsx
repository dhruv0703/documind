import { FileText, MessageSquareText, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AskPanel } from '../components/dashboard/AskPanel'
import { EmptyState } from '../components/dashboard/EmptyState'
import { SourceSnippet } from '../components/dashboard/SourceSnippet'
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger'
import { useWorkspace } from '../workspace/WorkspaceContext'
import { formatDate } from '../lib/utils'

export function ChatPage() {
  const [searchParams] = useSearchParams()
  const initialDocumentId = searchParams.get('documentId') || undefined
  const { documents, questionHistory } = useWorkspace()

  const latestQuestion = useMemo(() => questionHistory[0] ?? null, [questionHistory])
  const latestDocument = useMemo(
    () => documents.find((document) => document.documentId === latestQuestion?.documentId) ?? null,
    [documents, latestQuestion],
  )
  const topSource = latestQuestion?.sources[0] ?? null
  const averageMatch = latestQuestion
    ? latestQuestion.sources.reduce((sum, source) => sum + source.similarity, 0) / Math.max(latestQuestion.sources.length, 1)
    : 0

  return (
    <StaggerContainer className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
      <StaggerItem>
        <AskPanel initialDocumentId={initialDocumentId} />
      </StaggerItem>

      <StaggerItem>
        <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div>
            <p className="text-sm font-semibold text-slate-500">Latest answer</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
              Source-backed response trail
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review the latest answer, inspect its strongest support, and compare it with recent question history.
            </p>
          </div>

          {latestQuestion ? (
            <StaggerContainer className="mt-6 space-y-4" delay={0.08}>
              <StaggerContainer className="grid gap-3 md:grid-cols-3" delay={0.06}>
                <StaggerItem>
                  <div className="rounded-2xl bg-stone-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Document</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{latestQuestion.documentName}</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="rounded-2xl bg-stone-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Support level</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{Math.round(averageMatch * 100)}% average match</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="rounded-2xl bg-stone-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Asked</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(latestQuestion.askedAt)}</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>

              <StaggerItem>
                <div className="rounded-2xl border border-[var(--card-border)] bg-stone-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Question</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{latestQuestion.question}</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="rounded-2xl border border-[var(--card-border)] bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Answer</p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{latestQuestion.answer}</p>
                    </div>
                    {latestDocument ? (
                      <div className="hidden rounded-2xl bg-stone-50 px-4 py-3 md:block">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          <FileText className="h-3.5 w-3.5 text-orange-500" />
                          Active source
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{latestDocument.fileName}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </StaggerItem>

              {topSource ? (
                <StaggerItem>
                  <div className="rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fffdfa_100%)] p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                      <Sparkles className="h-4 w-4" />
                      Strongest supporting passage
                    </div>
                    <div className="mt-4">
                      <SourceSnippet
                        chunkIndex={topSource.chunkIndex}
                        similarity={topSource.similarity}
                        snippet={topSource.snippet}
                        label="Primary source"
                        expandedByDefault
                      />
                    </div>
                  </div>
                </StaggerItem>
              ) : null}

              <StaggerItem>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Supporting passages</p>
                    <div className="rounded-full bg-stone-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      {latestQuestion.sources.length} cited passages
                    </div>
                  </div>
                  <StaggerContainer className="mt-3 space-y-3" delay={0.1}>
                    {latestQuestion.sources.map((source, index) => (
                      <StaggerItem key={`${source.chunkIndex}-${index}`}>
                        <SourceSnippet
                          chunkIndex={source.chunkIndex}
                          similarity={source.similarity}
                          snippet={source.snippet}
                          documentName={latestQuestion.documentName}
                          label={`Passage ${index + 1}`}
                          expandedByDefault={index === 0}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="rounded-2xl border border-[var(--card-border)] bg-stone-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Recent question trail</p>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {questionHistory.length} total
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {questionHistory.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="rounded-2xl bg-white px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{entry.question}</p>
                          <span className="text-xs text-slate-500">{formatDate(entry.askedAt)}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{entry.documentName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon={MessageSquareText}
                title="No questions asked yet"
                description="Ask your first document question to populate answer history, cited passages, and the response trail."
              />
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fff5ec_0%,#fffdf9_100%)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-orange-700">
              <Sparkles className="h-4 w-4" />
              Response notes
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Answers are drafted from the highest-confidence passages returned for the selected document. Review the strongest citation first, then expand other passages if you need deeper source checking.
            </p>
          </div>
        </section>
      </StaggerItem>
    </StaggerContainer>
  )
}
