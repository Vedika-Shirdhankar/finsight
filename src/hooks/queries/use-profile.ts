import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpsert = Database["public"]["Tables"]["profiles"]["Insert"];

export interface NotificationPreferences {
  budget_alerts: boolean;
  spending_insights: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  budget_alerts: true,
  spending_insights: true,
};

/** Reads the current user's row from `profiles` (one row per user, created on signup). */
export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? ""),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

/** Pulls the typed notification-preference flags out of the profile's Json column, with safe defaults. */
export function getNotificationPreferences(
  profile: Profile | null | undefined,
): NotificationPreferences {
  const raw = (profile?.notification_preferences ?? {}) as Partial<NotificationPreferences>;
  return {
    budget_alerts: raw.budget_alerts ?? DEFAULT_NOTIFICATION_PREFERENCES.budget_alerts,
    spending_insights: raw.spending_insights ?? DEFAULT_NOTIFICATION_PREFERENCES.spending_insights,
  };
}

export function useUpdateProfile(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<ProfileUpsert, "user_id">) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ ...input, user_id: userId }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId ?? "") });
    },
  });
}
