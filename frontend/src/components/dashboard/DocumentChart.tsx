import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { DocumentSummary } from '../../api/types'
import { formatDate } from '../../lib/utils'

function buildChartData(documents: DocumentSummary[]) {
  const grouped = new Map<string, { label: string; uploads: number; chunks: number }>()

  documents.forEach((document) => {
    const label = formatDate(document.createdAt)
    const current = grouped.get(label) ?? { label, uploads: 0, chunks: 0 }
    grouped.set(label, {
      label,
      uploads: current.uploads + 1,
      chunks: current.chunks + document.chunkCount,
    })
  })

  return [...grouped.values()]
}

export function DocumentChart({ documents }: { documents: DocumentSummary[] }) {
  const data = buildChartData(documents)

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Upload documents to populate ingestion trends.
      </div>
    )
  }

  return (
    <div className="h-[280px] rounded-[28px] border border-slate-200 bg-white/70 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="uploadsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 18,
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
            }}
          />
          <Area
            type="monotone"
            dataKey="uploads"
            stroke="#6366f1"
            fill="url(#uploadsGradient)"
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
