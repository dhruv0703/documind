import axios, { AxiosError, type AxiosProgressEvent } from 'axios'
import type {
  AskResponse,
  AuthResponse,
  DocumentListResponse,
  LoginRequest,
  RegisterRequest,
  UploadResponse,
  User,
} from './types'

export const AUTH_TOKEN_KEY = 'documind.auth.token'
export const AUTH_USER_KEY = 'documind.auth.user'
export const QUESTION_HISTORY_KEY = 'documind.question.history'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const apiTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS || 65000)

export type AppApiError = Error & {
  status?: number
  backendUnavailable?: boolean
}

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: apiTimeoutMs,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function normalizeError(error: unknown): AppApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    const message = axiosError.code === 'ECONNABORTED'
      ? 'The service is still waking up on Render. Please try again in a few seconds.'
      : axiosError.response?.data?.message ||
        axiosError.message ||
        'The request could not be completed.'

    const appError = new Error(message) as AppApiError
    appError.status = axiosError.response?.status
    appError.backendUnavailable = !axiosError.response
    return appError
  }

  return new Error('The request could not be completed.') as AppApiError
}

export function isBackendUnavailable(error: unknown) {
  return Boolean((error as AppApiError | undefined)?.backendUnavailable)
}

export async function register(payload: RegisterRequest) {
  try {
    const response = await api.post<AuthResponse>('/api/auth/register', payload)
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function login(payload: LoginRequest) {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', payload)
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get<User>('/api/auth/me')
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function listDocuments() {
  try {
    const response = await api.get<DocumentListResponse>('/api/documents')
    return response.data.documents
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function uploadDocument(
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post<UploadResponse>('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function deleteDocument(documentId: string) {
  try {
    await api.delete(`/api/documents/${documentId}`)
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function askQuestion(documentId: string, question: string) {
  try {
    const response = await api.post<AskResponse>('/api/chat/ask', { documentId, question })
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}
