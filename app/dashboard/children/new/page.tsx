'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { childFormSchema, type ChildFormData } from '@/lib/validations/schemas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatAge } from '@/lib/utils/age'

export default function NewChildPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculatedAge, setCalculatedAge] = useState<string>('')
  const supabase = createClient()

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      birthdate: '',
      grade: '',
      notes: '',
    },
  })

  // Watch birthdate field and calculate age
  const birthdate = form.watch('birthdate')
  
  // Calculate age when birthdate changes
  const handleBirthdateChange = (value: string) => {
    if (value) {
      const age = formatAge(value)
      setCalculatedAge(age)
    } else {
      setCalculatedAge('')
    }
  }

  const onSubmit = async (data: ChildFormData) => {
    setIsSubmitting(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('ログインが必要です')
      }

      // Insert child
      const { error } = await supabase.from('children').insert({
        ...data,
        owner_profile_id: user.id,
      } as any)

      if (error) throw error

      toast.success('子どもを登録しました')
      router.push('/dashboard/children')
    } catch (error: any) {
      toast.error('エラーが発生しました', {
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">子どもの新規登録</h1>
        <p className="text-gray-600 mt-2">基本情報を入力してください</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓</FormLabel>
                      <FormControl>
                        <Input placeholder="田中" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名</FormLabel>
                      <FormControl>
                        <Input placeholder="太郎" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>生年月日</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e)
                          handleBirthdateChange(e.target.value)
                        }}
                      />
                    </FormControl>
                    {calculatedAge && (
                      <FormDescription className="text-sky-600 font-medium">
                        年齢: {calculatedAge}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学年（任意）</FormLabel>
                    <FormControl>
                      <Input placeholder="小学1年生" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>備考（任意）</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="特記事項があれば記入してください"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? '登録中...' : '登録する'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
