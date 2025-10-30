import { createClient } from '@/lib/supabase/server'
import { assessmentFormSchema } from '@/lib/validations/schemas'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = assessmentFormSchema.parse(body)

    // Create assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        child_id: validatedData.child_id,
        assessed_at: validatedData.assessed_at,
        coach_id: user.id,
        memo: validatedData.memo,
      } as any)
      .select()
      .single()

    if (assessmentError) throw assessmentError
    if (!assessment) throw new Error('評価の作成に失敗しました')

    // Create FMS scores
    const { error: fmsError } = await supabase.from('fms_scores').insert({
      assessment_id: (assessment as any).id,
      ...validatedData.fms_scores,
    } as any)

    if (fmsError) throw fmsError

    // Create SMC scores (if provided)
    if (
      validatedData.smc_scores.shuttle_run_sec ||
      validatedData.smc_scores.paper_ball_throw_m
    ) {
      const { error: smcError } = await supabase.from('smc_scores').insert({
        assessment_id: (assessment as any).id,
        shuttle_run_sec: validatedData.smc_scores.shuttle_run_sec,
        paper_ball_throw_m: validatedData.smc_scores.paper_ball_throw_m,
      } as any)

      if (smcError) throw smcError
    }

    return NextResponse.json(assessment)
  } catch (error: any) {
    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { error: error.message || '評価の作成に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        *,
        children (
          id,
          first_name,
          last_name,
          birthdate
        ),
        fms_scores (*),
        smc_scores (*),
        profiles!assessments_coach_id_fkey (
          full_name
        )
      `)
      .order('assessed_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(assessments)
  } catch (error: any) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      { error: error.message || '評価の取得に失敗しました' },
      { status: 500 }
    )
  }
}
