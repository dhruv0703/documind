import { motion } from 'framer-motion'

export function SourceSnippet({
  chunkIndex,
  similarity,
  snippet,
}: {
  chunkIndex: number
  similarity: number
  snippet: string
}) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[var(--card-border)] bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.03)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Chunk {chunkIndex}</p>
        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          {(similarity * 100).toFixed(0)}% match
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{snippet}</p>
    </motion.article>
  )
}
