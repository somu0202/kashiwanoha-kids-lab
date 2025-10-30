import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { AssessmentReport } from '@/lib/pdf/report'

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

    // Prepare data for PDF
    const reportData = {
      child: assessment.children,
      assessment: {
        assessed_at: assessment.assessed_at,
      },
      coach: assessment.profiles,
      fms_scores: assessment.fms_scores,
      smc_scores: assessment.smc_scores,
      memo: assessment.memo,
    }

    // Generate PDF
    const stream = await renderToStream(
      <AssessmentReport data={reportData} />
    )

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="assessment-${assessmentId}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: error.message || 'PDFの生成に失敗しました' },
      { status: 500 }
    )
  }
}
