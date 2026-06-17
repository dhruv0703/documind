import { FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocumentDetailPanel } from '../components/dashboard/DocumentDetailPanel'
import { DocumentCard } from '../components/dashboard/DocumentCard'
import { EmptyState } from '../components/dashboard/EmptyState'
import { UploadDropzone } from '../components/dashboard/UploadDropzone'
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger'
import { useWorkspace } from '../workspace/WorkspaceContext'

export function DocumentsPage() {
  const { documents, questionHistory, removeDocument } = useWorkspace()
  const navigate = useNavigate()
  const [selectedDocumentId, setSelectedDocumentId] = useState('')

  useEffect(() => {
    if (!selectedDocumentId && documents[0]) {
      setSelectedDocumentId(documents[0].documentId)
    }
  }, [documents, selectedDocumentId])

  useEffect(() => {
    if (selectedDocumentId && !documents.some((document) => document.documentId === selectedDocumentId)) {
      setSelectedDocumentId(documents[0]?.documentId ?? '')
    }
  }, [documents, selectedDocumentId])

  const selectedDocument = useMemo(
    () => documents.find((document) => document.documentId === selectedDocumentId) ?? null,
    [documents, selectedDocumentId],
  )

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <UploadDropzone />
      </StaggerItem>

      <StaggerContainer className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]" delay={0.08}>
        <StaggerItem>
          <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div>
              <p className="text-sm font-semibold text-slate-500">Documents</p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
                Manage uploaded PDFs
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review file health, jump into recent questions, and keep the library ready for fast answers.
              </p>
            </div>

            <StaggerContainer className="mt-6 grid gap-4 xl:grid-cols-2" delay={0.08}>
              {documents.length === 0 ? (
                <div className="xl:col-span-2">
                  <EmptyState
                    icon={FileText}
                    title="No documents in your library yet"
                    description="Upload a PDF to start reviewing passages, recent questions, and answer-ready files."
                    actionLabel="Open upload panel"
                    onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  />
                </div>
              ) : (
                documents.map((document) => {
                  const documentQuestions = questionHistory.filter((entry) => entry.documentId === document.documentId)

                  return (
                    <StaggerItem key={document.documentId}>
                      <DocumentCard
                        document={document}
                        selected={document.documentId === selectedDocumentId}
                        questionCount={documentQuestions.length}
                        lastQuestionAt={documentQuestions[0]?.askedAt ?? null}
                        onSelect={setSelectedDocumentId}
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
          <DocumentDetailPanel
            document={selectedDocument}
            questionHistory={questionHistory}
            onAsk={(documentId) => navigate(`/chat?documentId=${documentId}`)}
          />
        </StaggerItem>
      </StaggerContainer>
    </StaggerContainer>
  )
}
