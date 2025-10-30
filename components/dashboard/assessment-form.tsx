'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { assessmentFormSchema, type AssessmentFormData } from '@/lib/validations/schemas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FMS_CATEGORIES, FMS_ORDER } from '@/lib/constants/fms'
import { SMC_CATEGORIES } from '@/lib/constants/smc'
import { RadarChartComponent } from './radar-chart'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AssessmentFormProps {
  childId: string
  childName: string
}

export function AssessmentForm({ childId, childName }: AssessmentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      child_id: childId,
      assessed_at: new Date().toISOString(),
      memo: '',
      fms_scores: {
        run: 3,
        balance_beam: 3,
        jump: 3,
        throw: 3,
        catch: 3,
        dribble: 3,
        roll: 3,
      },
      smc_scores: {
        shuttle_run_sec: undefined,
        paper_ball_throw_m: undefined,
      },
    },
  })

  const fmsScores = form.watch('fms_scores')

  const onSubmit = async (data: AssessmentFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('評価の作成に失敗しました')
      }

      const result = await response.json()
      toast.success('評価を作成しました')
      router.push(`/dashboard/assessments/${result.id}`)
    } catch (error: any) {
      toast.error('エラーが発生しました', {
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>評価対象: {childName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="assessed_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>評価日</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value?.slice(0, 16)}
                      onChange={(e) => {
                        field.onChange(new Date(e.target.value).toISOString())
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* FMS Scores */}
        <Card>
          <CardHeader>
            <CardTitle>7つの基礎動作（1-5段階評価）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {FMS_ORDER.map((key) => (
              <FormField
                key={key}
                control={form.control}
                name={`fms_scores.${key}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="text-2xl">{FMS_CATEGORIES[key].icon}</span>
                      {FMS_CATEGORIES[key].label}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        className="flex gap-4"
                      >
                        {[1, 2, 3, 4, 5].map((score) => (
                          <FormItem key={score} className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value={score.toString()} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {score}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        {/* Preview Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>レーダーチャートプレビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChartComponent data={fmsScores} />
          </CardContent>
        </Card>

        {/* SMC Scores */}
        <Card>
          <CardHeader>
            <CardTitle>SMC-Kids 測定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="smc_scores.shuttle_run_sec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{SMC_CATEGORIES.shuttle_run.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="例: 12.5"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : undefined
                        field.onChange(val)
                      }}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    {SMC_CATEGORIES.shuttle_run.description} （単位: 秒）
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="smc_scores.paper_ball_throw_m"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{SMC_CATEGORIES.paper_ball_throw.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="例: 8.5"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : undefined
                        field.onChange(val)
                      }}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    {SMC_CATEGORIES.paper_ball_throw.description} （単位: m）
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Memo */}
        <Card>
          <CardHeader>
            <CardTitle>所見・次回のフォーカス</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="観察した内容や次回の目標などを記入してください"
                      rows={6}
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
            {isSubmitting ? '保存中...' : '評価を保存'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
