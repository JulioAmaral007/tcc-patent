import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cliente do navegador com configuração otimizada para Next.js 16
export const supabase = createBrowserClient(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      // Força o uso de localStorage para armazenar a sessão
      // Isso resolve problemas de cookies em Next.js 16
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
