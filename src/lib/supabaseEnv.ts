// Supabase renamed the "anon key" to "publishable key" (sb_publishable_...).
// Accept both names so local .env files and existing Cloudflare projects keep working.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const SUPABASE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
