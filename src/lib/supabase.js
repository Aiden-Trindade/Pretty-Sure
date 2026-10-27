import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('Supabase env vars missing. Copy .env.example to .env and fill them in.')
}

// null until .env is set up, so the app still runs without Supabase
export const supabase = url && anonKey ? createClient(url, anonKey) : null
