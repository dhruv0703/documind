import type { DocumentSummary, InsightPoint, QuestionRecord } from '../api/types'

export const DEMO_METRICS = {
  documentsUploaded: 12,
  totalChunksIndexed: 1248,
  questionsAsked: 86,
  averageSimilarityScore: 0.84,
}

export function buildHeadlineStats(stats: {
  documentsUploaded: number
  totalChunksIndexed: number
  questionsAsked: number
  averageSimilarityScore: number
}, useDemoMetrics = true) {
  if (!useDemoMetrics) {
    return stats
  }

  return {
    documentsUploaded: Math.max(stats.documentsUploaded, DEMO_METRICS.documentsUploaded),
    totalChunksIndexed: Math.max(stats.totalChunksIndexed, DEMO_METRICS.totalChunksIndexed),
    questionsAsked: Math.max(stats.questionsAsked, DEMO_METRICS.questionsAsked),
    averageSimilarityScore: Math.max(stats.averageSimilarityScore, DEMO_METRICS.averageSimilarityScore),
  }
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function buildDocumentsIndexedSeries(documents: DocumentSummary[]): InsightPoint[] {
  if (documents.length === 0) {
    return [
      { label: 'Mon', value: 2 },
      { label: 'Tue', value: 1 },
      { label: 'Wed', value: 3 },
      { label: 'Thu', value: 2 },
      { label: 'Fri', value: 4 },
      { label: 'Sat', value: 5 },
      { label: 'Sun', value: 3 },
    ]
  }

  const grouped = new Map<string, number>()
  documents.forEach((document) => {
    const label = shortDate(document.createdAt)
    grouped.set(label, (grouped.get(label) ?? 0) + 1)
  })

  return [...grouped.entries()].map(([label, value]) => ({ label, value }))
}

export function buildQuestionsAskedSeries(questionHistory: QuestionRecord[]): InsightPoint[] {
  if (questionHistory.length === 0) {
    return [
      { label: 'Mon', value: 8 },
      { label: 'Tue', value: 11 },
      { label: 'Wed', value: 9 },
      { label: 'Thu', value: 13 },
      { label: 'Fri', value: 16 },
      { label: 'Sat', value: 12 },
      { label: 'Sun', value: 17 },
    ]
  }

  const grouped = new Map<string, number>()
  questionHistory.forEach((entry) => {
    const label = shortDate(entry.askedAt)
    grouped.set(label, (grouped.get(label) ?? 0) + 1)
  })

  return [...grouped.entries()].map(([label, value]) => ({ label, value }))
}
