import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";

type TransactionSplit = Database["public"]["Tables"]["transaction_splits"]["Row"];

export function useTransactionSplits(transactionId: string | null) {
  return useQuery({
    queryKey: queryKeys.transactionSplits(transactionId ?? ""),
    enabled: !!transactionId,
    queryFn: async (): Promise<TransactionSplit[]> => {
      const { data, error } = await supabase
        .from("transaction_splits")
        .select("*")
        .eq("transaction_id", transactionId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSplits(transactionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      splits: Omit<
        Database["public"]["Tables"]["transaction_splits"]["Insert"],
        "transaction_id"
      >[],
    ) => {
      const { data, error } = await supabase
        .from("transaction_splits")
        .insert(splits.map((split) => ({ ...split, transaction_id: transactionId })))
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionSplits(transactionId) });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useMemberContributions(accountId: string | null) {
  return useQuery({
    queryKey: ["member-contributions", accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const { data: members, error: memberError } = await supabase
        .from("account_members")
        .select("*")
        .eq("account_id", accountId!);
      if (memberError) throw memberError;
      const { data: transactions, error: transactionError } = await supabase
        .from("transactions")
        .select("id, amount")
        .eq("account_id", accountId!);
      if (transactionError) throw transactionError;
      const ids = transactions.map((transaction) => transaction.id);
      const { data: splits, error: splitError } = ids.length
        ? await supabase
            .from("transaction_splits")
            .select("account_member_id, user_id, share_amount")
            .in("transaction_id", ids)
        : { data: [], error: null };
      if (splitError) throw splitError;
      return members.map((member) => ({
        memberId: member.id,
        userId: member.user_id,
        name: member.invited_email,
        role: member.role,
        totalContributed: (splits ?? [])
          .filter(
            (split) =>
              split.account_member_id === member.id ||
              (member.user_id && split.user_id === member.user_id),
          )
          .reduce((sum, split) => sum + Number(split.share_amount), 0),
      }));
    },
  });
}
