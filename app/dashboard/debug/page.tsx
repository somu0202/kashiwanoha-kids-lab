import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DebugPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get children
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('*')
    .order('last_name', { ascending: true })

  // Get role check
  const { data: roleCheck, error: roleError } = await supabase.rpc(
    'get_user_role',
    { user_id: user.id }
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">デバッグ情報</h1>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>認証ユーザー情報</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>プロファイル情報</CardTitle>
        </CardHeader>
        <CardContent>
          {profileError ? (
            <div className="text-red-600">
              <p className="font-bold">エラー:</p>
              <pre className="bg-red-50 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(profileError, null, 2)}
              </pre>
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Role Check */}
      <Card>
        <CardHeader>
          <CardTitle>ロールチェック関数</CardTitle>
        </CardHeader>
        <CardContent>
          {roleError ? (
            <div className="text-red-600">
              <p className="font-bold">エラー:</p>
              <pre className="bg-red-50 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(roleError, null, 2)}
              </pre>
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify({ role: roleCheck }, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Children Query */}
      <Card>
        <CardHeader>
          <CardTitle>子どもクエリ結果</CardTitle>
        </CardHeader>
        <CardContent>
          {childrenError ? (
            <div className="text-red-600">
              <p className="font-bold">エラー:</p>
              <pre className="bg-red-50 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(childrenError, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="mb-2">
                取得件数: <strong>{children?.length || 0}</strong>
              </p>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(children, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
