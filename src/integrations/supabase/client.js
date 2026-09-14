import { createClient } from "@supabase/supabase-js";
function createSupabaseClient() {
    const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : (process.env || {});
    const SUPABASE_URL = env["VITE_SUPABASE_URL"] || env["SUPABASE_URL"] || "https://fouqqomzeqiokxbkkeac.supabase.co";
    const SUPABASE_ANON_KEY = env["VITE_SUPABASE_ANON_KEY"] || env["SUPABASE_ANON_KEY"] || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXFxb216ZXFpb2t4YmtrZWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTkwMjksImV4cCI6MjEwNDY3NTAyOX0.HAUv221ZT-IPC7Q3Q3imU2HTuH3fDebuEtqQlfxZpjY";
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        const missing = [
            ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
            ...(!SUPABASE_ANON_KEY ? ["SUPABASE_ANON_KEY"] : []),
        ];
        const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Please set them in your .env file.`;
        console.error(`[Supabase] ${message}`);
        throw new Error(message);
    }
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    });
}
let _supabase;
// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({}, {
    get(_, prop, receiver) {
        if (!_supabase)
            _supabase = createSupabaseClient();
        return Reflect.get(_supabase, prop, receiver);
    },
});
