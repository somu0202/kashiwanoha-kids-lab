'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DualRadarChart } from '@/components/dashboard/dual-radar-chart'
import { ScoreComparisonTable } from '@/components/dashboard/score-comparison-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Assessment {
  id: string
  assessed_at: string
  memo?: string
  coach: string
  fms_scores: {
    run: number
    balance_beam: number
    jump: number
    throw: number
    catch: number
    dribble: number
    roll: number
  }
  smc_scores?: {
    shuttle_run_sec?: number
    paper_ball_throw_m?: number
  }
}

export default function CompareAssessmentsPage() {
  const params = useParams()
  const router = useRouter()
  const currentAssessmentId = params.id as string

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    null
  )
  const [comparisonAssessmentId, setComparisonAssessmentId] = useState<
    string | null
  >(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssessments()
  }, [currentAssessmentId])

  const fetchAssessments = async () => {
    try {
      setLoading(true)

      // First, get the current assessment to find the child_id
      const currentRes = await fetch(
        `/api/assessments?id=${currentAssessmentId}`
      )
      if (!currentRes.ok) {
        throw new Error('現在の評価の取得に失敗しました')
      }
      const currentData = await currentRes.json()

      // Then, get all assessments for this child
      const compareRes = await fetch(
        `/api/assessments/compare?childId=${currentData.assessment.child_id}`
      )
      if (!compareRes.ok) {
        throw new Error('評価データの取得に失敗しました')
      }
      const compareData = await compareRes.json()

      setAssessments(compareData.assessments)

      // Find and set the current assessment
      const current = compareData.assessments.find(
        (a: Assessment) => a.id === currentAssessmentId
      )
      setCurrentAssessment(current || null)

      // Auto-select the most recent previous assessment (if available)
      const otherAssessments = compareData.assessments.filter(
        (a: Assessment) => a.id !== currentAssessmentId
      )
      if (otherAssessments.length > 0) {
        setComparisonAssessmentId(otherAssessments[0].id)
      }
    } catch (error: any) {
      console.error('Error fetching assessments:', error)
      toast.error(error.message || '評価データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const comparisonAssessment = assessments.find(
    (a) => a.id === comparisonAssessmentId
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (!currentAssessment) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            評価が見つかりません
          </h2>
          <Button asChild>
            <Link href="/dashboard/assessments">評価一覧に戻る</Link>
          </Button>
        </div>
      </div>
    )
  }

  const availableComparisons = assessments.filter(
    (a) => a.id !== currentAssessmentId
  )

  if (availableComparisons.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/assessments/${currentAssessmentId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              評価詳細に戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">評価比較</h1>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              比較できる過去の評価がありません
            </p>
            <p className="text-gray-500 mb-6">
              この子どもの評価が複数ある場合に比較機能が利用できます
            </p>
            <Button asChild>
              <Link href="/dashboard/assessments/new">新しい評価を作成</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/assessments/${currentAssessmentId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              評価詳細に戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">評価比較</h1>
            <p className="text-gray-600 mt-1">
              2つの評価を比較して成長を確認できます
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Selector */}
      <Card>
        <CardHeader>
          <CardTitle>比較する評価を選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しい評価（基準）
              </label>
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="font-semibold text-sky-900">
                  {new Date(currentAssessment.assessed_at).toLocaleDateString(
                    'ja-JP',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </p>
                <p className="text-sm text-sky-700 mt-1">
                  担当: {currentAssessment.coach}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                比較対象の評価
              </label>
              <Select
                value={comparisonAssessmentId || ''}
                onValueChange={setComparisonAssessmentId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="評価を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {availableComparisons.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {new Date(assessment.assessed_at).toLocaleDateString(
                        'ja-JP',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}{' '}
                      - {assessment.coach}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparisonAssessment && (
        <>
          {/* Dual Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>レーダーチャート比較</CardTitle>
            </CardHeader>
            <CardContent>
              <DualRadarChart
                data1={comparisonAssessment.fms_scores}
                data2={currentAssessment.fms_scores}
                label1={new Date(
                  comparisonAssessment.assessed_at
                ).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                label2={new Date(
                  currentAssessment.assessed_at
                ).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                color1="#f59e0b"
                color2="#0ea5e9"
              />
            </CardContent>
          </Card>

          {/* Score Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>詳細スコア比較</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreComparisonTable
                oldScores={comparisonAssessment.fms_scores}
                newScores={currentAssessment.fms_scores}
                oldDate={comparisonAssessment.assessed_at}
                newDate={currentAssessment.assessed_at}
              />
            </CardContent>
          </Card>

          {/* Memos */}
          {(comparisonAssessment.memo || currentAssessment.memo) && (
            <div className="grid md:grid-cols-2 gap-6">
              {comparisonAssessment.memo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-amber-700">
                      過去の評価メモ (
                      {new Date(
                        comparisonAssessment.assessed_at
                      ).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      )
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="whitespace-pre-wrap text-sm">
                        {comparisonAssessment.memo}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentAssessment.memo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sky-700">
                      最新の評価メモ (
                      {new Date(
                        currentAssessment.assessed_at
                      ).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      )
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                      <p className="whitespace-pre-wrap text-sm">
                        {currentAssessment.memo}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
