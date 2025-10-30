import { z } from 'zod'

// Profile schemas
export const profileSchema = z.object({
  role: z.enum(['admin', 'coach', 'parent']),
  full_name: z.string().min(1, '氏名を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
})

// Child schemas
export const childSchema = z.object({
  first_name: z.string().min(1, '名を入力してください'),
  last_name: z.string().min(1, '姓を入力してください'),
  birthdate: z.string().min(1, '生年月日を入力してください'),
  grade: z.string().optional(),
  notes: z.string().optional(),
})

export const childFormSchema = childSchema.extend({
  owner_profile_id: z.string().uuid(),
})

// FMS scores schema - 7 basic movements (1-5 scale)
export const fmsScoresSchema = z.object({
  run: z.number().int().min(1, '1以上の値を入力してください').max(5, '5以下の値を入力してください'),
  balance_beam: z.number().int().min(1, '1以上の値を入力してください').max(5, '5以下の値を入力してください'),
  jump: z.number().int().min(1, '1以上の値を入力してください').max(5, '5以下の値を入力してください'),
  throw: z.number().int().min(1, '1以上の値を入力してください').max(5, '5以下の値を入力してください'),
  catch: z.number().int().min(1, '1以上の値を入力してください').max(5, '5以下の値を入力してください'),
  dribble: z.number().int().min(1, '1以上の値を入力してください').max(5, '5以下の値を入力してください'),
  roll: z.number().int().min(1, '1以上の値を入力してください').max(5, '5以下の値を入力してください'),
})

// SMC scores schema
export const smcScoresSchema = z.object({
  shuttle_run_sec: z.number()
    .min(5.0, '5.0秒以上の値を入力してください')
    .max(60.0, '60.0秒以下の値を入力してください')
    .optional(),
  paper_ball_throw_m: z.number()
    .min(0.1, '0.1m以上の値を入力してください')
    .max(30.0, '30.0m以下の値を入力してください')
    .optional(),
})

// Assessment schema
export const assessmentSchema = z.object({
  child_id: z.string().uuid('有効な子どもIDを指定してください'),
  assessed_at: z.string().optional(),
  memo: z.string().optional(),
})

// Combined assessment form schema
export const assessmentFormSchema = assessmentSchema.extend({
  fms_scores: fmsScoresSchema,
  smc_scores: smcScoresSchema,
})

// Shared link schema
export const sharedLinkSchema = z.object({
  assessment_id: z.string().uuid(),
  expires_at: z.string(),
  one_time: z.boolean().default(false),
})

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export const signupSchema = loginSchema.extend({
  full_name: z.string().min(1, '氏名を入力してください'),
  role: z.enum(['admin', 'coach', 'parent']),
})

// Export types
export type ProfileFormData = z.infer<typeof profileSchema>
export type ChildFormData = z.infer<typeof childFormSchema>
export type FMSScoresFormData = z.infer<typeof fmsScoresSchema>
export type SMCScoresFormData = z.infer<typeof smcScoresSchema>
export type AssessmentFormData = z.infer<typeof assessmentFormSchema>
export type SharedLinkFormData = z.infer<typeof sharedLinkSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
