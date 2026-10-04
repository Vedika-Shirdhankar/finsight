import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { sandboxStore } from "@/lib/sandbox-store";

/**
 * Categories are a mix of system defaults (user_id null) and user-created
 * ones, with automatic sandbox store fallback when offline or in demo mode.
 */
export function useCategories(userId) {
    return useQuery({
        queryKey: queryKeys.categories(userId ?? ""),
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from("categories")
                    .select("*")
                    .order("name", { ascending: true });
                if (!error && data && data.length > 0) return data;
            } catch {
                // fall through to sandbox
            }
            return sandboxStore.getCategories();
        },
        enabled: !!userId,
    });
}

export function useCreateCategory(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input) => {
            if (!userId)
                throw new Error("Not signed in");
            try {
                const { data, error } = await supabase
                    .from("categories")
                    .insert({ ...input, user_id: userId, is_system: false })
                    .select()
                    .single();
                if (!error && data) return data;
            } catch {
                // fallback to sandbox
            }
            return sandboxStore.addCategory(input);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId ?? "") });
        },
    });
}

