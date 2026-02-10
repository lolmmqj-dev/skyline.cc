import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

export const supabaseAnon = createClient(
    supabaseUrl,
    supabaseAnonKey || 'missing-anon-key',
    { auth: { persistSession: false } }
);

export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey || 'missing-service-key',
    { auth: { persistSession: false } }
);
