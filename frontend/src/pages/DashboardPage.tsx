import { motion } from 'framer-motion'
import { BrainCircuit, Database, Files, ShieldCheck, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityItem } from '../components/dashboard/ActivityItem'
import { AskPanel } from '../components/dashboard/AskPanel'
import { DocumentCard } from '../components/dashboard/DocumentCard'
import { EmptyState } from '../components/dashboard/EmptyState'
import { InsightsChart } from '../components/dashboard/InsightsChart'
import { StatCard } from '../components/dashboard/StatCard'
import { UploadDropzone } from '../components/dashboard/UploadDropzone'
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger'
import { Button } from '../components/ui/Button'
import { useAuth } from '../auth/AuthContext'
import { useWorkspace } from '../workspace/WorkspaceContext'
import { buildDocumentsIndexedSeries, buildHeadlineStats, buildQuestionsAskedSeries } from '../dashboard/insights'
import { formatDate } from '../lib/utils'
import { useUiPreferences } from '../ui/UiPreferencesContext'

export function DashboardPage() {
  const { user } = useAuth()
  const { documents, questionHistory, recentActivity, removeDocument, stats } = useWorkspace()
  const { demoMetrics } = useUiPreferences()
  const navigate = useNavigate()

  const firstName = user?.name.split(' ')[0] || 'Dhruv'
  const headlineStats = buildHeadlineStats(stats, demoMetrics)
  const questionsSeries = buildQuestionsAskedSeries(questionHistory)
  const documentsSeries = buildDocumentsIndexedSeries(documents)
  const latestUpload = documents[0] ?? null
  const latestQuestion = questionHistory[0] ?? null
  const readyDocuments = useMemo(
    () => documents.filter((document) => document.status === 'READY').length,
    [documents],
  )

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[24px] border border-[var(--card-border)] bg-[linear-gradient(135deg,#242631_0%,#313447_58%,#485d87_100%)] p-7 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
        >
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Operations overview</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.05em] sm:text-[3.15rem]">
              Welcome back, {firstName}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
              Add documents, review indexed passages, and draft answers across your working library.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                  <Files className="h-3.5 w-3.5 text-orange-200" />
                  Last upload
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{latestUpload?.fileName ?? 'No documents yet'}</p>
                <p className="mt-1 text-sm text-slate-300">{latestUpload ? formatDate(latestUpload.createdAt) : 'Upload a file to begin'}</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                  <BrainCircuit className="h-3.5 w-3.5 text-orange-200" />
                  Latest question
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{latestQuestion?.question ?? 'No question asked yet'}</p>
                <p className="mt-1 text-sm text-slate-300">{latestQuestion?.documentName ?? 'Use Ask AI to start a trail'}</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-orange-200" />
                  Workspace state
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{readyDocuments} ready documents</p>
                <p className="mt-1 text-sm text-slate-300">
                  {documents.length === 0 ? 'Waiting for first upload' : `${documents.length - readyDocuments} still preparing or need review`}
                </p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="border-white/15 bg-white/10 text-white hover:bg-white/15"
                onClick={() => navigate('/documents')}
              >
                Upload PDF
              </Button>
              <Button variant="primary" onClick={() => navigate('/chat')}>
                Ask a Question
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Library items', value: `${headlineStats.documentsUploaded}` },
              { label: 'Questions tracked', value: `${headlineStats.questionsAsked}` },
              { label: 'Indexed passages', value: `${headlineStats.totalChunksIndexed}` },
              { label: 'Average match', value: `${Math.round(headlineStats.averageSimilarityScore * 100)}%` },
            ].map((item) => (
              <div key={item.label} className="rounded-[20px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">{item.label}</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        </motion.section>
      </StaggerItem>

      <StaggerContainer className="grid gap-4 xl:grid-cols-4" delay={0.04}>
        <StaggerItem>
          <StatCard
            title="Documents Uploaded"
            value={`${headlineStats.documentsUploaded}`}
            detail="Current library total"
            icon={Files}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Indexed Passages"
            value={`${headlineStats.totalChunksIndexed}`}
            detail="Prepared for document search"
            icon={Database}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Questions Asked"
            value={`${headlineStats.questionsAsked}`}
            detail="Tracked across chat interactions"
            icon={BrainCircuit}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Average Similarity Score"
            value={headlineStats.averageSimilarityScore.toFixed(2)}
            detail="Across cited source snippets"
            icon={Sparkles}
          />
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]" delay={0.06}>
        <StaggerItem>
          <UploadDropzone />
        </StaggerItem>
        <StaggerContainer className="grid gap-6" delay={0.08}>
          <StaggerItem>
          <InsightsChart
            eyebrow="Question analytics"
            title="Questions Asked Over Time"
            data={questionsSeries}
            color="#f97316"
            gradientId="questionsGradient"
          />
          </StaggerItem>
          <StaggerItem>
          <InsightsChart
            eyebrow="Ingestion analytics"
            title="Documents Indexed by Day"
            data={documentsSeries}
            color="#3b82f6"
            gradientId="documentsGradient"
          />
          </StaggerItem>
        </StaggerContainer>
      </StaggerContainer>

      <StaggerContainer className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" delay={0.1}>
        <StaggerItem>
          <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Recent documents</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">
                Latest uploads
              </h3>
            </div>
            <Button variant="secondary" onClick={() => navigate('/documents')}>
              View all
            </Button>
          </div>

          <StaggerContainer className="mt-6 grid gap-4 lg:grid-cols-2" delay={0.1}>
            {documents.length === 0 ? (
              <div className="lg:col-span-2">
                <EmptyState
                  icon={Files}
                  title="No documents uploaded yet"
                  description="Use the upload panel to add your first PDF. Recent uploads, answer activity, and document health will appear here next."
                  actionLabel="Go to documents"
                  onAction={() => navigate('/documents')}
                />
              </div>
            ) : (
              documents.slice(0, 4).map((document) => {
                const documentQuestions = questionHistory.filter((entry) => entry.documentId === document.documentId)

                return (
                  <StaggerItem key={document.documentId}>
                  <DocumentCard
                    document={document}
                    questionCount={documentQuestions.length}
                    lastQuestionAt={documentQuestions[0]?.askedAt ?? null}
                    onAsk={() => navigate(`/chat?documentId=${document.documentId}`)}
                    onDelete={(documentId) => void removeDocument(documentId)}
                  />
                  </StaggerItem>
                )
              })
            )}
          </StaggerContainer>
        </section>
        </StaggerItem>

        <StaggerItem>
          <AskPanel />
        </StaggerItem>
      </StaggerContainer>

      <StaggerItem>
        <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Activity</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">
              Recent uploads and questions
            </h3>
          </div>
          <Button variant="secondary" onClick={() => navigate('/activity')}>
            Full history
          </Button>
        </div>

        <StaggerContainer className="mt-6 grid gap-4 xl:grid-cols-2" delay={0.08}>
          {recentActivity.length === 0 ? (
            <div className="xl:col-span-2">
              <EmptyState
                icon={BrainCircuit}
                title="No activity yet"
                description="Your upload, readiness, and question history will appear here as the workspace becomes active."
                actionLabel="Open activity"
                onAction={() => navigate('/activity')}
              />
            </div>
          ) : (
            recentActivity.map((event) => (
              <StaggerItem key={event.id}>
                <ActivityItem event={event} />
              </StaggerItem>
            ))
          )}
        </StaggerContainer>
      </section>
      </StaggerItem>
    </StaggerContainer>
  )
}
