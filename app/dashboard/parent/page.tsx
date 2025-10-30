import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatAge } from '@/lib/utils/age'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { User, Calendar, TrendingUp } from 'lucide-react'

export default async function ParentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get parent profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as any).role !== 'parent') {
    redirect('/dashboard')
  }

  // Get children for this parent
  const { data: relationships } = await supabase
    .from('parent_child_relationships')
    .select(`
      child_id,
      children (
        id,
        first_name,
        last_name,
        birthdate,
        grade,
        gender
      )
    `)
    .eq('parent_profile_id', user.id)

  const children = relationships?.map((rel) => (rel as any).children) || []

  // Get latest assessment for each child
  const childrenWithAssessments = await Promise.all(
    children.map(async (child: any) => {
      const { data: assessments } = await supabase
        .from('assessments')
        .select(`
          id,
          assessed_at,
          fms_scores (*),
          smc_scores (*),
          profiles!assessments_coach_id_fkey (
            full_name
          )
        `)
        .eq('child_id', child.id)
        .order('assessed_at', { ascending: false })
        .limit(3)

      return {
        ...child,
        assessments: assessments || [],
      }
    })
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">保護者ダッシュボード</h1>
        <p className="text-gray-600 mt-2">
          お子様の運動能力評価結果を確認できます
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-sky-600" />
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {(profile as any).full_name} さん
              </p>
              <p className="text-sm text-gray-600">
                登録されているお子様: {children.length}名
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children List */}
      {children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              まだお子様が登録されていません
            </p>
            <p className="text-gray-500">
              コーチから招待メールが届くまでお待ちください
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {childrenWithAssessments.map((child) => {
            const latestAssessment = child.assessments[0]
            const totalAssessments = child.assessments.length

            return (
              <Card key={child.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {child.last_name} {child.first_name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>年齢: {formatAge(child.birthdate)}</span>
                        {child.grade && <span>学年: {child.grade}</span>}
                        {child.gender && (
                          <Badge variant="outline">
                            {child.gender === 'male' ? '男子' : '女子'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">評価回数</p>
                      <p className="text-3xl font-bold text-sky-600">
                        {totalAssessments}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {latestAssessment ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg border border-sky-200">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            最新の評価
                          </p>
                          <p className="font-semibold text-gray-900">
                            {format(
                              new Date(latestAssessment.assessed_at),
                              'yyyy年M月d日',
                              { locale: ja }
                            )}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            担当:{' '}
                            {
                              (latestAssessment as any).profiles?.full_name
                            }
                          </p>
                        </div>
                        <Button asChild className="bg-sky-500 hover:bg-sky-600">
                          <Link
                            href={`/dashboard/assessments/${latestAssessment.id}`}
                          >
                            詳細を見る
                          </Link>
                        </Button>
                      </div>

                      {child.assessments.length > 1 && (
                        <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-purple-900">
                              成長を確認
                            </p>
                            <p className="text-xs text-purple-700">
                              過去{child.assessments.length}回の評価を比較できます
                            </p>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-purple-300"
                          >
                            <Link
                              href={`/dashboard/assessments/${latestAssessment.id}/compare`}
                            >
                              比較する
                            </Link>
                          </Button>
                        </div>
                      )}

                      {/* Recent Assessments */}
                      {child.assessments.length > 1 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            最近の評価履歴
                          </p>
                          <div className="space-y-2">
                            {child.assessments.slice(1).map((assessment: any) => (
                              <Link
                                key={assessment.id}
                                href={`/dashboard/assessments/${assessment.id}`}
                                className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">
                                      {format(
                                        new Date(assessment.assessed_at),
                                        'yyyy年M月d日',
                                        { locale: ja }
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {assessment.profiles?.full_name}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">まだ評価データがありません</p>
                      <p className="text-sm text-gray-500 mt-2">
                        評価が登録されると、こちらに表示されます
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
