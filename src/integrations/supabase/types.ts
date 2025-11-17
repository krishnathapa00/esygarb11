export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          created_at: string | null;
          id: string;
          is_default: boolean | null;
          state: string;
          street: string;
          user_id: string | null;
          zip_code: string;
        };
        Insert: {
          city: string;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          state?: string;
          street: string;
          user_id?: string | null;
          zip_code: string;
        };
        Update: {
          city?: string;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          state?: string;
          street?: string;
          user_id?: string | null;
          zip_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      cart_items: {
        Row: {
          created_at: string | null;
          id: string;
          product_id: number | null;
          quantity: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          product_id?: number | null;
          quantity?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          product_id?: number | null;
          quantity?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          created_at: string | null;
          id: number;
          image_url: string | null;
          name: string;
          product_count: number | null;
          slug: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          image_url?: string | null;
          name: string;
          product_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          image_url?: string | null;
          name?: string;
          product_count?: number | null;
        };
        Relationships: [];
      };
      darkstores: {
        Row: {
          address: string;
          city: string;
          created_at: string | null;
          id: number;
          is_active: boolean | null;
          manager_name: string | null;
          name: string;
          phone_number: string | null;
          state: string | null;
          updated_at: string | null;
          zip_code: string;
        };
        Insert: {
          address: string;
          city: string;
          created_at?: string | null;
          id?: number;
          is_active?: boolean | null;
          manager_name?: string | null;
          name: string;
          phone_number?: string | null;
          state?: string | null;
          updated_at?: string | null;
          zip_code: string;
        };
        Update: {
          address?: string;
          city?: string;
          created_at?: string | null;
          id?: number;
          is_active?: boolean | null;
          manager_name?: string | null;
          name?: string;
          phone_number?: string | null;
          state?: string | null;
          updated_at?: string | null;
          zip_code?: string;
        };
        Relationships: [];
      };
      delivery_config: {
        Row: {
          delivery_fee: number;
          delivery_partner_charge: number;
          id: number;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          delivery_fee?: number;
          delivery_partner_charge?: number;
          id?: number;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          delivery_fee?: number;
          delivery_partner_charge?: number;
          id?: number;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_config_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      delivery_earnings: {
        Row: {
          amount: number;
          created_at: string | null;
          delivery_partner_id: string;
          delivery_time_minutes: number | null;
          id: string;
          order_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          delivery_partner_id: string;
          delivery_time_minutes?: number | null;
          id?: string;
          order_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          delivery_partner_id?: string;
          delivery_time_minutes?: number | null;
          id?: string;
          order_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_earnings_delivery_partner_id_fkey";
            columns: ["delivery_partner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delivery_earnings_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      kyc_verifications: {
        Row: {
          admin_comments: string | null;
          citizenship_document_url: string | null;
          created_at: string | null;
          id: string;
          license_document_url: string | null;
          pan_document_url: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          submitted_at: string | null;
          updated_at: string | null;
          user_id: string;
          verification_status: string;
        };
        Insert: {
          admin_comments?: string | null;
          citizenship_document_url?: string | null;
          created_at?: string | null;
          id?: string;
          license_document_url?: string | null;
          pan_document_url?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          submitted_at?: string | null;
          updated_at?: string | null;
          user_id: string;
          verification_status?: string;
        };
        Update: {
          admin_comments?: string | null;
          citizenship_document_url?: string | null;
          created_at?: string | null;
          id?: string;
          license_document_url?: string | null;
          pan_document_url?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          submitted_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
          verification_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "kyc_verifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          created_at: string | null;
          id: string;
          order_id: string | null;
          price: number;
          product_id: number | null;
          quantity: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          order_id?: string | null;
          price: number;
          product_id?: number | null;
          quantity: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          order_id?: string | null;
          price?: number;
          product_id?: number | null;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      order_status_history: {
        Row: {
          id: string;
          notes: string | null;
          order_id: string | null;
          status: Database["public"]["Enums"]["order_status"];
          timestamp: string | null;
        };
        Insert: {
          id?: string;
          notes?: string | null;
          order_id?: string | null;
          status: Database["public"]["Enums"]["order_status"];
          timestamp?: string | null;
        };
        Update: {
          id?: string;
          notes?: string | null;
          order_id?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          timestamp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          accepted_at: string | null;
          created_at: string | null;
          darkstore_id: number | null;
          delivered_at: string | null;
          delivery_address: string;
          delivery_partner_id: string | null;
          delivery_time_minutes: number | null;
          estimated_delivery: string | null;
          id: string;
          is_delivery_waived: boolean | null;
          order_number: string;
          payment_status: Database["public"]["Enums"]["payment_status"] | null;
          picked_up_at: string | null;
          promo_code_id: string | null;
          promo_discount: number | null;
          status: Database["public"]["Enums"]["order_status"] | null;
          total_amount: number;
          updated_at: string | null;
          user_id: string | null;
          invoice_url?: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string | null;
          darkstore_id?: number | null;
          delivered_at?: string | null;
          delivery_address: string;
          delivery_partner_id?: string | null;
          delivery_time_minutes?: number | null;
          estimated_delivery?: string | null;
          id?: string;
          is_delivery_waived?: boolean | null;
          order_number: string;
          payment_status?: Database["public"]["Enums"]["payment_status"] | null;
          picked_up_at?: string | null;
          promo_code_id?: string | null;
          promo_discount?: number | null;
          status?: Database["public"]["Enums"]["order_status"] | null;
          total_amount: number;
          updated_at?: string | null;
          user_id?: string | null;
          invoice_url?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string | null;
          darkstore_id?: number | null;
          delivered_at?: string | null;
          delivery_address?: string;
          delivery_partner_id?: string | null;
          delivery_time_minutes?: number | null;
          estimated_delivery?: string | null;
          id?: string;
          is_delivery_waived?: boolean | null;
          order_number?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"] | null;
          picked_up_at?: string | null;
          promo_code_id?: string | null;
          promo_discount?: number | null;
          status?: Database["public"]["Enums"]["order_status"] | null;
          total_amount?: number;
          updated_at?: string | null;
          user_id?: string | null;
          invoice_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_darkstore_id_fkey";
            columns: ["darkstore_id"];
            isOneToOne: false;
            referencedRelation: "darkstores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_delivery_partner_id_fkey";
            columns: ["delivery_partner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_promo_code_id_fkey";
            columns: ["promo_code_id"];
            isOneToOne: false;
            referencedRelation: "promo_codes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      otp_verifications: {
        Row: {
          attempts: number | null;
          created_at: string | null;
          expires_at: string;
          id: string;
          is_verified: boolean | null;
          otp_code: string;
          phone_number: string;
        };
        Insert: {
          attempts?: number | null;
          created_at?: string | null;
          expires_at: string;
          id?: string;
          is_verified?: boolean | null;
          otp_code: string;
          phone_number: string;
        };
        Update: {
          attempts?: number | null;
          created_at?: string | null;
          expires_at?: string;
          id?: string;
          is_verified?: boolean | null;
          otp_code?: string;
          phone_number?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category_id: number | null;
          created_at: string | null;
          delivery_time: string | null;
          description: string | null;
          discount: number | null;
          id: number;
          image_url: string | null;
          image_urls: string[] | null;
          is_active: boolean | null;
          name: string;
          offer: string | null;
          original_price: number | null;
          price: number;
          stock_quantity: number | null;
          subcategory_id: number | null;
          updated_at: string | null;
          weight: string | null;
        };
        Insert: {
          category_id?: number | null;
          created_at?: string | null;
          delivery_time?: string | null;
          description?: string | null;
          discount?: number | null;
          id?: number;
          image_url?: string | null;
          image_urls?: string[] | null;
          is_active?: boolean | null;
          name: string;
          offer?: string | null;
          original_price?: number | null;
          price: number;
          stock_quantity?: number | null;
          subcategory_id?: number | null;
          updated_at?: string | null;
          weight?: string | null;
        };
        Update: {
          category_id?: number | null;
          created_at?: string | null;
          delivery_time?: string | null;
          description?: string | null;
          discount?: number | null;
          id?: number;
          image_url?: string | null;
          image_urls?: string[] | null;
          is_active?: boolean | null;
          name?: string;
          offer?: string | null;
          original_price?: number | null;
          price?: number;
          stock_quantity?: number | null;
          subcategory_id?: number | null;
          updated_at?: string | null;
          weight?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_subcategory_id_fkey";
            columns: ["subcategory_id"];
            isOneToOne: false;
            referencedRelation: "subcategories";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          created_at: string | null;
          darkstore_id: string | null;
          delivery_order_count: number | null;
          delivery_location: string | null;
          full_name: string | null;
          id: string;
          is_online: boolean | null;
          kyc_verified: boolean | null;
          license_number: string | null;
          location: string | null;
          phone: string | null;
          phone_number: string | null;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string | null;
          vehicle_type: string | null;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          darkstore_id?: string | null;
          delivery_order_count?: number | null;
          delivery_location: string | null;
          full_name?: string | null;
          id: string;
          is_online?: boolean | null;
          kyc_verified?: boolean | null;
          license_number?: string | null;
          location?: string | null;
          phone?: string | null;
          phone_number?: string | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
          vehicle_type?: string | null;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          darkstore_id?: string | null;
          delivery_order_count?: number | null;
          delivery_location?: string | null;
          full_name?: string | null;
          id?: string;
          is_online?: boolean | null;
          kyc_verified?: boolean | null;
          license_number?: string | null;
          location?: string | null;
          phone?: string | null;
          phone_number?: string | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
          vehicle_type?: string | null;
        };
        Relationships: [];
      };
      promo_code_usage: {
        Row: {
          discount_amount: number;
          id: string;
          order_id: string | null;
          promo_code_id: string | null;
          used_at: string | null;
          user_id: string | null;
        };
        Insert: {
          discount_amount: number;
          id?: string;
          order_id?: string | null;
          promo_code_id?: string | null;
          used_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          discount_amount?: number;
          id?: string;
          order_id?: string | null;
          promo_code_id?: string | null;
          used_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey";
            columns: ["promo_code_id"];
            isOneToOne: false;
            referencedRelation: "promo_codes";
            referencedColumns: ["id"];
          }
        ];
      };
      promo_codes: {
        Row: {
          code: string;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          discount_type: string;
          discount_value: number;
          expires_at: string | null;
          id: string;
          is_active: boolean | null;
          max_discount_amount: number | null;
          min_order_amount: number | null;
          name: string;
          updated_at: string | null;
          usage_limit: number | null;
          used_count: number | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_discount_amount?: number | null;
          min_order_amount?: number | null;
          name: string;
          updated_at?: string | null;
          usage_limit?: number | null;
          used_count?: number | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_discount_amount?: number | null;
          min_order_amount?: number | null;
          name?: string;
          updated_at?: string | null;
          usage_limit?: number | null;
          used_count?: number | null;
        };
        Relationships: [];
      };
      store_locations: {
        Row: {
          created_at: string | null;
          delivery_radius_km: number;
          id: number;
          is_active: boolean | null;
          latitude: number;
          longitude: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          delivery_radius_km?: number;
          id?: number;
          is_active?: boolean | null;
          latitude: number;
          longitude: number;
          name?: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          delivery_radius_km?: number;
          id?: number;
          is_active?: boolean | null;
          latitude?: number;
          longitude?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      subcategories: {
        Row: {
          category_id: number;
          created_at: string | null;
          description: string | null;
          id: number;
          is_active: boolean | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          category_id: number;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          is_active?: boolean | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          category_id?: number;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          is_active?: boolean | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      waitlist: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          phone_number: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          phone_number: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          phone_number?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      withdrawals: {
        Row: {
          account_details: string;
          admin_notes: string | null;
          amount: number;
          created_at: string;
          id: string;
          method: string;
          processed_at: string | null;
          processed_by: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_details: string;
          admin_notes?: string | null;
          amount: number;
          created_at?: string;
          id?: string;
          method: string;
          processed_at?: string | null;
          processed_by?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_details?: string;
          admin_notes?: string | null;
          amount?: number;
          created_at?: string;
          id?: string;
          method?: string;
          processed_at?: string | null;
          processed_by?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number };
        Returns: number;
      };
      check_delivery_availability: {
        Args: { delivery_lat: number; delivery_lng: number };
        Returns: boolean;
      };
      check_delivery_fee_waiver: {
        Args: { user_id_param: string };
        Returns: boolean;
      };
      cleanup_expired_user_sessions: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      deduct_stock_and_checkout: {
        Args: { delivery_address: string; user_uuid: string };
        Returns: {
          order_id: string;
        }[];
      };
      generate_order_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_available_darkstores: {
        Args: Record<PropertyKey, never>;
        Returns: {
          address: string;
          city: string;
          id: number;
          name: string;
          state: string;
          zip_code: string;
        }[];
      };
      get_delivery_partners: {
        Args: Record<PropertyKey, never> | { _darkstore_id?: number };
        Returns: {
          full_name: string;
          id: string;
          phone_number: string;
        }[];
      };
      is_admin_user: {
        Args: { user_id: string };
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      update_user_activity: {
        Args: { user_id: string };
        Returns: undefined;
      };
      validate_user_role: {
        Args: { expected_role: string; user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      order_status:
        | "pending"
        | "confirmed"
        | "dispatched"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "ready_for_pickup";
      payment_status: "pending" | "completed" | "failed" | "refunded";
      user_role: "customer" | "admin" | "delivery_partner" | "super_admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

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
        "ready_for_pickup",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["customer", "admin", "delivery_partner", "super_admin"],
    },
  },
} as const;
