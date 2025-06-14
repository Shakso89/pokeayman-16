export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          class_id: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          school_id: string | null
          student_id: string
          type: string
          value: number | null
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          class_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          school_id?: string | null
          student_id: string
          type: string
          value?: number | null
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          class_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          school_id?: string | null
          student_id?: string
          type?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          assistants: string[] | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          likes: string[] | null
          name: string
          school_id: string | null
          students: string[] | null
          teacher_id: string | null
        }
        Insert: {
          assistants?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes?: string[] | null
          name: string
          school_id?: string | null
          students?: string[] | null
          teacher_id?: string | null
        }
        Update: {
          assistants?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes?: string[] | null
          name?: string
          school_id?: string | null
          students?: string[] | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          id: string
          reason: string | null
          teacher_id: string | null
          timestamp: string
        }
        Insert: {
          amount: number
          id?: string
          reason?: string | null
          teacher_id?: string | null
          timestamp?: string
        }
        Update: {
          amount?: number
          id?: string
          reason?: string | null
          teacher_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_attempts: {
        Row: {
          attempt_date: string
          id: string
          student_id: string
          used: boolean | null
        }
        Insert: {
          attempt_date?: string
          id?: string
          student_id: string
          used?: boolean | null
        }
        Update: {
          attempt_date?: string
          id?: string
          student_id?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          class_id: string
          coin_reward: number
          correct_option: string | null
          created_at: string
          description: string
          expires_at: string
          id: string
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          question: string | null
          teacher_id: string
          title: string
          type: string
        }
        Insert: {
          class_id: string
          coin_reward?: number
          correct_option?: string | null
          created_at?: string
          description: string
          expires_at: string
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question?: string | null
          teacher_id: string
          title: string
          type: string
        }
        Update: {
          class_id?: string
          coin_reward?: number
          correct_option?: string | null
          created_at?: string
          description?: string
          expires_at?: string
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question?: string | null
          teacher_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      homework_submissions: {
        Row: {
          content: string
          feedback: string | null
          homework_id: string
          id: string
          is_correct: boolean | null
          status: string
          student_id: string
          student_name: string
          submitted_at: string
        }
        Insert: {
          content: string
          feedback?: string | null
          homework_id: string
          id?: string
          is_correct?: boolean | null
          status?: string
          student_id: string
          student_name: string
          submitted_at?: string
        }
        Update: {
          content?: string
          feedback?: string | null
          homework_id?: string
          id?: string
          is_correct?: boolean | null
          status?: string
          student_id?: string
          student_name?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mystery_ball_history: {
        Row: {
          coins_amount: number | null
          created_at: string
          id: string
          pokemon_id: string | null
          pokemon_name: string | null
          result_type: string
          student_id: string
        }
        Insert: {
          coins_amount?: number | null
          created_at?: string
          id?: string
          pokemon_id?: string | null
          pokemon_name?: string | null
          result_type: string
          student_id: string
        }
        Update: {
          coins_amount?: number | null
          created_at?: string
          id?: string
          pokemon_id?: string | null
          pokemon_name?: string | null
          result_type?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_ball_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          recipient_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          recipient_id: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          recipient_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pokemon_collections: {
        Row: {
          id: string
          obtained_at: string
          pokemon_id: string
          pokemon_image: string | null
          pokemon_level: number | null
          pokemon_name: string
          pokemon_rarity: string | null
          pokemon_type: string | null
          student_id: string
        }
        Insert: {
          id?: string
          obtained_at?: string
          pokemon_id: string
          pokemon_image?: string | null
          pokemon_level?: number | null
          pokemon_name: string
          pokemon_rarity?: string | null
          pokemon_type?: string | null
          student_id: string
        }
        Update: {
          id?: string
          obtained_at?: string
          pokemon_id?: string
          pokemon_image?: string | null
          pokemon_level?: number | null
          pokemon_name?: string
          pokemon_rarity?: string | null
          pokemon_type?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pokemon_collections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pokemon_pools: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          available: boolean | null
          created_at: string
          id: string
          pokemon_id: string
          pokemon_image: string | null
          pokemon_level: number | null
          pokemon_name: string
          pokemon_rarity: string | null
          pokemon_type: string | null
          school_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          available?: boolean | null
          created_at?: string
          id?: string
          pokemon_id: string
          pokemon_image?: string | null
          pokemon_level?: number | null
          pokemon_name: string
          pokemon_rarity?: string | null
          pokemon_type?: string | null
          school_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          available?: boolean | null
          created_at?: string
          id?: string
          pokemon_id?: string
          pokemon_image?: string | null
          pokemon_level?: number | null
          pokemon_name?: string
          pokemon_rarity?: string | null
          pokemon_type?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pokemon_pools_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          assigned_at: string
          class_id: string
          id: string
          student_id: string
        }
        Insert: {
          assigned_at?: string
          class_id: string
          id?: string
          student_id: string
        }
        Update: {
          assigned_at?: string
          class_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          avatar_url: string | null
          class_id: string | null
          coins: number
          created_at: string
          display_name: string | null
          id: string
          school_id: string | null
          spent_coins: number
          teacher_id: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          class_id?: string | null
          coins?: number
          created_at?: string
          display_name?: string | null
          id?: string
          school_id?: string | null
          spent_coins?: number
          teacher_id?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          class_id?: string | null
          coins?: number
          created_at?: string
          display_name?: string | null
          id?: string
          school_id?: string | null
          spent_coins?: number
          teacher_id?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          class_id: string | null
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          teacher_id: string | null
          username: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          teacher_id?: string | null
          username?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          teacher_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          teacher_id: string | null
          unlimited_credits: boolean | null
          updated_at: string
          used_credits: number
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          teacher_id?: string | null
          unlimited_credits?: boolean | null
          updated_at?: string
          used_credits?: number
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          teacher_id?: string | null
          unlimited_credits?: boolean | null
          updated_at?: string
          used_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "teacher_credits_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password: string
          role: Database["public"]["Enums"]["app_role"] | null
          subscription_type: string | null
          username: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password: string
          role?: Database["public"]["Enums"]["app_role"] | null
          subscription_type?: string | null
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          subscription_type?: string | null
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          manager_school_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          manager_school_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          manager_school_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_manager_school_id_fkey"
            columns: ["manager_school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["app_role"]
          assigned_school_id?: string
        }
        Returns: boolean
      }
      award_star_of_class: {
        Args: { p_student_id: string; p_class_id: string; p_awarded_by: string }
        Returns: boolean
      }
      calculate_homework_streak: {
        Args: { p_student_id: string }
        Returns: number
      }
      delete_expired_homework: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_teacher_by_login: {
        Args: { login_input: string }
        Returns: {
          id: string
          username: string
          email: string
          display_name: string
          password: string
          role: Database["public"]["Enums"]["app_role"]
          is_active: boolean
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      gift_credits_in_school: {
        Args: { target_user_id: string; credit_amount: number; reason?: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      manage_user_credits: {
        Args: { target_user_id: string; credit_amount: number; reason?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "teacher" | "senior_teacher" | "manager" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["teacher", "senior_teacher", "manager", "owner"],
    },
  },
} as const
