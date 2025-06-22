export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          duration_min: number
          priority: number
          due_at: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          duration_min: number
          priority?: number
          due_at?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          duration_min?: number
          priority?: number
          due_at?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          gcal_event_id: string | null
          title: string
          description: string | null
          start_at: string
          end_at: string
          all_day: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          gcal_event_id?: string | null
          title: string
          description?: string | null
          start_at: string
          end_at: string
          all_day?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          gcal_event_id?: string | null
          title?: string
          description?: string | null
          start_at?: string
          end_at?: string
          all_day?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      oauth_tokens: {
        Row: {
          id: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string | null
          scope: string
          token_type: string
          expiry: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider?: string
          access_token: string
          refresh_token?: string | null
          scope: string
          token_type?: string
          expiry: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          access_token?: string
          refresh_token?: string | null
          scope?: string
          token_type?: string
          expiry?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_sync_state: {
        Row: {
          id: string
          user_id: string
          calendar_id: string
          sync_token: string | null
          watch_id: string | null
          watch_expiry: string | null
          last_sync_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calendar_id: string
          sync_token?: string | null
          watch_id?: string | null
          watch_expiry?: string | null
          last_sync_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calendar_id?: string
          sync_token?: string | null
          watch_id?: string | null
          watch_expiry?: string | null
          last_sync_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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