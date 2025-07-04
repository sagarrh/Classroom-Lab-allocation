import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Key are required!");
} 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
