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
          display_name: string | null
          std: number | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          std?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          std?: number | null
          created_at?: string
        }
      }
      topic_progress: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          status: 'in_progress' | 'completed'
          last_viewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          status: 'in_progress' | 'completed'
          last_viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          status?: 'in_progress' | 'completed'
          last_viewed_at?: string
        }
      }
      question_attempts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          topic_id: string
          is_correct: boolean
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          topic_id: string
          is_correct: boolean
          attempted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          topic_id?: string
          is_correct?: boolean
          attempted_at?: string
        }
      }
      gauntlet_runs: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          started_at: string
          ended_at: string
          result: 'cleared' | 'broken'
          max_streak: number
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          started_at: string
          ended_at: string
          result: 'cleared' | 'broken'
          max_streak: number
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          started_at?: string
          ended_at?: string
          result?: 'cleared' | 'broken'
          max_streak?: number
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
