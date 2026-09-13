import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";

export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type BudgetCategory = Database["public"]["Tables"]["budget_categories"]["Row"];
type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];

/** Fetches the budget for a given month (defaults to the current month) plus its per-category limits. */
export function useBudget(userId: string | null, monthStart?: string) {
  const resolvedMonth = monthStart ?? new Date().toISOString().slice(0, 8) + "01";

  return useQuery({
    queryKey: queryKeys.budgets(userId ?? "", resolvedMonth),
    queryFn: async (): Promise<(Budget & { budget_categories: BudgetCategory[] }) | null> => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*, budget_categories(*)")
        .eq("month_start", resolvedMonth)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateBudget(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<BudgetInsert, "user_id">) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("budgets")
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
    },
  });
}

export function useUpdateBudget(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<BudgetInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from("budgets")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
    },
  });
}

export function useDeleteBudget(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
    },
  });
}

export function useAddBudgetCategory(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { budget_id: string; category_id: string; limit_amount: number }) => {
      const { data, error } = await supabase
        .from("budget_categories")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
    },
  });
}

export function useUpdateBudgetCategory(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, limit_amount }: { id: string; limit_amount: number }) => {
      const { data, error } = await supabase
        .from("budget_categories")
        .update({ limit_amount })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
    },
  });
}

export function useDeleteBudgetCategory(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budget_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
    },
  });
}
