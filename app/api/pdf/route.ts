import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('id')

    if (!assessmentId) {
      return NextResponse.json(
        { error: '評価IDが必要です' },
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

    // Fetch assessment data with all related information
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select(`
        *,
        children (
          first_name,
          last_name,
          birthdate,
          grade
        ),
        fms_scores (*),
        smc_scores (*),
        profiles!assessments_coach_id_fkey (
          full_name
        )
      `)
      .eq('id', assessmentId)
      .single()

    if (error || !assessment) {
      return NextResponse.json(
        { error: '評価が見つかりません' },
        { status: 404 }
      )
    }

    // For now, return JSON data instead of PDF
    // PDF generation will be implemented in a future update
    return NextResponse.json({
      message: 'PDF生成機能は現在準備中です。評価データを表示しています。',
      data: {
        child: assessment.children,
        assessment: {
          assessed_at: assessment.assessed_at,
          memo: assessment.memo,
        },
        coach: assessment.profiles,
        fms_scores: assessment.fms_scores,
        smc_scores: assessment.smc_scores,
      }
    })
  } catch (error: any) {
    console.error('Error fetching assessment data:', error)
    return NextResponse.json(
      { error: error.message || 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}
