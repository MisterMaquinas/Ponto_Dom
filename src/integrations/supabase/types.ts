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
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password?: string
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
      users: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean
          password: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean
          password: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean
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
