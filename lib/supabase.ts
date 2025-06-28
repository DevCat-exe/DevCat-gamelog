import { createClient } from "@supabase/supabase-js"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Use your actual Supabase credentials
const supabaseUrl = "https://wrhbpghmhvqmzguedjse.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaGJwZ2htaHZxbXpndWVkanNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwOTA0NTUsImV4cCI6MjA2NjY2NjQ1NX0.BTVo11BLaKYJA-yOS7rwkBGUJM3FtesDBdycG3w_POs"

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Log configuration status (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("Supabase Configuration:", {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseAnonKey),
    isConfigured: isSupabaseConfigured,
  })
}

export type Database = {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          title: string
          status: "finished" | "unfinished" | "wishlist"
          personal_note: string | null
          added_on: string
          year: number | null
          genre: string | null
          developer: string | null
          cover_url: string | null
          x: number
          y: number
          width: number
          height: number
          z_index: number
          window_type: "terminal" | "file" | "glitch" | "memory"
          memory_clarity: "vivid" | "faded" | "forgotten"
          is_visible: boolean | null
          metacritic: number | null
          platforms: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          status: "finished" | "unfinished" | "wishlist"
          personal_note?: string | null
          added_on?: string
          year?: number | null
          genre?: string | null
          developer?: string | null
          cover_url?: string | null
          x: number
          y: number
          width?: number
          height?: number
          z_index: number
          window_type: "terminal" | "file" | "glitch" | "memory"
          memory_clarity?: "vivid" | "faded" | "forgotten"
          is_visible?: boolean | null
          metacritic?: number | null
          platforms?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          status?: "finished" | "unfinished" | "wishlist"
          personal_note?: string | null
          added_on?: string
          year?: number | null
          genre?: string | null
          developer?: string | null
          cover_url?: string | null
          x?: number
          y?: number
          width?: number
          height?: number
          z_index?: number
          window_type?: "terminal" | "file" | "glitch" | "memory"
          memory_clarity?: "vivid" | "faded" | "forgotten"
          is_visible?: boolean | null
          metacritic?: number | null
          platforms?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
