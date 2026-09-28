import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = () =>
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('http') &&
  supabaseUrl !== 'your_supabase_project_url' &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 10 &&
  supabaseAnonKey !== 'your_supabase_anon_key'

// Only instantiate the real client when we have a valid URL, otherwise
// all API functions fall back to in-memory mock data automatically.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!isSupabaseConfigured()) {
  console.info(
    '%c📚 UTH Learning — Mock Data Mode',
    'color:#2563eb;font-weight:bold',
    '\nSupabase not configured. Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env to use a real database.'
  )
}
