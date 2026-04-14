import { createClient } from '@supabase/supabase-js';
import { createTenantAwareSupabase } from './tenantAwareSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = createTenantAwareSupabase(supabaseClient);
