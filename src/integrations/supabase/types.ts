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
      biometric_verification_logs: {
        Row: {
          attempt_photo_url: string
          created_at: string
          device_info: Json | null
          error_message: string | null
          id: string
          reference_photo_url: string
          similarity_score: number | null
          user_id: string
          verification_result: string
        }
        Insert: {
          attempt_photo_url: string
          created_at?: string
          device_info?: Json | null
          error_message?: string | null
          id?: string
          reference_photo_url: string
          similarity_score?: number | null
          user_id: string
          verification_result: string
        }
        Update: {
          attempt_photo_url?: string
          created_at?: string
          device_info?: Json | null
          error_message?: string | null
          id?: string
          reference_photo_url?: string
          similarity_score?: number | null
          user_id?: string
          verification_result?: string
        }
        Relationships: [
          {
            foreignKeyName: "biometric_verification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      company_branches: {
        Row: {
          address: string
          city: string
          company_id: string
          contact: string
          created_at: string
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          state: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          company_id: string
          contact: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          state: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          company_id?: string
          contact?: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          state?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_branches_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      company_limits: {
        Row: {
          company_id: string
          created_at: string
          id: string
          max_admins: number | null
          max_managers: number | null
          max_supervisors: number | null
          max_users: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          max_admins?: number | null
          max_managers?: number | null
          max_supervisors?: number | null
          max_users?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          max_admins?: number | null
          max_managers?: number | null
          max_supervisors?: number | null
          max_users?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_reports: {
        Row: {
          columns: Json | null
          company_id: string
          created_at: string
          created_by: string
          filters: Json | null
          id: string
          is_scheduled: boolean | null
          name: string
          report_type: string
          schedule_config: Json | null
          updated_at: string
        }
        Insert: {
          columns?: Json | null
          company_id: string
          created_at?: string
          created_by: string
          filters?: Json | null
          id?: string
          is_scheduled?: boolean | null
          name: string
          report_type: string
          schedule_config?: Json | null
          updated_at?: string
        }
        Update: {
          columns?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string
          filters?: Json | null
          id?: string
          is_scheduled?: boolean | null
          name?: string
          report_type?: string
          schedule_config?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      face_recognition_logs: {
        Row: {
          confidence_score: number
          created_at: string
          device_info: Json | null
          face_image_url: string
          id: string
          location: Json | null
          punch_record_id: string | null
          recognition_status: string
          recognition_timestamp: string
          user_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          device_info?: Json | null
          face_image_url: string
          id?: string
          location?: Json | null
          punch_record_id?: string | null
          recognition_status: string
          recognition_timestamp?: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          device_info?: Json | null
          face_image_url?: string
          id?: string
          location?: Json | null
          punch_record_id?: string | null
          recognition_status?: string
          recognition_timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "face_recognition_logs_punch_record_id_fkey"
            columns: ["punch_record_id"]
            isOneToOne: false
            referencedRelation: "punch_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "face_recognition_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      master_users: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      punch_records: {
        Row: {
          confidence_score: number | null
          created_at: string
          device_info: Json | null
          face_image_url: string | null
          id: string
          location: Json | null
          punch_type: string
          timestamp: string
          updated_at: string
          user_id: string
          verification_log_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          device_info?: Json | null
          face_image_url?: string | null
          id?: string
          location?: Json | null
          punch_type: string
          timestamp?: string
          updated_at?: string
          user_id: string
          verification_log_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          device_info?: Json | null
          face_image_url?: string | null
          id?: string
          location?: Json | null
          punch_type?: string
          timestamp?: string
          updated_at?: string
          user_id?: string
          verification_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "punch_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_records_verification_log_id_fkey"
            columns: ["verification_log_id"]
            isOneToOne: false
            referencedRelation: "biometric_verification_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          master_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          master_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          master_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_master_user_id_fkey"
            columns: ["master_user_id"]
            isOneToOne: false
            referencedRelation: "master_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_biometric_photos: {
        Row: {
          created_at: string
          face_encoding: string | null
          id: string
          is_active: boolean
          reference_photo_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          face_encoding?: string | null
          id?: string
          is_active?: boolean
          reference_photo_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          face_encoding?: string | null
          id?: string
          is_active?: boolean
          reference_photo_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_biometric_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birth_date: string
          city: string
          company_id: string
          contact: string
          cpf: string
          created_at: string
          created_by: string
          face_data: string | null
          id: string
          name: string
          neighborhood: string
          number: string
          password: string
          rg: string
          role: string
          state: string
          street: string
          updated_at: string
          username: string
          zip_code: string
        }
        Insert: {
          birth_date: string
          city: string
          company_id: string
          contact: string
          cpf: string
          created_at?: string
          created_by: string
          face_data?: string | null
          id?: string
          name: string
          neighborhood: string
          number: string
          password: string
          rg: string
          role: string
          state: string
          street: string
          updated_at?: string
          username: string
          zip_code: string
        }
        Update: {
          birth_date?: string
          city?: string
          company_id?: string
          contact?: string
          cpf?: string
          created_at?: string
          created_by?: string
          face_data?: string | null
          id?: string
          name?: string
          neighborhood?: string
          number?: string
          password?: string
          rg?: string
          role?: string
          state?: string
          street?: string
          updated_at?: string
          username?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_system_action: {
        Args: {
          p_action: string
          p_entity_type: string
          p_user_id?: string
          p_master_user_id?: string
          p_entity_id?: string
          p_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
