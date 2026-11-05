/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string;
    /** New Supabase key name (sb_publishable_...). */
    readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
    /** Legacy Supabase key name (anon JWT). */
    readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
