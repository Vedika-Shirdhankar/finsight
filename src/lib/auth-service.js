/**
 * FinSight Resilient Authentication Service
 * 
 * Provides unified authentication managing both live Supabase JWT sessions
 * and instant Sandbox/Demo evaluation sessions with automatic health-checking
 * and cross-tab state synchronization.
 */

import { supabase } from "@/integrations/supabase/client";
import { sandboxStore, DEMO_USER } from "./sandbox-store";

const AUTH_EVENT_NAME = "finsight:auth-change";

/**
 * Dispatches an auth state change event to synchronize components and tabs.
 */
function broadcastAuthChange(session) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { session } }));
    }
}

export const authService = {
    /**
     * Retrieves current active session (Supabase or Sandbox).
     */
    async getSession() {
        // 1. Check for live Supabase session if online
        try {
            const { data, error } = await supabase.auth.getSession();
            if (!error && data?.session) {
                return { session: data.session, user: data.session.user, isDemo: false };
            }
        } catch {
            // Supabase network unreachable, fall through to sandbox
        }

        // 2. Check for active Sandbox / Demo user
        const demoUser = sandboxStore.getUser();
        if (demoUser) {
            const demoSession = {
                access_token: "sandbox-demo-token",
                token_type: "bearer",
                user: demoUser,
                expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
            };
            return { session: demoSession, user: demoUser, isDemo: true };
        }

        return { session: null, user: null, isDemo: false };
    },

    /**
     * Signs in with email and password.
     */
    async signInWithPassword({ email, password }) {
        const cleanEmail = email.trim().toLowerCase();

        // 1. Direct Demo Account shortcut
        if (cleanEmail === "demo@finsight.app" || cleanEmail === "admin@finsight.app" || cleanEmail === "demo@example.com") {
            return this.signInAsDemo({ email: cleanEmail });
        }

        // 2. Attempt live Supabase Authentication
        try {
            const result = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
            });

            if (result.error) {
                // If Supabase returned an explicit error like Invalid Credentials or Unconfirmed Email
                return {
                    success: false,
                    error: result.error.message,
                    isNetworkError: false,
                    needsConfirm: /confirm/i.test(result.error.message),
                };
            }

            // Successfully authenticated on Supabase
            sandboxStore.setUser(null); // Clear local demo session if switching to real account
            broadcastAuthChange(result.data.session);
            return {
                success: true,
                session: result.data.session,
                user: result.data.user,
                isDemo: false,
            };
        } catch (networkErr) {
            // Supabase endpoint is unreachable (e.g. DNS failed / offline)
            return {
                success: false,
                error: networkErr?.message || "Failed to reach authentication server.",
                isNetworkError: true,
            };
        }
    },

    /**
     * Signs up a new account.
     */
    async signUp({ email, password, fullName }) {
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = fullName?.trim() || "FinSight User";

        try {
            const result = await supabase.auth.signUp({
                email: cleanEmail,
                password,
                options: {
                    data: { full_name: cleanName },
                    emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
                },
            });

            if (result.error) {
                return {
                    success: false,
                    error: result.error.message,
                    isNetworkError: false,
                };
            }

            if (!result.data.session) {
                // Email confirmation is required by Supabase configuration
                return {
                    success: true,
                    needsConfirm: true,
                    message: "Account created! Check your email to confirm, or click 'Continue in Demo Workspace' for instant access.",
                };
            }

            broadcastAuthChange(result.data.session);
            return {
                success: true,
                session: result.data.session,
                user: result.data.user,
                isDemo: false,
            };
        } catch (networkErr) {
            return {
                success: false,
                error: networkErr?.message || "Failed to reach authentication server.",
                isNetworkError: true,
            };
        }
    },

    /**
     * Initiates instant Demo / Sandbox login with realistic pre-seeded data.
     */
    signInAsDemo(customUser = {}) {
        const user = {
            ...DEMO_USER,
            ...customUser,
            user_metadata: {
                ...DEMO_USER.user_metadata,
                ...(customUser.user_metadata || {}),
            },
        };

        sandboxStore.setUser(user);
        const demoSession = {
            access_token: "sandbox-demo-token",
            token_type: "bearer",
            user,
            expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
        };

        broadcastAuthChange(demoSession);
        return {
            success: true,
            session: demoSession,
            user,
            isDemo: true,
        };
    },

    /**
     * Signs out from both Supabase and Sandbox demo sessions.
     */
    async signOut() {
        try {
            await supabase.auth.signOut().catch(() => {});
        } catch {
            // ignore
        }
        sandboxStore.setUser(null);
        broadcastAuthChange(null);
    },

    /**
     * Subscribes to auth state changes across Supabase and Sandbox modes.
     */
    onAuthStateChange(callback) {
        // 1. Supabase auth change listener
        let supabaseListener = null;
        try {
            const { data } = supabase.auth.onAuthStateChange((event, session) => {
                if (session) {
                    sandboxStore.setUser(null);
                    callback(event, session);
                } else if (!sandboxStore.getUser()) {
                    callback(event, null);
                }
            });
            supabaseListener = data?.subscription;
        } catch {
            // ignore
        }

        // 2. Custom Window Event Listener for Sandbox and manual triggers
        const handleCustomAuth = (e) => {
            const session = e.detail?.session ?? null;
            callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
        };

        if (typeof window !== "undefined") {
            window.addEventListener(AUTH_EVENT_NAME, handleCustomAuth);
        }

        return () => {
            if (supabaseListener?.unsubscribe) {
                supabaseListener.unsubscribe();
            }
            if (typeof window !== "undefined") {
                window.removeEventListener(AUTH_EVENT_NAME, handleCustomAuth);
            }
        };
    },
};
