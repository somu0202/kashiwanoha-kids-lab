import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateShareToken, calculateExpiresAt } from '@/lib/utils/token'

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
    const { assessment_id, expires_in_days = 7, one_time = false } = body

    if (!assessment_id) {
      return NextResponse.json(
        { error: '評価IDが必要です' },
        { status: 400 }
      )
    }

    // Generate token
    const token = generateShareToken()
    const expires_at = calculateExpiresAt(expires_in_days)

    // Create shared link
    const { data: sharedLink, error } = await supabase
      .from('shared_links')
      .insert({
        assessment_id,
        token,
        expires_at: expires_at.toISOString(),
        one_time,
      } as any)
      .select()
      .single()

    if (error) throw error
    if (!sharedLink) throw new Error('共有リンクの作成に失敗しました')

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${token}`

    return NextResponse.json({
      ...(sharedLink as any),
      share_url: shareUrl,
    })
  } catch (error: any) {
    console.error('Error creating share link:', error)
    return NextResponse.json(
      { error: error.message || '共有リンクの作成に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessment_id')

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

    // Get shared links for this assessment
    const { data: links, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Add share URLs
    const linksWithUrls = (links || []).map((link: any) => ({
      ...link,
      share_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${link.token}`,
    }))

    return NextResponse.json(linksWithUrls)
  } catch (error: any) {
    console.error('Error fetching share links:', error)
    return NextResponse.json(
      { error: error.message || '共有リンクの取得に失敗しました' },
      { status: 500 }
    )
  }
}
