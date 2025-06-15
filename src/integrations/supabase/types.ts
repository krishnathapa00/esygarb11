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
      addresses: {
        Row: {
          city: string
          created_at: string | null
          id: string
          is_default: boolean | null
          state: string
          street: string
          user_id: string | null
          zip_code: string
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          state?: string
          street: string
          user_id?: string | null
          zip_code: string
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          state?: string
          street?: string
          user_id?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: number | null
          quantity: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: number | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: number | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color_gradient: string | null
          created_at: string | null
          id: number
          image_url: string | null
          name: string
          product_count: number | null
        }
        Insert: {
          color_gradient?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          name: string
          product_count?: number | null
        }
        Update: {
          color_gradient?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          name?: string
          product_count?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: number | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: number | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          id: string
          notes: string | null
          order_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          timestamp: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          order_id?: string | null
          status: Database["public"]["Enums"]["order_status"]
          timestamp?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_address: string
          delivery_partner_id: string | null
          estimated_delivery: string | null
          id: string
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address: string
          delivery_partner_id?: string | null
          estimated_delivery?: string | null
          id?: string
          order_number: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: string
          delivery_partner_id?: string | null
          estimated_delivery?: string | null
          id?: string
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string
          id: string
          is_verified: boolean | null
          otp_code: string
          phone_number: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at: string
          id?: string
          is_verified?: boolean | null
          otp_code: string
          phone_number: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          is_verified?: boolean | null
          otp_code?: string
          phone_number?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: number | null
          created_at: string | null
          delivery_time: string | null
          description: string | null
          discount: number | null
          id: number
          image_url: string | null
          is_active: boolean | null
          name: string
          offer: string | null
          original_price: number | null
          price: number
          stock_quantity: number | null
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          delivery_time?: string | null
          description?: string | null
          discount?: number | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name: string
          offer?: string | null
          original_price?: number | null
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          delivery_time?: string | null
          description?: string | null
          discount?: number | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          offer?: string | null
          original_price?: number | null
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "confirmed"
        | "dispatched"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "customer" | "admin" | "delivery_partner"
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
      order_status: [
        "pending",
        "confirmed",
        "dispatched",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["customer", "admin", "delivery_partner"],
    },
  },
} as const
