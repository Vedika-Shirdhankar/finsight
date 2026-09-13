import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionSplitInput = Omit<
  Database["public"]["Tables"]["transaction_splits"]["Insert"],
  "transaction_id"
>;

export interface TransactionFilters {
  /** Inclusive ISO date, e.g. "2026-06-01" */
  from?: string;
  /** Inclusive ISO date, e.g. "2026-06-30" */
  to?: string;
  categoryId?: string;
  accountId?: string;
  type?: Database["public"]["Enums"]["transaction_type"];
  search?: string;
  limit?: number;
}

export function useTransactions(userId: string | null, filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: queryKeys.transactions(userId ?? "", filters as Record<string, unknown>),
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (filters.from) query = query.gte("transaction_date", filters.from);
      if (filters.to) query = query.lte("transaction_date", filters.to);
      if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
      if (filters.accountId) query = query.eq("account_id", filters.accountId);
      if (filters.type) query = query.eq("type", filters.type);
      if (filters.search) query = query.ilike("merchant", `%${filters.search}%`);
      if (filters.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateTransaction(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      splits,
      ...input
    }: Omit<TransactionInsert, "user_id"> & { splits?: TransactionSplitInput[] }) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      if (splits?.length) {
        const { error: splitError } = await supabase
          .from("transaction_splits")
          .insert(splits.map((split) => ({ ...split, transaction_id: data.id })));
        if (splitError) {
          await supabase.from("transactions").delete().eq("id", data.id);
          throw splitError;
        }
      }
      return data;
    },
    onSuccess: () => {
      // Broad invalidate: any filtered transactions list + accounts (balance
      // may change via a DB trigger) should refresh.
      queryClient.invalidateQueries({ queryKey: ["transactions", userId ?? ""] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["transaction-splits"] });
    },
  });
}

type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

export function useUpdateTransaction(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: TransactionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", userId ?? ""] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
    },
  });
}

export function useDeleteTransaction(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", userId ?? ""] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
    },
  });
}
