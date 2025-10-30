import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

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

    // Check if user is admin or coach
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'coach'].includes((profile as any).role)) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, childId } = body

    if (!email || !childId) {
      return NextResponse.json(
        { error: 'メールアドレスと子どもIDが必要です' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }

    // Check if child exists
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, first_name, last_name')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      return NextResponse.json(
        { error: '子どもが見つかりません' },
        { status: 404 }
      )
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('parent_invitations')
      .select('id')
      .eq('email', email)
      .eq('child_id', childId)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'このメールアドレス宛ての招待がすでに送信されています' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = uuidv4()

    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('parent_invitations')
      .insert({
        email,
        token,
        child_id: childId,
        invited_by: user.id,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      } as any)
      .select()
      .single()

    if (invitationError) {
      console.error('Invitation creation error:', invitationError)
      throw new Error('招待の作成に失敗しました')
    }

    // In a production environment, you would send an email here
    // For now, we'll return the invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const invitationUrl = `${baseUrl}/invitations/accept/${token}`

    // TODO: Send email using a service like Resend, SendGrid, or Supabase Auth
    // Example:
    // await sendInvitationEmail({
    //   to: email,
    //   childName: `${child.last_name} ${child.first_name}`,
    //   invitationUrl,
    //   expiresAt: expiresAt.toLocaleDateString('ja-JP'),
    // })

    return NextResponse.json({
      success: true,
      invitation: {
        id: (invitation as any).id,
        email,
        token,
        expires_at: expiresAt.toISOString(),
        invitation_url: invitationUrl,
      },
      message: '招待を作成しました。保護者にこのURLを共有してください。',
    })
  } catch (error: any) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: error.message || '招待の作成に失敗しました' },
      { status: 500 }
    )
  }
}

// GET: List invitations
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

    // Fetch invitations
    const { data: invitations, error } = await supabase
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      throw new Error('招待一覧の取得に失敗しました')
    }

    return NextResponse.json({
      invitations: (invitations as any[]).map((inv) => ({
        id: inv.id,
        email: inv.email,
        token: inv.token,
        child_name: `${inv.children.last_name} ${inv.children.first_name}`,
        invited_by: inv.profiles.full_name,
        status: inv.status,
        expires_at: inv.expires_at,
        created_at: inv.created_at,
        accepted_at: inv.accepted_at,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: error.message || '招待一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
