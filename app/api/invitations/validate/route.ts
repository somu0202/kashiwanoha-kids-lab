import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'トークンが必要です' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch invitation
    const { data: invitation, error } = await supabase
      .from('parent_invitations')
      .select(`
        *,
        children (
          first_name,
          last_name
        ),
        profiles!parent_invitations_invited_by_fkey (
          full_name
        )
      `)
      .eq('token', token)
      .single()

    if (error || !invitation) {
      return NextResponse.json(
        { error: '招待が見つかりません' },
        { status: 404 }
      )
    }

    const invitationData = invitation as any

    // Check if already accepted
    if (invitationData.status === 'accepted') {
      return NextResponse.json(
        { error: 'この招待はすでに使用されています' },
        { status: 400 }
      )
    }

    // Check if expired
    const now = new Date()
    const expiresAt = new Date(invitationData.expires_at)

    if (now > expiresAt || invitationData.status === 'expired') {
      // Update status to expired
      await supabase
        .from('parent_invitations')
        .update({ status: 'expired' } as any)
        .eq('token', token)

      return NextResponse.json(
        { error: 'この招待は期限切れです' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      invitation: {
        email: invitationData.email,
        child_name: `${invitationData.children.last_name} ${invitationData.children.first_name}`,
        invited_by: invitationData.profiles.full_name,
        expires_at: invitationData.expires_at,
        status: invitationData.status,
      },
    })
  } catch (error: any) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: error.message || '招待の検証に失敗しました' },
      { status: 500 }
    )
  }
}
