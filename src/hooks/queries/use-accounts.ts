import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";

export type Account = Database["public"]["Tables"]["accounts"]["Row"];
type AccountInsert = Database["public"]["Tables"]["accounts"]["Insert"];

export function useAccounts(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.accounts(userId ?? ""),
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

/** Sum of all account balances for the signed-in user, in their base currency. */
export function useTotalBalance(userId: string | null) {
  const { data: accounts, ...rest } = useAccounts(userId);
  const total = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
  return { total, accounts, ...rest };
}

export function useCreateAccount(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<AccountInsert, "user_id">) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("accounts")
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
    },
  });
}
