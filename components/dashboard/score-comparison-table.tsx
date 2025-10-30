'use client'

import { FMS_CATEGORIES, FMS_ORDER } from '@/lib/constants/fms'
import type { FMSScoresFormData } from '@/lib/validations/schemas'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface ScoreComparisonTableProps {
  oldScores: FMSScoresFormData
  newScores: FMSScoresFormData
  oldDate: string
  newDate: string
}

export function ScoreComparisonTable({
  oldScores,
  newScores,
  oldDate,
  newDate,
}: ScoreComparisonTableProps) {
  const calculateChange = (oldScore: number, newScore: number) => {
    const diff = newScore - oldScore
    const percentChange = oldScore !== 0 ? ((diff / oldScore) * 100).toFixed(1) : 'N/A'
    return { diff, percentChange }
  }

  const getChangeIcon = (diff: number) => {
    if (diff > 0) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (diff < 0) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getChangeColor = (diff: number) => {
    if (diff > 0) return 'text-green-600'
    if (diff < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              評価項目
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              {new Date(oldDate).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              {new Date(newDate).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              変化
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              変化率
            </th>
          </tr>
        </thead>
        <tbody>
          {FMS_ORDER.map((key, index) => {
            const category = FMS_CATEGORIES[key]
            const oldScore = oldScores[key]
            const newScore = newScores[key]
            const { diff, percentChange } = calculateChange(oldScore, newScore)

            return (
              <tr
                key={key}
                className={`border-b ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50 transition-colors`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium text-gray-900">
                      {category.label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-lg font-semibold text-amber-600">
                  {oldScore}
                </td>
                <td className="px-4 py-3 text-center text-lg font-semibold text-sky-600">
                  {newScore}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {getChangeIcon(diff)}
                    <span className={`font-bold ${getChangeColor(diff)}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold ${getChangeColor(diff)}`}>
                    {percentChange !== 'N/A' && diff !== 0
                      ? `${diff > 0 ? '+' : ''}${percentChange}%`
                      : '-'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-gray-100 border-t-2 border-gray-300">
          <tr>
            <td className="px-4 py-3 font-bold text-gray-900">合計</td>
            <td className="px-4 py-3 text-center text-lg font-bold text-amber-600">
              {FMS_ORDER.reduce((sum, key) => sum + oldScores[key], 0)}
            </td>
            <td className="px-4 py-3 text-center text-lg font-bold text-sky-600">
              {FMS_ORDER.reduce((sum, key) => sum + newScores[key], 0)}
            </td>
            <td className="px-4 py-3 text-center">
              {(() => {
                const totalOld = FMS_ORDER.reduce(
                  (sum, key) => sum + oldScores[key],
                  0
                )
                const totalNew = FMS_ORDER.reduce(
                  (sum, key) => sum + newScores[key],
                  0
                )
                const totalDiff = totalNew - totalOld
                return (
                  <div className="flex items-center justify-center gap-1">
                    {getChangeIcon(totalDiff)}
                    <span className={`font-bold ${getChangeColor(totalDiff)}`}>
                      {totalDiff > 0 ? `+${totalDiff}` : totalDiff}
                    </span>
                  </div>
                )
              })()}
            </td>
            <td className="px-4 py-3 text-center">
              {(() => {
                const totalOld = FMS_ORDER.reduce(
                  (sum, key) => sum + oldScores[key],
                  0
                )
                const totalNew = FMS_ORDER.reduce(
                  (sum, key) => sum + newScores[key],
                  0
                )
                const totalDiff = totalNew - totalOld
                const totalPercent =
                  totalOld !== 0
                    ? ((totalDiff / totalOld) * 100).toFixed(1)
                    : 'N/A'
                return (
                  <span className={`font-bold ${getChangeColor(totalDiff)}`}>
                    {totalPercent !== 'N/A' && totalDiff !== 0
                      ? `${totalDiff > 0 ? '+' : ''}${totalPercent}%`
                      : '-'}
                  </span>
                )
              })()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
