import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";

export type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
type SavingsGoalInsert = Database["public"]["Tables"]["savings_goals"]["Insert"];

export function useSavingsGoals(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.savingsGoals(userId ?? ""),
    queryFn: async (): Promise<SavingsGoal[]> => {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateSavingsGoal(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<SavingsGoalInsert, "user_id">) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("savings_goals")
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
    },
  });
}

export function useUpdateSavingsGoal(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<SavingsGoalInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from("savings_goals")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
    },
  });
}

export function useDeleteSavingsGoal(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("savings_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
    },
  });
}

export function useUpdateSavingsGoalProgress(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, current_amount }: { id: string; current_amount: number }) => {
      const { data, error } = await supabase
        .from("savings_goals")
        .update({ current_amount })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
    },
  });
}
