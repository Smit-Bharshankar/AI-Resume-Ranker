import { createClient } from "@supabase/supabase-js";
import env from "./env.js";

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_PUBLISHABLE_DEFAULT_KEY) are required for auth validation",
  );
}

const supabaseAuthClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export default supabaseAuthClient;
