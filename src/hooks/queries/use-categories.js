import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
/**
 * Categories are a mix of system defaults (user_id null) and user-created
 * ones, so this fetches both — RLS on the categories table already scopes
 * this correctly (system rows are visible to everyone, custom rows only to
 * their owner).
 */
export function useCategories(userId) {
    return useQuery({
        queryKey: queryKeys.categories(userId ?? ""),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name", { ascending: true });
            if (error)
                throw error;
            return data;
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
            const { data, error } = await supabase
                .from("categories")
                .insert({ ...input, user_id: userId, is_system: false })
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId ?? "") });
        },
    });
}
