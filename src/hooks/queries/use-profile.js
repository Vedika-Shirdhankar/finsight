import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { sandboxStore } from "@/lib/sandbox-store";

export const DEFAULT_NOTIFICATION_PREFERENCES = {
    budget_alerts: true,
    spending_insights: true,
};

/** Reads the current user's row from `profiles` with sandbox fallback. */
export function useProfile(userId) {
    return useQuery({
        queryKey: queryKeys.profile(userId ?? ""),
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", userId)
                    .maybeSingle();
                if (!error && data) return data;
            } catch {
                // fall through
            }
            return sandboxStore.getProfile();
        },
        enabled: !!userId,
    });
}

/** Pulls the typed notification-preference flags out of the profile's Json column, with safe defaults. */
export function getNotificationPreferences(profile) {
    const raw = (profile?.notification_preferences ?? {});
    return {
        budget_alerts: raw.budget_alerts ?? DEFAULT_NOTIFICATION_PREFERENCES.budget_alerts,
        spending_insights: raw.spending_insights ?? DEFAULT_NOTIFICATION_PREFERENCES.spending_insights,
    };
}

export function useUpdateProfile(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input) => {
            if (!userId)
                throw new Error("Not signed in");
            let data = null;
            try {
                const res = await supabase
                    .from("profiles")
                    .upsert({ ...input, user_id: userId }, { onConflict: "user_id" })
                    .select()
                    .single();
                if (!res.error && res.data) data = res.data;
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.updateProfile(input);
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId ?? "") });
        },
    });
}

