import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type DatabaseType = {
  public: {
    Tables: {
      crm_users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          name: string;
          role: "admin" | "supervisor" | "agent" | "viewer";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Record<string, unknown>>;
        Update: Partial<Record<string, unknown>>;
        Relationships: [];
      };
      crm_integrations: {
        Row: {
          id: string;
          provider: string;
          name: string;
          status: string;
          messages: string | null;
          last_sync: string | null;
          account_name: string | null;
          enabled: boolean;
        };
        Insert: Partial<Record<string, unknown>>;
        Update: Partial<Record<string, unknown>>;
        Relationships: [];
      };
      crm_conversations: {
        Row: {
          id: string;
          customer: string;
          channel: string;
          status: string;
          last_message: string;
          unread: number;
          updated_at: string;
        };
        Insert: Partial<Record<string, unknown>>;
        Update: Partial<Record<string, unknown>>;
        Relationships: [];
      };
      crm_tickets: {
        Row: {
          id: string;
          customer: string;
          channel: string;
          priority: string;
          status: string;
          created_at: string;
          claim_type: string;
        };
        Insert: Partial<Record<string, unknown>>;
        Update: Partial<Record<string, unknown>>;
        Relationships: [];
      };
      crm_webhook_events: {
        Row: {
          id: string;
          provider: "meta" | "mercadolibre";
          event_id: string;
          payload: Json;
          status: "pending" | "processing" | "processed" | "failed";
          attempts: number;
          received_at: string;
          processed_at: string | null;
          last_error: string | null;
        };
        Insert: {
          id?: string;
          provider: "meta" | "mercadolibre";
          event_id: string;
          payload: Json;
          status?: "pending" | "processing" | "processed" | "failed";
          attempts?: number;
          received_at?: string;
          processed_at?: string | null;
          last_error?: string | null;
        };
        Update: {
          id?: string;
          provider?: "meta" | "mercadolibre";
          event_id?: string;
          payload?: Json;
          status?: "pending" | "processing" | "processed" | "failed";
          attempts?: number;
          received_at?: string;
          processed_at?: string | null;
          last_error?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function isServiceSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export const supabase: SupabaseClient<DatabaseType> | null =
  isSupabaseConfigured()
    ? createClient<DatabaseType>(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export const serviceSupabase: SupabaseClient<DatabaseType> | null =
  isServiceSupabaseConfigured()
    ? createClient<DatabaseType>(supabaseUrl!, serviceRoleKey!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export async function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase no está configurado. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getServiceSupabaseClient() {
  if (!serviceSupabase) {
    throw new Error("Supabase service role no está configurado. Añade SUPABASE_SERVICE_ROLE_KEY.");
  }

  return serviceSupabase;
}

export async function fetchTable<T>(tableName: string, select = "*") {
  const client = await getSupabaseClient();
  const { data, error } = await client.from(tableName).select(select);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as T[];
}
