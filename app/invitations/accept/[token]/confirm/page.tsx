'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [processing, setProcessing] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    confirmInvitation()
  }, [])

  const confirmInvitation = async () => {
    try {
      setProcessing(true)

      const supabase = createClient()

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('認証が必要です。Magic Linkからアクセスしてください。')
      }

      // Accept the invitation
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '招待の受諾に失敗しました')
      }

      const data = await response.json()
      setSuccess(true)
      toast.success('アカウントが作成されました！')

      // Redirect to parent dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/parent')
      }, 2000)
    } catch (err: any) {
      console.error('Error confirming invitation:', err)
      setError(err.message || '招待の確認に失敗しました')
      toast.error(err.message || '招待の確認に失敗しました')
    } finally {
      setProcessing(false)
    }
  }

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-sky-500 mx-auto mb-4" />
            <p className="text-lg text-gray-700">アカウントを作成中...</p>
            <p className="text-sm text-gray-500 mt-2">しばらくお待ちください</p>
          </CardContent>
        </Card>
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
              <CardTitle>エラーが発生しました</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{error}</p>
            <Button
              onClick={() => router.push('/auth/signin')}
              variant="outline"
              className="w-full"
            >
              ログインページへ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <CardTitle>アカウント作成完了！</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              保護者アカウントが正常に作成されました。
            </p>
            <p className="text-gray-600">
              お子様の運動能力評価結果を閲覧できます。
            </p>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                まもなくダッシュボードにリダイレクトします...
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/parent')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              ダッシュボードへ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
