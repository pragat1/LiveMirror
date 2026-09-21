export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      interview_answers: {
        Row: {
          analysis: Json | null
          answer_score: number | null
          created_at: string
          duration_seconds: number | null
          filler_word_count: number | null
          filler_words: Json | null
          id: string
          question_id: string
          session_id: string
          speaking_rate: number | null
          transcript: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          answer_score?: number | null
          created_at?: string
          duration_seconds?: number | null
          filler_word_count?: number | null
          filler_words?: Json | null
          id?: string
          question_id: string
          session_id: string
          speaking_rate?: number | null
          transcript: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          answer_score?: number | null
          created_at?: string
          duration_seconds?: number | null
          filler_word_count?: number | null
          filler_words?: Json | null
          id?: string
          question_id?: string
          session_id?: string
          speaking_rate?: number | null
          transcript?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          category: string | null
          created_at: string
          id: string
          question_order: number
          question_text: string
          session_id: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          question_order: number
          question_text: string
          session_id: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          question_order?: number
          question_text?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          created_at: string
          difficulty: string
          duration_seconds: number | null
          ended_at: string | null
          focus_areas: string[]
          id: string
          interview_type: string
          overall_score: number | null
          planned_duration_minutes: number
          report: Json | null
          role: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty: string
          duration_seconds?: number | null
          ended_at?: string | null
          focus_areas?: string[]
          id?: string
          interview_type: string
          overall_score?: number | null
          planned_duration_minutes?: number
          report?: Json | null
          role: string
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          duration_seconds?: number | null
          ended_at?: string | null
          focus_areas?: string[]
          id?: string
          interview_type?: string
          overall_score?: number | null
          planned_duration_minutes?: number
          report?: Json | null
          role?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          default_difficulty: string | null
          email: string | null
          experience_level: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          preferred_interview_type: string | null
          preparing_for: string | null
          target_company: string | null
          target_role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_difficulty?: string | null
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          preferred_interview_type?: string | null
          preparing_for?: string | null
          target_company?: string | null
          target_role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_difficulty?: string | null
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          preferred_interview_type?: string | null
          preparing_for?: string | null
          target_company?: string | null
          target_role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_metrics: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value: number
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string
          extracted_text: string | null
          file_name: string | null
          file_path: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_text?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_text?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
