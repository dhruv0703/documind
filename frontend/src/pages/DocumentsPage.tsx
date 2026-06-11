import { FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DocumentCard } from '../components/dashboard/DocumentCard'
import { EmptyState } from '../components/dashboard/EmptyState'
import { UploadDropzone } from '../components/dashboard/UploadDropzone'
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger'
import { useWorkspace } from '../workspace/WorkspaceContext'

export function DocumentsPage() {
  const { documents, removeDocument } = useWorkspace()
  const navigate = useNavigate()

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <UploadDropzone />
      </StaggerItem>

      <StaggerItem>
        <section className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div>
          <p className="text-sm font-semibold text-slate-500">Documents</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
            Manage uploaded PDFs
          </h1>
        </div>

        <StaggerContainer className="mt-6 grid gap-4 xl:grid-cols-3" delay={0.08}>
          {documents.length === 0 ? (
            <div className="xl:col-span-3">
              <EmptyState
                icon={FileText}
                title="No PDFs in this workspace"
                description="Upload a PDF to start chunking, indexing, and grounded question answering."
              />
            </div>
          ) : (
            documents.map((document) => (
              <StaggerItem key={document.documentId}>
                <DocumentCard
                  document={document}
                  onAsk={() => navigate(`/chat?documentId=${document.documentId}`)}
                  onDelete={(documentId) => void removeDocument(documentId)}
                />
              </StaggerItem>
            ))
          )}
        </StaggerContainer>
      </section>
      </StaggerItem>
    </StaggerContainer>
  )
}
