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
import { isTokenExpired, isTokenUsed } from '@/lib/utils/token'

export default async function SharedAssessmentPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = await createClient()

  // Get shared link
  const { data: sharedLink, error: linkError } = await supabase
    .from('shared_links')
    .select('*')
    .eq('token', params.token)
    .single()

  if (linkError || !sharedLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>リンクが見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              このリンクは無効か、削除された可能性があります。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if link is expired
  if (isTokenExpired(sharedLink.expires_at)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>リンクの有効期限が切れています</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              このリンクは有効期限が切れています。新しいリンクを発行してください。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if one-time link has been used
  if (isTokenUsed(sharedLink.one_time, sharedLink.accessed_at)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>このリンクは使用済みです</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              このリンクはワンタイムリンクのため、既に使用されています。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Update accessed_at if one-time
  if (sharedLink.one_time && !sharedLink.accessed_at) {
    await supabase
      .from('shared_links')
      .update({ accessed_at: new Date().toISOString() } as any)
      .eq('id', sharedLink.id)
  }

  // Get assessment data
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
    .eq('id', sharedLink.assessment_id)
    .single()

  if (error || !assessment) {
    notFound()
  }

  const child = assessment.children
  const fmsScores = assessment.fms_scores
  const smcScores = assessment.smc_scores
  const coach = assessment.profiles

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Kashiwanoha Kids Lab
            </h1>
            <p className="text-lg text-gray-600">運動能力評価レポート</p>
            <Badge variant="outline" className="mt-2">
              共有リンクで閲覧中
            </Badge>
          </div>

          {/* PDF Download Button */}
          <div className="flex justify-center">
            <Button disabled className="bg-gray-400 cursor-not-allowed" title="PDF機能は準備中です">
              📄 PDFダウンロード（準備中）
            </Button>
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

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 py-4">
            © Kashiwanoha Kids Lab - 運動能力評価システム
          </div>
        </div>
      </div>
    </div>
  )
}
