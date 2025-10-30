import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatAge } from '@/lib/utils/age'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AssessmentsPage() {
  const supabase = await createClient()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">評価一覧</h1>
          <p className="text-gray-600 mt-2">実施した評価の一覧</p>
        </div>
        <Button asChild className="bg-sky-500 hover:bg-sky-600">
          <Link href="/dashboard/assessments/new">新規評価を作成</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>評価履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {!assessments || assessments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              まだ評価がありません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>評価日</TableHead>
                  <TableHead>子ども</TableHead>
                  <TableHead>年齢</TableHead>
                  <TableHead>担当コーチ</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment: any) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      {format(
                        new Date(assessment.assessed_at),
                        'yyyy年M月d日',
                        { locale: ja }
                      )}
                    </TableCell>
                    <TableCell>
                      {assessment.children?.last_name}{' '}
                      {assessment.children?.first_name}
                    </TableCell>
                    <TableCell>
                      {assessment.children?.birthdate &&
                        formatAge(assessment.children.birthdate)}
                    </TableCell>
                    <TableCell>
                      {assessment.profiles?.full_name || '不明'}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/assessments/${assessment.id}`}>
                          詳細
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
