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
      customers: {
        Row: {
          billing_address: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_parts: {
        Row: {
          category: string
          created_at: string
          id: string
          jason_van_stock: number
          manufacturer: string | null
          min_stock_level: number | null
          notes: string | null
          part_name: string
          part_number: string | null
          terry_van_stock: number
          unit_price: number | null
          updated_at: string
          warehouse_stock: number
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          jason_van_stock?: number
          manufacturer?: string | null
          min_stock_level?: number | null
          notes?: string | null
          part_name: string
          part_number?: string | null
          terry_van_stock?: number
          unit_price?: number | null
          updated_at?: string
          warehouse_stock?: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          jason_van_stock?: number
          manufacturer?: string | null
          min_stock_level?: number | null
          notes?: string | null
          part_name?: string
          part_number?: string | null
          terry_van_stock?: number
          unit_price?: number | null
          updated_at?: string
          warehouse_stock?: number
        }
        Relationships: []
      }
      job_history: {
        Row: {
          change_type: string
          changed_by: string
          changes: Json
          created_at: string
          id: string
          job_id: string
        }
        Insert: {
          change_type: string
          changed_by: string
          changes: Json
          created_at?: string
          id?: string
          job_id: string
        }
        Update: {
          change_type?: string
          changed_by?: string
          changes?: Json
          created_at?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          completion_date: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          equipment_details: Json | null
          fault_description: string | null
          id: string
          invoice_number: string | null
          job_number: string
          job_type: string
          notes: string | null
          quote_number: string | null
          rams_status: string | null
          report_link: string | null
          scheduled_date: string | null
          site_id: string | null
          status: string
          technician: string | null
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          equipment_details?: Json | null
          fault_description?: string | null
          id?: string
          invoice_number?: string | null
          job_number: string
          job_type: string
          notes?: string | null
          quote_number?: string | null
          rams_status?: string | null
          report_link?: string | null
          scheduled_date?: string | null
          site_id?: string | null
          status?: string
          technician?: string | null
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          equipment_details?: Json | null
          fault_description?: string | null
          id?: string
          invoice_number?: string | null
          job_number?: string
          job_type?: string
          notes?: string | null
          quote_number?: string | null
          rams_status?: string | null
          report_link?: string | null
          scheduled_date?: string | null
          site_id?: string | null
          status?: string
          technician?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      rams_workflows: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          created_at: string
          id: string
          job_id: string
          rams_document_url: string | null
          rejection_reason: string | null
          sent_to_customer_at: string | null
          status: string
          updated_at: string
          uploaded_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: string
          job_id: string
          rams_document_url?: string | null
          rejection_reason?: string | null
          sent_to_customer_at?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: string
          job_id?: string
          rams_document_url?: string | null
          rejection_reason?: string | null
          sent_to_customer_at?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rams_workflows_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      site_customers: {
        Row: {
          customer_id: string
          is_primary: boolean | null
          site_id: string
        }
        Insert: {
          customer_id: string
          is_primary?: boolean | null
          site_id: string
        }
        Update: {
          customer_id?: string
          is_primary?: boolean | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_customers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_equipment: {
        Row: {
          created_at: string
          equipment_type: string
          id: string
          installation_date: string | null
          manufacturer: string | null
          model: string | null
          notes: string | null
          serial_number: string | null
          site_id: string
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          created_at?: string
          equipment_type: string
          id?: string
          installation_date?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          serial_number?: string | null
          site_id: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          created_at?: string
          equipment_type?: string
          id?: string
          installation_date?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          serial_number?: string | null
          site_id?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_equipment_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          phone: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: string
          phone?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          phone?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          access_codes: string | null
          access_instructions: string | null
          address: string
          created_at: string
          id: string
          notes: string | null
          postcode: string | null
          site_contact_email: string | null
          site_contact_name: string | null
          site_contact_phone: string | null
          site_name: string
          updated_at: string
        }
        Insert: {
          access_codes?: string | null
          access_instructions?: string | null
          address: string
          created_at?: string
          id?: string
          notes?: string | null
          postcode?: string | null
          site_contact_email?: string | null
          site_contact_name?: string | null
          site_contact_phone?: string | null
          site_name: string
          updated_at?: string
        }
        Update: {
          access_codes?: string | null
          access_instructions?: string | null
          address?: string
          created_at?: string
          id?: string
          notes?: string | null
          postcode?: string | null
          site_contact_email?: string | null
          site_contact_name?: string | null
          site_contact_phone?: string | null
          site_name?: string
          updated_at?: string
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
    Enums: {},
  },
} as const
