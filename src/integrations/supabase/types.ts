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
      community_rooms: {
        Row: {
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          invite_code: string | null
          name: string
          privacy_level: Database["public"]["Enums"]["room_privacy_level"]
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          name: string
          privacy_level?: Database["public"]["Enums"]["room_privacy_level"]
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          name?: string
          privacy_level?: Database["public"]["Enums"]["room_privacy_level"]
        }
        Relationships: [
          {
            foreignKeyName: "community_rooms_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_strategy_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_strategy_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_strategy_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_strategy_id_fkey"
            columns: ["related_strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          hashtags: string[] | null
          id: string
          likes_count: number | null
          link_description: string | null
          link_image: string | null
          link_title: string | null
          link_url: string | null
          media_type: string | null
          media_url: string | null
          post_type: string
          shares_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          likes_count?: number | null
          link_description?: string | null
          link_image?: string | null
          link_title?: string | null
          link_url?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type: string
          shares_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          likes_count?: number | null
          link_description?: string | null
          link_image?: string | null
          link_title?: string | null
          link_url?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          shares_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      room_members: {
        Row: {
          id: number
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: number
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: number
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "community_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "community_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strategies: {
        Row: {
          approval_votes: number | null
          bookmarks_count: number
          comments_count: number
          content_markdown: string | null
          created_at: string | null
          id: string
          image_path: string | null
          is_draft: boolean | null
          is_public: boolean | null
          last_saved_at: string | null
          likes_count: number
          name: string
          rejection_votes: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          votes_required: number | null
          voting_status: string | null
          win_rate: number | null
        }
        Insert: {
          approval_votes?: number | null
          bookmarks_count?: number
          comments_count?: number
          content_markdown?: string | null
          created_at?: string | null
          id?: string
          image_path?: string | null
          is_draft?: boolean | null
          is_public?: boolean | null
          last_saved_at?: string | null
          likes_count?: number
          name: string
          rejection_votes?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          votes_required?: number | null
          voting_status?: string | null
          win_rate?: number | null
        }
        Update: {
          approval_votes?: number | null
          bookmarks_count?: number
          comments_count?: number
          content_markdown?: string | null
          created_at?: string | null
          id?: string
          image_path?: string | null
          is_draft?: boolean | null
          is_public?: boolean | null
          last_saved_at?: string | null
          likes_count?: number
          name?: string
          rejection_votes?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          votes_required?: number | null
          voting_status?: string | null
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_strategies_user_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_bookmarks: {
        Row: {
          created_at: string
          strategy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          strategy_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          strategy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_bookmarks_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          strategy_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          strategy_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          strategy_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_comments_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_drafts: {
        Row: {
          auto_saved_at: string
          content_markdown: string | null
          id: string
          name: string
          strategy_id: string | null
          tags: string[] | null
          user_id: string
          win_rate: number | null
        }
        Insert: {
          auto_saved_at?: string
          content_markdown?: string | null
          id?: string
          name: string
          strategy_id?: string | null
          tags?: string[] | null
          user_id: string
          win_rate?: number | null
        }
        Update: {
          auto_saved_at?: string
          content_markdown?: string | null
          id?: string
          name?: string
          strategy_id?: string | null
          tags?: string[] | null
          user_id?: string
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_drafts_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_likes: {
        Row: {
          created_at: string
          strategy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          strategy_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          strategy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_likes_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_votes: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          strategy_id: string
          vote_type: string
          voter_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          strategy_id: string
          vote_type: string
          voter_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          strategy_id?: string
          vote_type?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_votes_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          closed_at: string | null
          closing_notes: string | null
          created_at: string
          entry_price: number
          exit_price: number | null
          id: string
          opened_at: string
          pnl: number | null
          side: Database["public"]["Enums"]["trade_side"]
          size: number
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          closing_notes?: string | null
          created_at?: string
          entry_price: number
          exit_price?: number | null
          id?: string
          opened_at?: string
          pnl?: number | null
          side: Database["public"]["Enums"]["trade_side"]
          size: number
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          closing_notes?: string | null
          created_at?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          opened_at?: string
          pnl?: number | null
          side?: Database["public"]["Enums"]["trade_side"]
          size?: number
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_required_votes: {
        Args: { strategy_user_id: string }
        Returns: number
      }
      can_publish_strategy: {
        Args: { strategy_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          target_user_id: string
          notification_type: string
          notification_title: string
          notification_message: string
          strategy_id?: string
          source_user_id?: string
        }
        Returns: undefined
      }
      is_user_member_of_room: {
        Args: { p_room_id: string }
        Returns: boolean
      }
      search_strategies_by_hashtag: {
        Args: { hashtag_query: string }
        Returns: {
          id: string
          name: string
          content_markdown: string
          tags: string[]
          user_id: string
          created_at: string
          is_public: boolean
          win_rate: number
          likes_count: number
          comments_count: number
          bookmarks_count: number
          image_path: string
        }[]
      }
    }
    Enums: {
      room_privacy_level: "public" | "private" | "invite_only"
      trade_side: "long" | "short"
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
      room_privacy_level: ["public", "private", "invite_only"],
      trade_side: ["long", "short"],
    },
  },
} as const
