import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { InsightPoint } from '../../api/types'

type InsightsChartProps = {
  title: string
  eyebrow: string
  data: InsightPoint[]
  gradientId: string
  color: string
}

export function InsightsChart({
  title,
  eyebrow,
  data,
  gradientId,
  color,
}: InsightsChartProps) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <p className="text-sm font-semibold text-slate-500">{eyebrow}</p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">
        {title}
      </h3>

      <div className="mt-6 h-[280px] rounded-[20px] border border-[var(--card-border)] bg-stone-50/70 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={color} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e7dfd5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#78716c', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: '1px solid #e7dfd5',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={3}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
