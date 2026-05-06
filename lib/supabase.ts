import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!rawSupabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

let normalizedSupabaseUrl = rawSupabaseUrl;

try {
  const parsed = new URL(rawSupabaseUrl);
  normalizedSupabaseUrl = parsed.origin;
} catch {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL 값이 URL 형식이 아닙니다. https://<project-ref>.supabase.co 형식으로 입력해 주세요.');
}

export const supabase = createClient(normalizedSupabaseUrl, supabaseAnonKey);
