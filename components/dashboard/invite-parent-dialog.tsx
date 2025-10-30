'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, Copy, CheckCircle } from 'lucide-react'

interface InviteParentDialogProps {
  childId: string
  childName: string
}

export function InviteParentDialog({
  childId,
  childName,
}: InviteParentDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('メールアドレスを入力してください')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          childId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '招待の送信に失敗しました')
      }

      const data = await response.json()
      setInvitationUrl(data.invitation.invitation_url)
      toast.success('招待を作成しました！')
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      toast.error(error.message || '招待の送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyUrl = () => {
    if (invitationUrl) {
      navigator.clipboard.writeText(invitationUrl)
      setCopied(true)
      toast.success('URLをコピーしました')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setEmail('')
    setInvitationUrl(null)
    setCopied(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail className="w-4 h-4" />
          保護者を招待
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>保護者アカウント招待</DialogTitle>
          <DialogDescription>
            {childName} の保護者にメールで招待を送信します
          </DialogDescription>
        </DialogHeader>

        {!invitationUrl ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">保護者のメールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                このメールアドレスで保護者アカウントが作成されます
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '送信中...' : '招待を送信'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium">招待URLを作成しました</p>
            </div>

            <div className="space-y-2">
              <Label>招待URL</Label>
              <div className="flex gap-2">
                <Input
                  value={invitationUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                このURLを保護者に共有してください（7日間有効）
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 本番環境では、このURLが自動的にメールで送信されます。
                <br />
                開発中は手動でURLを共有してください。
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              閉じる
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
