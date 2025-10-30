'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { FMS_CATEGORIES, FMS_ORDER } from '@/lib/constants/fms'
import type { FMSScoresFormData } from '@/lib/validations/schemas'

interface DualRadarChartProps {
  data1: FMSScoresFormData
  data2: FMSScoresFormData
  label1: string
  label2: string
  color1?: string
  color2?: string
}

export function DualRadarChart({
  data1,
  data2,
  label1,
  label2,
  color1 = '#0ea5e9',
  color2 = '#f59e0b',
}: DualRadarChartProps) {
  // Transform FMS data for recharts with both datasets
  const chartData = FMS_ORDER.map((key) => ({
    subject: FMS_CATEGORIES[key].label,
    [label1]: data1[key],
    [label2]: data2[key],
    fullMark: 5,
  }))

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#111827', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: '#64748b' }}
          />
          <Radar
            name={label1}
            dataKey={label1}
            stroke={color1}
            fill={color1}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name={label2}
            dataKey={label2}
            stroke={color2}
            fill={color2}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
