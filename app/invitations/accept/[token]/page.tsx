'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface InvitationData {
  email: string
  child_name: string
  invited_by: string
  expires_at: string
  status: string
}

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  useEffect(() => {
    fetchInvitation()
  }, [token])

  const fetchInvitation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invitations/validate?token=${token}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '招待の確認に失敗しました')
      }

      const data = await response.json()
      setInvitation(data.invitation)
      setEmail(data.invitation.email)
    } catch (err: any) {
      console.error('Error fetching invitation:', err)
      setError(err.message || '招待の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    try {
      setIsAccepting(true)

      // Send Magic Link for authentication
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/invitations/accept/${token}/confirm`,
        },
      })

      if (authError) {
        throw authError
      }

      setMagicLinkSent(true)
      toast.success('認証メールを送信しました！')
    } catch (err: any) {
      console.error('Error sending magic link:', err)
      toast.error(err.message || 'メール送信に失敗しました')
    } finally {
      setIsAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="w-8 h-8" />
              <CardTitle>招待が無効です</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{error}</p>
            <p className="text-sm text-gray-500">
              招待が期限切れであるか、すでに使用されています。
              <br />
              新しい招待を依頼してください。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 text-green-600">
              <Mail className="w-8 h-8" />
              <CardTitle>メールを確認してください</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              <strong>{email}</strong> 宛に認証メールを送信しました。
            </p>
            <p className="text-gray-600">
              メール内のリンクをクリックして、アカウントの作成を完了してください。
            </p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 メールが届かない場合は、迷惑メールフォルダを確認してください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 text-sky-600">
            <CheckCircle className="w-8 h-8" />
            <CardTitle>保護者アカウント招待</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg space-y-2">
            <p className="text-gray-700">
              <strong>{invitation.child_name}</strong> の保護者として招待されました
            </p>
            <p className="text-sm text-gray-600">
              招待者: {invitation.invited_by}
            </p>
            <p className="text-sm text-gray-500">
              有効期限:{' '}
              {new Date(invitation.expires_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="mt-1"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                このメールアドレスで保護者アカウントが作成されます
              </p>
            </div>

            <Button
              onClick={handleAcceptInvitation}
              disabled={isAccepting || !email}
              className="w-full bg-sky-500 hover:bg-sky-600"
              size="lg"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  処理中...
                </>
              ) : (
                <>招待を受諾してアカウントを作成</>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              アカウントを作成すると、お子様の運動能力評価結果を閲覧できるようになります
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
