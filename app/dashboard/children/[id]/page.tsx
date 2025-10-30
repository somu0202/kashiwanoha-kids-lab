import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InviteParentDialog } from '@/components/dashboard/invite-parent-dialog'
import { formatAge } from '@/lib/utils/age'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react'

export default async function ChildDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get child data
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('*')
    .eq('id', params.id)
    .single()

  if (childError || !child) {
    notFound()
  }

  const childData = child as any

  // Get assessments for this child
  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      id,
      assessed_at,
      memo,
      fms_scores (*),
      smc_scores (*),
      profiles!assessments_coach_id_fkey (
        full_name
      )
    `)
    .eq('child_id', params.id)
    .order('assessed_at', { ascending: false })

  // Get parent invitations for this child
  const { data: invitations } = await supabase
    .from('parent_invitations')
    .select(`
      *,
      profiles!parent_invitations_invited_by_fkey (
        full_name
      )
    `)
    .eq('child_id', params.id)
    .order('created_at', { ascending: false })

  // Get parent relationships
  const { data: parentRelationships } = await supabase
    .from('parent_child_relationships')
    .select(`
      *,
      profiles!parent_child_relationships_parent_profile_id_fkey (
        full_name,
        email
      )
    `)
    .eq('child_id', params.id)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/children">
              <ArrowLeft className="w-4 h-4 mr-2" />
              子ども一覧に戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {childData.last_name} {childData.first_name}
            </h1>
            <p className="text-gray-600 mt-1">子どもの詳細情報</p>
          </div>
        </div>
        <div className="flex gap-2">
          <InviteParentDialog
            childId={params.id}
            childName={`${childData.last_name} ${childData.first_name}`}
          />
          <Button asChild className="bg-sky-500 hover:bg-sky-600">
            <Link href="/dashboard/assessments/new">評価を作成</Link>
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">氏名</p>
              <p className="text-lg font-medium">
                {childData.last_name} {childData.first_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">生年月日</p>
              <p className="text-lg font-medium">
                {format(new Date(childData.birthdate), 'yyyy年M月d日', {
                  locale: ja,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">年齢</p>
              <p className="text-lg font-medium">{formatAge(childData.birthdate)}</p>
            </div>
          </div>
          <div className="space-y-3">
            {childData.grade && (
              <div>
                <p className="text-sm text-gray-600">学年</p>
                <p className="text-lg font-medium">{childData.grade}</p>
              </div>
            )}
            {childData.gender && (
              <div>
                <p className="text-sm text-gray-600">性別</p>
                <Badge variant="outline" className="text-base">
                  {childData.gender === 'male' ? '男子' : '女子'}
                </Badge>
              </div>
            )}
          </div>
          {childData.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">備考</p>
              <p className="text-base text-gray-800 p-3 bg-gray-50 rounded-lg">
                {childData.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle>保護者情報</CardTitle>
        </CardHeader>
        <CardContent>
          {parentRelationships && parentRelationships.length > 0 ? (
            <div className="space-y-3">
              {parentRelationships.map((rel: any) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {rel.profiles.full_name}
                    </p>
                    <p className="text-sm text-gray-600">{rel.profiles.email}</p>
                  </div>
                  <Badge className="bg-green-600">登録済み</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              保護者アカウントが登録されていません
            </p>
          )}

          {/* Pending Invitations */}
          {invitations && invitations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                招待状況
              </h3>
              <div className="space-y-2">
                {invitations.map((invitation: any) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {invitation.email}
                      </p>
                      <p className="text-xs text-gray-600">
                        招待者: {invitation.profiles.full_name} |{' '}
                        {format(new Date(invitation.created_at), 'yyyy/M/d', {
                          locale: ja,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        invitation.status === 'accepted'
                          ? 'default'
                          : invitation.status === 'expired'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {invitation.status === 'accepted'
                        ? '受諾済み'
                        : invitation.status === 'expired'
                        ? '期限切れ'
                        : '招待中'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>評価履歴</CardTitle>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {assessments?.length || 0}件
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!assessments || assessments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">まだ評価データがありません</p>
              <Button asChild>
                <Link href="/dashboard/assessments/new">最初の評価を作成</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((assessment: any) => (
                <Link
                  key={assessment.id}
                  href={`/dashboard/assessments/${assessment.id}`}
                  className="block p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-sky-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {format(
                            new Date(assessment.assessed_at),
                            'yyyy年M月d日',
                            { locale: ja }
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          担当: {assessment.profiles.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assessments.length > 1 && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/dashboard/assessments/${assessment.id}/compare`}
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            比較
                          </Link>
                        </Button>
                      )}
                      <Button asChild size="sm">
                        <span>詳細</span>
                      </Button>
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
