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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      device_fingerprints: {
        Row: {
          criado_em: string
          fingerprint_id: string
          id: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          fingerprint_id: string
          id?: string
          user_id: string
        }
        Update: {
          criado_em?: string
          fingerprint_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          criado_em: string
          id: string
          lida: boolean
          mensagem: string
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          lida?: boolean
          mensagem: string
          tipo?: string
          titulo: string
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          lida?: boolean
          mensagem?: string
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          comprovativo_url: string | null
          criado_em: string
          id: string
          motivo: string | null
          status: string
          user_id: string
          verificado_por_ia: boolean
        }
        Insert: {
          comprovativo_url?: string | null
          criado_em?: string
          id?: string
          motivo?: string | null
          status?: string
          user_id: string
          verificado_por_ia?: boolean
        }
        Update: {
          comprovativo_url?: string | null
          criado_em?: string
          id?: string
          motivo?: string | null
          status?: string
          user_id?: string
          verificado_por_ia?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          creditos_hoje: number
          criado_em: string
          data_reset_creditos: string
          disciplina_ou_curso: string | null
          email: string | null
          estilo_aprendizagem: string | null
          id: string
          nivel_ensino: string | null
          nivel_quiz: string | null
          nome: string | null
          objectivo_estudo: string | null
          onboarding_completo: boolean
          plano: string
          premium_ate: string | null
        }
        Insert: {
          creditos_hoje?: number
          criado_em?: string
          data_reset_creditos?: string
          disciplina_ou_curso?: string | null
          email?: string | null
          estilo_aprendizagem?: string | null
          id: string
          nivel_ensino?: string | null
          nivel_quiz?: string | null
          nome?: string | null
          objectivo_estudo?: string | null
          onboarding_completo?: boolean
          plano?: string
          premium_ate?: string | null
        }
        Update: {
          creditos_hoje?: number
          criado_em?: string
          data_reset_creditos?: string
          disciplina_ou_curso?: string | null
          email?: string | null
          estilo_aprendizagem?: string | null
          id?: string
          nivel_ensino?: string | null
          nivel_quiz?: string | null
          nome?: string | null
          objectivo_estudo?: string | null
          onboarding_completo?: boolean
          plano?: string
          premium_ate?: string | null
        }
        Relationships: []
      }
      sessoes: {
        Row: {
          criado_em: string
          exercicio_url: string | null
          ficha_url: string | null
          id: string
          resposta_ia: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          exercicio_url?: string | null
          ficha_url?: string | null
          id?: string
          resposta_ia?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          criado_em?: string
          exercicio_url?: string | null
          ficha_url?: string | null
          id?: string
          resposta_ia?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
