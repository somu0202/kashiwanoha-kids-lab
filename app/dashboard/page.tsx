import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatAge } from '@/lib/utils/age'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get recent assessments with child info
  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      *,
      children (
        id,
        first_name,
        last_name,
        birthdate
      ),
      profiles!assessments_coach_id_fkey (
        full_name
      )
    `)
    .order('assessed_at', { ascending: false })
    .limit(5)

  // Get total counts
  const { count: childrenCount } = await supabase
    .from('children')
    .select('*', { count: 'exact', head: true })

  const { count: assessmentsCount } = await supabase
    .from('assessments')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">運動能力評価システムの概要</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録児童数</CardTitle>
            <span className="text-2xl">👶</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{childrenCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              システムに登録されている子どもの数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">評価回数</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessmentsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              これまでの評価総数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の評価</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              当月実施分（準備中）
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild className="bg-sky-500 hover:bg-sky-600">
            <Link href="/dashboard/children/new">子どもを登録</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/assessments/new">新規評価を作成</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>最近の評価</CardTitle>
        </CardHeader>
        <CardContent>
          {!assessments || assessments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              まだ評価がありません
            </p>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment: any) => (
                <Link
                  key={assessment.id}
                  href={`/dashboard/assessments/${assessment.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {assessment.children?.last_name}{' '}
                        {assessment.children?.first_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {assessment.children?.birthdate &&
                          formatAge(assessment.children.birthdate)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-gray-600">
                        {format(
                          new Date(assessment.assessed_at),
                          'yyyy年M月d日',
                          { locale: ja }
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        担当: {assessment.profiles?.full_name || '不明'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
