export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'coach' | 'parent'
          full_name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'coach' | 'parent'
          full_name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'coach' | 'parent'
          full_name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          owner_profile_id: string
          first_name: string
          last_name: string
          birthdate: string
          grade: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_profile_id: string
          first_name: string
          last_name: string
          birthdate: string
          grade?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_profile_id?: string
          first_name?: string
          last_name?: string
          birthdate?: string
          grade?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          child_id: string
          assessed_at: string
          coach_id: string
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          assessed_at?: string
          coach_id: string
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          assessed_at?: string
          coach_id?: string
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fms_scores: {
        Row: {
          id: string
          assessment_id: string
          run: number
          balance_beam: number
          jump: number
          throw: number
          catch: number
          dribble: number
          roll: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          run: number
          balance_beam: number
          jump: number
          throw: number
          catch: number
          dribble: number
          roll: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          run?: number
          balance_beam?: number
          jump?: number
          throw?: number
          catch?: number
          dribble?: number
          roll?: number
          created_at?: string
          updated_at?: string
        }
      }
      smc_scores: {
        Row: {
          id: string
          assessment_id: string
          shuttle_run_sec: number | null
          paper_ball_throw_m: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          shuttle_run_sec?: number | null
          paper_ball_throw_m?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          shuttle_run_sec?: number | null
          paper_ball_throw_m?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      shared_links: {
        Row: {
          id: string
          assessment_id: string
          token: string
          expires_at: string
          one_time: boolean
          accessed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          token: string
          expires_at: string
          one_time?: boolean
          accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          token?: string
          expires_at?: string
          one_time?: boolean
          accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
