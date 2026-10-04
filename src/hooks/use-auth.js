import { useEffect, useState } from "react";
import { authService } from "@/lib/auth-service";

/**
 * Client-side hook for the current auth session.
 * Supports both live Supabase JWT sessions and Instant Sandbox Demo sessions.
 */
export function useAuth() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        let mounted = true;

        authService.getSession().then(({ session, isDemo: demoStatus }) => {
            if (mounted) {
                setSession(session);
                setIsDemo(demoStatus);
                setLoading(false);
            }
        });

        const unsubscribe = authService.onAuthStateChange((_event, newSession) => {
            if (mounted) {
                setSession(newSession);
                setIsDemo(newSession?.access_token === "sandbox-demo-token");
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    const user = session?.user ?? null;
    return {
        session,
        user,
        userId: user?.id ?? null,
        isDemo,
        loading,
        signOut: authService.signOut,
    };
}
