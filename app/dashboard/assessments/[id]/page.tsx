import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadarChartComponent } from '@/components/dashboard/radar-chart'
import { formatAge } from '@/lib/utils/age'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { FMS_CATEGORIES, FMS_ORDER } from '@/lib/constants/fms'
import { SMC_CATEGORIES } from '@/lib/constants/smc'
import Link from 'next/link'

export default async function AssessmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select(`
      *,
      children (
        *
      ),
      fms_scores (*),
      smc_scores (*),
      profiles!assessments_coach_id_fkey (
        full_name
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !assessment) {
    notFound()
  }

  const child = assessment.children
  const fmsScores = assessment.fms_scores
  const smcScores = assessment.smc_scores
  const coach = assessment.profiles

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">評価詳細</h1>
          <p className="text-gray-600 mt-2">
            {child.last_name} {child.first_name} の評価結果
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/api/pdf?id=${assessment.id}`} target="_blank">
              📄 PDFダウンロード
            </Link>
          </Button>
          <Button asChild className="bg-sky-500 hover:bg-sky-600">
            <Link href={`/dashboard/assessments/${assessment.id}/share`}>
              🔗 共有リンク作成
            </Link>
          </Button>
        </div>
      </div>

      {/* Child & Assessment Info */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">氏名:</span>
              <span className="font-medium">
                {child.last_name} {child.first_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">年齢:</span>
              <span className="font-medium">{formatAge(child.birthdate)}</span>
            </div>
            {child.grade && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">学年:</span>
                <span className="font-medium">{child.grade}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">評価日:</span>
              <span className="font-medium">
                {format(new Date(assessment.assessed_at), 'yyyy年M月d日', {
                  locale: ja,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">担当コーチ:</span>
              <span className="font-medium">{coach.full_name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart & SMC Scores */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>7つの基礎動作レーダーチャート</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChartComponent data={fmsScores} showLegend={false} />
          </CardContent>
        </Card>

        {/* SMC Scores */}
        <Card>
          <CardHeader>
            <CardTitle>SMC-Kids 測定結果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {smcScores?.shuttle_run_sec && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">
                  {SMC_CATEGORIES.shuttle_run.label}
                </p>
                <p className="text-3xl font-bold text-sky-600">
                  {smcScores.shuttle_run_sec.toFixed(2)}{' '}
                  <span className="text-lg text-gray-600">秒</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {SMC_CATEGORIES.shuttle_run.description}
                </p>
              </div>
            )}

            {smcScores?.paper_ball_throw_m && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">
                  {SMC_CATEGORIES.paper_ball_throw.label}
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {smcScores.paper_ball_throw_m.toFixed(1)}{' '}
                  <span className="text-lg text-gray-600">m</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {SMC_CATEGORIES.paper_ball_throw.description}
                </p>
              </div>
            )}

            {!smcScores?.shuttle_run_sec && !smcScores?.paper_ball_throw_m && (
              <p className="text-gray-500 text-center py-8">
                SMC測定データがありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FMS Scores Detail */}
      <Card>
        <CardHeader>
          <CardTitle>7つの基礎動作の詳細スコア</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {FMS_ORDER.map((key) => {
              const score = fmsScores[key]
              const category = FMS_CATEGORIES[key]
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.label}</p>
                      <p className="text-sm text-gray-500">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={score >= 4 ? 'default' : 'secondary'}
                    className="text-lg px-4 py-2"
                  >
                    {score} / 5
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Memo */}
      {assessment.memo && (
        <Card>
          <CardHeader>
            <CardTitle>所見・次回のフォーカス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="whitespace-pre-wrap">{assessment.memo}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
