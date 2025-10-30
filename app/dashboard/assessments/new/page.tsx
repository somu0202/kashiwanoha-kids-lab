import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { AssessmentForm } from '@/components/dashboard/assessment-form'

export default async function NewAssessmentPage({
  searchParams,
}: {
  searchParams: { child?: string }
}) {
  const supabase = await createClient()

  // Get child_id from query params
  const childId = searchParams.child

  if (!childId) {
    // Show child selector if no child specified
    const { data: children } = await supabase
      .from('children')
      .select('*')
      .order('last_name', { ascending: true })

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">新規評価を作成</h1>
          <p className="text-gray-600 mt-2">評価する子どもを選択してください</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {!children || children.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだ子どもが登録されていません。
                <br />
                先に子どもを登録してください。
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {children.map((child: any) => (
                  <a
                    key={child.id}
                    href={`/dashboard/assessments/new?child=${child.id}`}
                    className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-medium text-lg">
                      {child.last_name} {child.first_name}
                    </p>
                    {child.grade && (
                      <p className="text-sm text-gray-600">{child.grade}</p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch child data
  const { data: child, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single()

  if (error || !child) {
    redirect('/dashboard/assessments/new')
  }

  const childData = child as any

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">新規評価を作成</h1>
        <p className="text-gray-600 mt-2">7つの基礎動作とSMC-Kidsの測定結果を入力</p>
      </div>

      <AssessmentForm
        childId={childData.id}
        childName={`${childData.last_name} ${childData.first_name}`}
      />
    </div>
  )
}
