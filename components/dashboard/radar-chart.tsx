'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'
import { FMS_CATEGORIES, FMS_ORDER } from '@/lib/constants/fms'
import type { FMSScoresFormData } from '@/lib/validations/schemas'

interface RadarChartComponentProps {
  data: FMSScoresFormData
  title?: string
  showLegend?: boolean
}

export function RadarChartComponent({ data, title, showLegend = true }: RadarChartComponentProps) {
  // Transform FMS data for recharts
  const chartData = FMS_ORDER.map((key) => ({
    subject: FMS_CATEGORIES[key].label,
    score: data[key],
    fullMark: 5,
  }))

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#111827', fontSize: 12 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#64748b' }} />
          <Radar
            name="スコア"
            dataKey="score"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          {showLegend && <Legend />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
