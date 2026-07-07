/* ============================================================
   Fill these in from:
   Supabase Dashboard → Project Settings → API
   - "Project URL"       -> SUPABASE_URL
   - "anon public" key   -> SUPABASE_ANON_KEY
   The anon key is safe to expose in client-side code; it only
   has the permissions your RLS policies (schema.sql) allow it.
   ============================================================ */
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Put your real, non-cloaked sign-up link here (e.g. your referral link) */
const REGISTER_URL = "https://example.com/register";
