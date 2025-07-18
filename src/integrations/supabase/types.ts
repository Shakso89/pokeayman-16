export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          recipient_id: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      class_membership: {
        Row: {
          class_id: string
          id: string
          joined_at: string | null
          role_in_class: string
          user_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string | null
          role_in_class: string
          user_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string | null
          role_in_class?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_membership_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
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
          star_student_id: string | null
          students: string[] | null
          teacher_id: string | null
          top_student_id: string | null
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
          star_student_id?: string | null
          students?: string[] | null
          teacher_id?: string | null
          top_student_id?: string | null
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
          star_student_id?: string | null
          students?: string[] | null
          teacher_id?: string | null
          top_student_id?: string | null
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
      coin_history: {
        Row: {
          change_amount: number
          created_at: string | null
          id: string
          reason: string
          related_entity_id: string | null
          related_entity_type: string | null
          user_id: string
        }
        Insert: {
          change_amount: number
          created_at?: string | null
          id?: string
          reason: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id: string
        }
        Update: {
          change_amount?: number
          created_at?: string | null
          id?: string
          reason?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string
        }
        Relationships: []
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
          reward_coins: number | null
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
          reward_coins?: number | null
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
          reward_coins?: number | null
          teacher_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      homework_submissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
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
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
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
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
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
      pokemon_pool: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          power_stats: Json | null
          price: number
          rarity: string
          type_1: string
          type_2: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          power_stats?: Json | null
          price?: number
          rarity: string
          type_1: string
          type_2?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          power_stats?: Json | null
          price?: number
          rarity?: string
          type_1?: string
          type_2?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          top_student_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          top_student_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          top_student_id?: string | null
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
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_pokemon_collection: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          id: string
          pokemon_id: string
          source: string | null
          student_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          id?: string
          pokemon_id: string
          source?: string | null
          student_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          id?: string
          pokemon_id?: string
          source?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pokemon_pool"
            columns: ["pokemon_id"]
            isOneToOne: false
            referencedRelation: "pokemon_pool"
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
          school_name: string | null
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
          school_name?: string | null
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
          school_name?: string | null
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
          coins: number | null
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean | null
          is_frozen: boolean | null
          last_login: string | null
          password_hash: string
          profile_photo: string | null
          school_id: string | null
          school_name: string | null
          teacher_id: string | null
          teacher_username: string | null
          user_id: string
          username: string
        }
        Insert: {
          class_id?: string | null
          coins?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_frozen?: boolean | null
          last_login?: string | null
          password_hash: string
          profile_photo?: string | null
          school_id?: string | null
          school_name?: string | null
          teacher_id?: string | null
          teacher_username?: string | null
          user_id: string
          username?: string
        }
        Update: {
          class_id?: string | null
          coins?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_frozen?: boolean | null
          last_login?: string | null
          password_hash?: string
          profile_photo?: string | null
          school_id?: string | null
          school_name?: string | null
          teacher_id?: string | null
          teacher_username?: string | null
          user_id?: string
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
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
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
          avatar_url: string | null
          created_at: string
          credits: number | null
          display_name: string
          email: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_frozen: boolean | null
          last_login: string | null
          password: string
          photos: Json | null
          profile_photo: string | null
          role: Database["public"]["Enums"]["app_role"]
          school_id: string | null
          social_links: Json | null
          subscription_type: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits?: number | null
          display_name: string
          email?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_frozen?: boolean | null
          last_login?: string | null
          password: string
          photos?: Json | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          social_links?: Json | null
          subscription_type?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits?: number | null
          display_name?: string
          email?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_frozen?: boolean | null
          last_login?: string | null
          password?: string
          photos?: Json | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          social_links?: Json | null
          subscription_type?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
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
      add_student_to_class: {
        Args: { p_student_id: string; p_class_id: string }
        Returns: boolean
      }
      assign_user_role: {
        Args: {
          target_user_id: string
          new_role: string
          assigned_school_id?: string
        }
        Returns: boolean
      }
      award_star_of_class: {
        Args: { p_student_id: string; p_class_id: string; p_awarded_by: string }
        Returns: boolean
      }
      calculate_class_top_student: {
        Args: { p_class_id: string }
        Returns: string
      }
      calculate_homework_streak: {
        Args: { p_student_id: string }
        Returns: number
      }
      calculate_school_top_student: {
        Args: { p_school_id: string }
        Returns: string
      }
      delete_expired_homework: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gift_credits_in_school: {
        Args: { target_user_id: string; credit_amount: number; reason?: string }
        Returns: boolean
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      manage_user_credits: {
        Args: { target_user_id: string; credit_amount: number; reason?: string }
        Returns: boolean
      }
      remove_student_from_class: {
        Args: { p_student_id: string; p_class_id: string }
        Returns: boolean
      }
      update_top_students: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "senior_teacher" | "manager" | "owner"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "teacher", "senior_teacher", "manager", "owner"],
    },
  },
} as const
