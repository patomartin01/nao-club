import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  '';

const FALLBACK_SUPABASE_URL = 'https://fckciiqvlekflaileexs.supabase.co';
const FALLBACK_SUPABASE_KEY = 'sb_publishable_buRcaFZxbSbP-W1Tn5T0Jw_2JNFVFMi';

// Use production Supabase instance; fallback ensures cloud connectivity even if env vars are missing or misconfigured in Vercel
const supabaseUrl = (rawUrl.startsWith('https://') && !rawUrl.includes('your-project-id') && !rawUrl.includes('placeholder')) 
  ? rawUrl 
  : FALLBACK_SUPABASE_URL;

const supabaseAnonKey = (rawKey && !rawKey.includes('placeholder') && rawKey.length > 20) 
  ? rawKey 
  : FALLBACK_SUPABASE_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
};

// Create the Supabase client instance (safe for both client and server)
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
