import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";
import { useNotifications } from "./use-notifications";

export type RecurringTransaction = Database["public"]["Tables"]["recurring_transactions"]["Row"];
type RecurringInsert = Database["public"]["Tables"]["recurring_transactions"]["Insert"];
type Frequency = Database["public"]["Enums"]["recurrence_frequency"];

export function useRecurringTransactions(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.recurringTransactions(userId ?? ""),
    queryFn: async (): Promise<RecurringTransaction[]> => {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .select("*")
        .order("next_due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateRecurringTransaction(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<RecurringInsert, "user_id">) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("recurring_transactions")
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions(userId ?? "") });
    },
  });
}

export function useUpdateRecurringTransaction(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<RecurringInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions(userId ?? "") });
    },
  });
}

export function useDeleteRecurringTransaction(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions(userId ?? "") });
    },
  });
}

function advanceDueDate(date: string, frequency: Frequency): string {
  const d = new Date(date + "T00:00:00");
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().slice(0, 10);
}

function daysUntil(date: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const diffMs = new Date(date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime();
  return Math.round(diffMs / 86_400_000);
}

/**
 * Runs on dashboard load:
 *  - any active recurring item whose next_due_date has arrived gets posted
 *    as a real transaction and rolled forward to its next occurrence.
 *  - any active recurring item due within its `remind_days_before` window
 *    gets a one-time "upcoming bill" notification (deduped by title+message
 *    against existing rows, same pattern as budget/goal alerts).
 */
function useTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useRecurringTransactionSync(userId: string | null) {
  const { data: recurring } = useRecurringTransactions(userId);
  const { data: existingNotifications } = useNotifications(userId);
  const queryClient = useQueryClient();
  const ranFor = useRef<string | null>(null);
  const today = useTodayString();

  useEffect(() => {
    if (!userId || !recurring || !existingNotifications) return;

    const snapshotKey = recurring.map((r) => `${r.id}:${r.next_due_date}`).join("|");
    if (ranFor.current === snapshotKey) return;
    ranFor.current = snapshotKey;

    (async () => {
      let touchedTransactions = false;
      const notificationsToInsert: {
        user_id: string;
        title: string;
        message: string;
        kind: string;
      }[] = [];

      for (const item of recurring) {
        if (!item.is_active) continue;
        const diff = daysUntil(item.next_due_date);

        if (diff <= 0) {
          // Due (or overdue): post it as a real transaction, then roll the schedule forward.
          const { error: insertError } = await supabase.from("transactions").insert({
            user_id: userId,
            account_id: item.account_id,
            category_id: item.category_id,
            amount: item.amount,
            type: item.type,
            merchant: item.merchant,
            payment_method: item.payment_method,
            description: item.description ?? `Recurring: ${item.merchant}`,
            transaction_date: item.next_due_date + "T09:00:00",
            status: "completed",
          });
          if (!insertError) {
            touchedTransactions = true;
            await supabase
              .from("recurring_transactions")
              .update({ next_due_date: advanceDueDate(item.next_due_date, item.frequency) })
              .eq("id", item.id);

            const title = "Recurring transaction posted";
            const message = `${item.merchant} (₹${Number(item.amount).toLocaleString("en-IN")}) was added to your transactions.`;
            if (!existingNotifications.some((n) => n.title === title && n.message === message)) {
              notificationsToInsert.push({ user_id: userId, title, message, kind: "neutral" });
            }
          }
        } else if (diff <= item.remind_days_before) {
          const title = "Upcoming bill";
          const message = `${item.merchant} (₹${Number(item.amount).toLocaleString("en-IN")}) is due on ${new Date(
            item.next_due_date + "T00:00:00",
          ).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}.`;
          if (!existingNotifications.some((n) => n.title === title && n.message === message)) {
            notificationsToInsert.push({ user_id: userId, title, message, kind: "warning" });
          }
        }
      }

      if (notificationsToInsert.length > 0) {
        await supabase.from("notifications").insert(notificationsToInsert);
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
      }
      if (touchedTransactions) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions(userId) });
        queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
      }
    })();
  }, [userId, recurring, existingNotifications, queryClient]);

  const upcoming = (recurring ?? [])
    .filter((r) => r.is_active && daysUntil(r.next_due_date) >= 0)
    .filter((r) => daysUntil(r.next_due_date) <= Math.max(7, r.remind_days_before))
    .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date));

  return { upcoming, today };
}
