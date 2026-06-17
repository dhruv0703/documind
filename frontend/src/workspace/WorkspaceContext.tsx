/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  QUESTION_HISTORY_KEY,
  askQuestion,
  deleteDocument as deleteDocumentRequest,
  isBackendUnavailable,
  listDocuments,
  uploadDocument,
} from '../api/client'
import type {
  ActivityEvent,
  AskResponse,
  DocumentSummary,
  QuestionRecord,
  UploadResponse,
} from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { average } from '../lib/utils'

type WorkspaceContextValue = {
  documents: DocumentSummary[]
  documentsLoading: boolean
  documentsError: string | null
  backendReachable: boolean
  questionHistory: QuestionRecord[]
  refreshDocuments: () => Promise<void>
  uploadPdf: (
    file: File,
    onProgress?: (progress: number) => void,
  ) => Promise<UploadResponse>
  removeDocument: (documentId: string) => Promise<void>
  askDocument: (documentId: string, question: string) => Promise<AskResponse>
  stats: {
    documentsUploaded: number
    totalChunksIndexed: number
    questionsAsked: number
    averageSimilarityScore: number
  }
  recentActivity: ActivityEvent[]
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

function questionHistoryStorageKey(userId?: string) {
  return userId ? `${QUESTION_HISTORY_KEY}.${userId}` : null
}

function readQuestionHistory(userId?: string) {
  const storageKey = questionHistoryStorageKey(userId)
  if (!storageKey) {
    return [] as QuestionRecord[]
  }

  const raw = localStorage.getItem(storageKey)

  if (!raw) {
    return [] as QuestionRecord[]
  }

  try {
    return JSON.parse(raw) as QuestionRecord[]
  } catch {
    return [] as QuestionRecord[]
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [backendReachable, setBackendReachable] = useState(true)
  const [questionHistory, setQuestionHistory] = useState<QuestionRecord[]>([])

  useEffect(() => {
    localStorage.removeItem(QUESTION_HISTORY_KEY)
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setQuestionHistory([])
      return
    }

    setQuestionHistory(readQuestionHistory(user.id))
  }, [user?.id])

  useEffect(() => {
    const storageKey = questionHistoryStorageKey(user?.id)
    if (!storageKey) {
      return
    }

    localStorage.setItem(storageKey, JSON.stringify(questionHistory))
  }, [questionHistory, user?.id])

  const refreshDocuments = useCallback(async () => {
    if (!token) {
      setDocuments([])
      setDocumentsError(null)
      return
    }

    setDocumentsLoading(true)

    try {
      const nextDocuments = await listDocuments()
      setDocuments(nextDocuments)
      setDocumentsError(null)
      setBackendReachable(true)
    } catch (error) {
      if (isBackendUnavailable(error)) {
        setBackendReachable(false)
        setDocumentsError('The service is temporarily unavailable. Showing cached workspace data.')
      } else {
        setDocumentsError(error instanceof Error ? error.message : 'Unable to load documents.')
      }
    } finally {
      setDocumentsLoading(false)
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshDocuments()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [refreshDocuments, user])

  const uploadPdf = useCallback(
    async (file: File, onProgress?: (progress: number) => void) => {
      const response = await uploadDocument(file, (progressEvent) => {
        if (!onProgress || !progressEvent.total) {
          return
        }

        onProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100))
      })

      setBackendReachable(true)
      await refreshDocuments()
      return response
    },
    [refreshDocuments],
  )

  const removeDocument = useCallback(
    async (documentId: string) => {
      await deleteDocumentRequest(documentId)
      setDocuments((current) => current.filter((document) => document.documentId !== documentId))
      setBackendReachable(true)
    },
    [],
  )

  const askDocument = useCallback(
    async (documentId: string, question: string) => {
      const response = await askQuestion(documentId, question)
      const document = documents.find((item) => item.documentId === documentId)

      setQuestionHistory((current) => [
        {
          id: crypto.randomUUID(),
          documentId,
          documentName: document?.fileName ?? 'Selected document',
          question,
          answer: response.answer,
          sources: response.sources,
          askedAt: new Date().toISOString(),
        },
        ...current,
      ])

      setBackendReachable(true)
      return response
    },
    [documents],
  )

  const stats = useMemo(() => {
    const similarityScores = questionHistory.flatMap((entry) =>
      entry.sources.map((source) => source.similarity),
    )

    return {
      documentsUploaded: documents.length,
      totalChunksIndexed: documents.reduce((sum, document) => sum + document.chunkCount, 0),
      questionsAsked: questionHistory.length,
      averageSimilarityScore: average(similarityScores),
    }
  }, [documents, questionHistory])

  const recentActivity = useMemo<ActivityEvent[]>(() => {
    const uploadEvents = documents.slice(0, 6).map((document) => ({
      id: `upload-${document.documentId}`,
      type: 'upload' as const,
      title: document.fileName,
      description:
        document.status === 'READY'
          ? `${document.chunkCount} chunks indexed`
          : document.status === 'PROCESSING'
            ? 'Indexing is in progress'
            : document.status === 'FAILED'
              ? 'Processing requires attention'
              : 'Upload captured',
      timestamp: document.createdAt,
    }))

    const indexEvents = documents
      .filter((document) => document.status === 'READY')
      .slice(0, 6)
      .map((document) => ({
        id: `index-${document.documentId}`,
        type: 'index' as const,
        title: `${document.fileName} is ready`,
        description: `${document.chunkCount} passages prepared for search and question answering`,
        timestamp: document.createdAt,
      }))

    const questionEvents = questionHistory.slice(0, 6).map((entry) => ({
      id: `question-${entry.id}`,
      type: 'question' as const,
      title: entry.question,
      description: `Asked against ${entry.documentName}`,
      timestamp: entry.askedAt,
    }))

    return [...uploadEvents, ...indexEvents, ...questionEvents]
      .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
      .slice(0, 8)
  }, [documents, questionHistory])

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      documents,
      documentsLoading,
      documentsError,
      backendReachable,
      questionHistory,
      refreshDocuments,
      uploadPdf,
      removeDocument,
      askDocument,
      stats,
      recentActivity,
    }),
    [
      askDocument,
      backendReachable,
      documents,
      documentsError,
      documentsLoading,
      questionHistory,
      recentActivity,
      refreshDocuments,
      removeDocument,
      stats,
      uploadPdf,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)

  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }

  return context
}
