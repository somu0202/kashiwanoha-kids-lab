import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatAge } from '@/lib/utils/age'

export default async function ChildrenPage() {
  const supabase = await createClient()

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">子ども一覧</h1>
          <p className="text-gray-600 mt-2">登録されている子どもたち</p>
        </div>
        <Button asChild className="bg-sky-500 hover:bg-sky-600">
          <Link href="/dashboard/children/new">新規登録</Link>
        </Button>
      </div>

      {!children || children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            まだ子どもが登録されていません
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Link key={child.id} href={`/dashboard/children/${child.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {child.last_name} {child.first_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    年齢: {formatAge(child.birthdate)}
                  </p>
                  {child.grade && (
                    <p className="text-sm text-gray-600">学年: {child.grade}</p>
                  )}
                  {child.notes && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {child.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
