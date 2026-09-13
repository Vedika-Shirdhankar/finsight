import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

/**
 * Categories are a mix of system defaults (user_id null) and user-created
 * ones, so this fetches both — RLS on the categories table already scopes
 * this correctly (system rows are visible to everyone, custom rows only to
 * their owner).
 */
export function useCategories(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.categories(userId ?? ""),
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateCategory(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      kind: "income" | "expense" | "transfer";
      color_token?: string;
    }) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("categories")
        .insert({ ...input, user_id: userId, is_system: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId ?? "") });
    },
  });
}
