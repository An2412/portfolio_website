import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from './supabaseEnv';

export { isSupabaseConfigured };

if (!isSupabaseConfigured) {
    // Do not throw here: a missing env var should not blank the public portfolio.
    // The admin/CV features simply stay unavailable until the variables are set.
    console.warn(
        "Supabase credentials missing! Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY " +
        "(or VITE_SUPABASE_ANON_KEY) in your build environment " +
        "(Cloudflare Pages > Settings > Environment variables)."
    );
}

export const supabase = createClient(
    SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_KEY || 'placeholder-anon-key'
);
