import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side hook for the current auth session. Use this inside dashboard
 * pages/components to get the logged-in user's id for queries.
 *
 * `loading` is true only until the first session check resolves — after
 * that it flips false even if the user is signed out, so guarded routes
 * can redirect instead of spinning forever.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const user: User | null = session?.user ?? null;

  return { session, user, userId: user?.id ?? null, loading };
}
