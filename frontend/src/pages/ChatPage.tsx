import { MessageSquareText, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AskPanel } from '../components/dashboard/AskPanel'
import { EmptyState } from '../components/dashboard/EmptyState'
import { SourceSnippet } from '../components/dashboard/SourceSnippet'
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger'
import { useWorkspace } from '../workspace/WorkspaceContext'

export function ChatPage() {
  const [searchParams] = useSearchParams()
  const initialDocumentId = searchParams.get('documentId') || undefined
  const { questionHistory } = useWorkspace()

  const latestQuestion = useMemo(() => questionHistory[0] ?? null, [questionHistory])

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
        </div>

        {latestQuestion ? (
          <StaggerContainer className="mt-6 space-y-4" delay={0.08}>
            <StaggerItem>
              <div className="rounded-2xl border border-[var(--card-border)] bg-stone-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Question</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{latestQuestion.question}</p>
            </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-2xl border border-[var(--card-border)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Answer</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{latestQuestion.answer}</p>
            </div>
            </StaggerItem>
            <StaggerContainer className="space-y-3" delay={0.1}>
              {latestQuestion.sources.map((source, index) => (
                <StaggerItem key={`${source.chunkIndex}-${index}`}>
                  <SourceSnippet
                    chunkIndex={source.chunkIndex}
                    similarity={source.similarity}
                    snippet={source.snippet}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </StaggerContainer>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={MessageSquareText}
              title="No questions asked yet"
              description="Ask your first document question to see answer history and cited source snippets here."
            />
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fff5ec_0%,#fffdf9_100%)] p-5">
          <div className="flex items-center gap-3 text-sm font-semibold text-orange-700">
            <Sparkles className="h-4 w-4" />
            Retrieval notes
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Answers are generated from the top 5 vector matches returned by pgvector. If the answer is not in context, the assistant should say it does not know based on the document.
          </p>
        </div>
      </section>
      </StaggerItem>
    </StaggerContainer>
  )
}
