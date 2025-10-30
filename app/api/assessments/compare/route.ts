import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json(
        { error: '子どもIDが必要です' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // Fetch all assessments for the child, ordered by date (newest first)
    const { data: assessments, error } = await supabase
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
      .eq('child_id', childId)
      .order('assessed_at', { ascending: false })

    if (error) {
      console.error('Error fetching assessments:', error)
      return NextResponse.json(
        { error: 'データの取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!assessments || assessments.length === 0) {
      return NextResponse.json(
        { error: '評価データが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      assessments: (assessments as any[]).map((assessment: any) => ({
        id: assessment.id,
        assessed_at: assessment.assessed_at,
        memo: assessment.memo,
        coach: assessment.profiles?.full_name,
        fms_scores: assessment.fms_scores,
        smc_scores: assessment.smc_scores,
      })),
    })
  } catch (error: any) {
    console.error('Error in compare API:', error)
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
