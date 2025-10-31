import { createClient } from '@/lib/supabase/server'
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
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'トークンが必要です' },
        { status: 400 }
      )
    }

    // Fetch invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('parent_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: '招待が見つかりません' },
        { status: 404 }
      )
    }

    const invitationData = invitation as any

    // Verify email matches
    if (invitationData.email !== user.email) {
      return NextResponse.json(
        { error: 'メールアドレスが一致しません' },
        { status: 403 }
      )
    }

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
      return NextResponse.json(
        { error: 'この招待は期限切れです' },
        { status: 400 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Profile exists, just create relationship if it's a parent
      if ((existingProfile as any).role !== 'parent') {
        return NextResponse.json(
          { error: 'このアカウントはすでに別の役割で登録されています' },
          { status: 400 }
        )
      }
    } else {
      // Create parent profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || '保護者',
        role: 'parent',
      } as any)

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error('プロフィールの作成に失敗しました')
      }
    }

    // Create parent-child relationship
    const { error: relationshipError } = await supabase
      .from('parent_child_relationships')
      .insert({
        parent_profile_id: user.id,
        child_id: invitationData.child_id,
      } as any)

    if (relationshipError) {
      // Check if relationship already exists
      if (relationshipError.code === '23505') {
        // Unique constraint violation - relationship already exists
        console.log('Relationship already exists, continuing...')
      } else {
        console.error('Relationship creation error:', relationshipError)
        throw new Error('親子関係の作成に失敗しました')
      }
    }

    // Update invitation status
    const { error: updateError } = (await supabase
      .from('parent_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('token', token)) as any

    if (updateError) {
      console.error('Invitation update error:', updateError)
      // Don't throw error here, as the important parts succeeded
    }

    return NextResponse.json({
      success: true,
      message: '保護者アカウントが作成されました',
    })
  } catch (error: any) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: error.message || '招待の受諾に失敗しました' },
      { status: 500 }
    )
  }
}
