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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          key_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          key_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          key_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          id: string
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password: string
          role?: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      apks: {
        Row: {
          created_at: string | null
          description: string | null
          download_count: number | null
          file_path: string | null
          file_size: string
          icon_url: string | null
          id: string
          name: string
          status: string
          storage_path: string | null
          updated_at: string | null
          uploaded_by: string
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_path?: string | null
          file_size: string
          icon_url?: string | null
          id?: string
          name: string
          status: string
          storage_path?: string | null
          updated_at?: string | null
          uploaded_by: string
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_path?: string | null
          file_size?: string
          icon_url?: string | null
          id?: string
          name?: string
          status?: string
          storage_path?: string | null
          updated_at?: string | null
          uploaded_by?: string
          version?: string | null
        }
        Relationships: []
      }
      biometric_verification_logs: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          reference_photo_url: string | null
          updated_at: string
          user_id: string
          verification_result: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          reference_photo_url?: string | null
          updated_at?: string
          user_id: string
          verification_result?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          reference_photo_url?: string | null
          updated_at?: string
          user_id?: string
          verification_result?: boolean | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          code: string | null
          company_id: string
          created_at: string
          id: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          company_id: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          apelido: string
          content_encrypted: string
          created_at: string
          deleted_at: string | null
          id: string
          is_pinned: boolean | null
          message_type: string | null
          pinned_at: string | null
          pinned_by: string | null
          reply_to_message_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apelido: string
          content_encrypted: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_pinned?: boolean | null
          message_type?: string | null
          pinned_at?: string | null
          pinned_by?: string | null
          reply_to_message_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apelido?: string
          content_encrypted?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_pinned?: boolean | null
          message_type?: string | null
          pinned_at?: string | null
          pinned_by?: string | null
          reply_to_message_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          birth_date: string | null
          branch_id: string
          city: string | null
          contact: string | null
          cpf: string | null
          created_at: string
          face_encoding: string | null
          id: string
          name: string
          neighborhood: string | null
          number: string | null
          position: string | null
          reference_photo_url: string | null
          rg: string | null
          state: string | null
          status: string | null
          street: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          birth_date?: string | null
          branch_id: string
          city?: string | null
          contact?: string | null
          cpf?: string | null
          created_at?: string
          face_encoding?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          number?: string | null
          position?: string | null
          reference_photo_url?: string | null
          rg?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          birth_date?: string | null
          branch_id?: string
          city?: string | null
          contact?: string | null
          cpf?: string | null
          created_at?: string
          face_encoding?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          number?: string | null
          position?: string | null
          reference_photo_url?: string | null
          rg?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
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
          location: string | null
          recognition_status: string
          recognition_timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          device_info?: Json | null
          face_image_url: string
          id?: string
          location?: string | null
          recognition_status: string
          recognition_timestamp?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          device_info?: Json | null
          face_image_url?: string
          id?: string
          location?: string | null
          recognition_status?: string
          recognition_timestamp?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_logs_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_logs: {
        Row: {
          apk_id: string | null
          created_at: string | null
          device_info: string | null
          id: string
          status: string
        }
        Insert: {
          apk_id?: string | null
          created_at?: string | null
          device_info?: string | null
          id?: string
          status: string
        }
        Update: {
          apk_id?: string | null
          created_at?: string | null
          device_info?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "installation_logs_apk_id_fkey"
            columns: ["apk_id"]
            isOneToOne: false
            referencedRelation: "apks"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          imagem_url: string | null
          prioridade: string | null
          status: string
          tags: string[] | null
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          prioridade?: string | null
          status?: string
          tags?: string[] | null
          titulo: string
          updated_at?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          prioridade?: string | null
          status?: string
          tags?: string[] | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          imagem_url: string
          instagram: string | null
          nome_empresa: string
          site: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          imagem_url: string
          instagram?: string | null
          nome_empresa: string
          site?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          imagem_url?: string
          instagram?: string | null
          nome_empresa?: string
          site?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apelido: string | null
          avatar_url: string | null
          created_at: string
          id: string
          is_online: boolean | null
          last_seen: string | null
          nome_completo: string
          patente: string | null
          pode_usar_mapa: boolean
          primeiro_nome: string | null
          role: string | null
          status_aprovacao: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apelido?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          nome_completo: string
          patente?: string | null
          pode_usar_mapa?: boolean
          primeiro_nome?: string | null
          role?: string | null
          status_aprovacao?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apelido?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          nome_completo?: string
          patente?: string | null
          pode_usar_mapa?: boolean
          primeiro_nome?: string | null
          role?: string | null
          status_aprovacao?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      punch_records: {
        Row: {
          confidence_score: number | null
          created_at: string
          device_info: Json | null
          id: string
          location: string | null
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
          id?: string
          location?: string | null
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
          id?: string
          location?: string | null
          punch_type?: string
          timestamp?: string
          updated_at?: string
          user_id?: string
          verification_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_punch_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_records_verification_log_id_fkey"
            columns: ["verification_log_id"]
            isOneToOne: false
            referencedRelation: "face_recognition_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          created_at: string
          file_url: string
          id: string
          legenda: string | null
          nome_usuario: string
          status: string
          titulo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          legenda?: string | null
          nome_usuario: string
          status?: string
          titulo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          legenda?: string | null
          nome_usuario?: string
          status?: string
          titulo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_biometric_photos: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          photo_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          photo_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          photo_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_bio_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_encryption_keys: {
        Row: {
          created_at: string
          id: string
          private_key_encrypted: string
          public_key: string
          salt: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          private_key_encrypted: string
          public_key: string
          salt: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          private_key_encrypted?: string
          public_key?: string
          salt?: string
          user_id?: string
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          ativo_mapa: boolean
          created_at: string
          id: string
          latitude: number
          longitude: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo_mapa?: boolean
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo_mapa?: boolean
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean
          name: string | null
          password: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean
          name?: string | null
          password: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean
          name?: string | null
          password?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_apk_completely: {
        Args: { apk_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
