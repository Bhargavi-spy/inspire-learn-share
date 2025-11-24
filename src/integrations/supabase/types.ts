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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      invitation_responses: {
        Row: {
          id: string
          invitation_id: string
          responded_at: string
          senior_id: string
          status: string
        }
        Insert: {
          id?: string
          invitation_id: string
          responded_at?: string
          senior_id: string
          status: string
        }
        Update: {
          id?: string
          invitation_id?: string
          responded_at?: string
          senior_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_responses_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_responses_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_responses_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string | null
          id: string
          school_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          school_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          school_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          description: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          senior_id: string
          started_at: string | null
          title: string
          youtube_live_url: string
        }
        Insert: {
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          senior_id: string
          started_at?: string | null
          title: string
          youtube_live_url: string
        }
        Update: {
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          senior_id?: string
          started_at?: string | null
          title?: string
          youtube_live_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          coins: number | null
          created_at: string | null
          description: string | null
          email: string
          full_name: string
          id: string
          interests: Database["public"]["Enums"]["senior_interest"][] | null
          mobile_number: string
          profile_image: string | null
          school_email: string | null
          school_name: string | null
          theme_preference: string | null
          updated_at: string | null
        }
        Insert: {
          age: number
          coins?: number | null
          created_at?: string | null
          description?: string | null
          email: string
          full_name: string
          id: string
          interests?: Database["public"]["Enums"]["senior_interest"][] | null
          mobile_number: string
          profile_image?: string | null
          school_email?: string | null
          school_name?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number
          coins?: number | null
          created_at?: string | null
          description?: string | null
          email?: string
          full_name?: string
          id?: string
          interests?: Database["public"]["Enums"]["senior_interest"][] | null
          mobile_number?: string
          profile_image?: string | null
          school_email?: string | null
          school_name?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          login_at: string
          logout_at: string | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          login_at?: string
          logout_at?: string | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          login_at?: string
          logout_at?: string | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      video_likes: {
        Row: {
          created_at: string | null
          id: string
          student_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          student_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          student_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_likes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          likes: number | null
          senior_id: string
          thumbnail_url: string | null
          title: string
          video_url: string
          watch_time_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          likes?: number | null
          senior_id: string
          thumbnail_url?: string | null
          title: string
          video_url: string
          watch_time_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          likes?: number | null
          senior_id?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string
          watch_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_with_roles: {
        Row: {
          age: number | null
          coins: number | null
          created_at: string | null
          description: string | null
          email: string | null
          full_name: string | null
          id: string | null
          interests: Database["public"]["Enums"]["senior_interest"][] | null
          mobile_number: string | null
          profile_image: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          school_email: string | null
          school_name: string | null
          theme_preference: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      senior_interest:
        | "Art"
        | "Farming"
        | "Organic Farming"
        | "Education"
        | "Crafts"
        | "Stitching"
        | "Storytelling"
        | "Cooking"
        | "Gardening"
      user_role: "school" | "senior" | "student" | "admin"
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
      senior_interest: [
        "Art",
        "Farming",
        "Organic Farming",
        "Education",
        "Crafts",
        "Stitching",
        "Storytelling",
        "Cooking",
        "Gardening",
      ],
      user_role: ["school", "senior", "student", "admin"],
    },
  },
} as const
