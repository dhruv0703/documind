export type User = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED'

export type DocumentSummary = {
  documentId: string
  fileName: string
  storageKey?: string
  contentType?: string
  sizeBytes?: number
  status: DocumentStatus
  chunkCount: number
  createdAt: string
}

export type DocumentListResponse = {
  documents: DocumentSummary[]
}

export type UploadResponse = {
  documentId: string
  fileName: string
  status: DocumentStatus
  chunkCount: number
}

export type AskSource = {
  chunkIndex: number
  similarity: number
  snippet: string
}

export type AskResponse = {
  answer: string
  sources: AskSource[]
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type ActivityType = 'upload' | 'question' | 'index'

export type ActivityEvent = {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
}

export type QuestionRecord = {
  id: string
  documentId: string
  documentName: string
  question: string
  answer: string
  sources: AskSource[]
  askedAt: string
}

export type InsightPoint = {
  label: string
  value: number
}
