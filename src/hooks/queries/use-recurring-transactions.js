import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { useNotifications } from "./use-notifications";
import { auditLog } from "@/lib/audit-logger";
import { sandboxStore } from "@/lib/sandbox-store";

export function useRecurringTransactions(userId) {
    return useQuery({
        queryKey: queryKeys.recurringTransactions(userId ?? ""),
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from("recurring_transactions")
                    .select("*")
                    .order("next_due_date", { ascending: true });
                if (!error && data && data.length > 0) {
                    return data;
                }
            } catch {
                // fall through
            }
            return sandboxStore.getRecurring();
        },
        enabled: !!userId,
    });
}

export function useCreateRecurringTransaction(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input) => {
            if (!userId)
                throw new Error("Not signed in");
            let data = null;
            try {
                const res = await supabase
                    .from("recurring_transactions")
                    .insert({ ...input, user_id: userId })
                    .select()
                    .single();
                if (!res.error && res.data) data = res.data;
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.addRecurring({ ...input, user_id: userId });
            }

            await auditLog({
                userId,
                action: "CREATE",
                resourceType: "recurring_transaction",
                resourceId: data.id,
                newData: data,
                metadata: { merchant: data.merchant, amount: data.amount, frequency: data.frequency },
            }).catch(() => {});

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useUpdateRecurringTransaction(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...input }) => {
            if (!userId)
                throw new Error("Not signed in");

            let data = null;
            try {
                const res = await supabase
                    .from("recurring_transactions")
                    .update(input)
                    .eq("id", id)
                    .select()
                    .single();
                if (!res.error && res.data) data = res.data;
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.updateRecurring(id, input);
            }

            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "recurring_transaction",
                resourceId: data.id,
                newData: data,
                metadata: { merchant: data.merchant },
            }).catch(() => {});

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useDeleteRecurringTransaction(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            if (!userId)
                throw new Error("Not signed in");

            try {
                await supabase.from("recurring_transactions").delete().eq("id", id);
            } catch {
                // fallback
            }
            sandboxStore.deleteRecurring(id);

            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "recurring_transaction",
                resourceId: id,
            }).catch(() => {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.recurringTransactions(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}


function advanceDueDate(date, frequency) {
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

function daysUntil(date) {
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
function useTodayString() {
    return new Date().toISOString().slice(0, 10);
}

export function useRecurringTransactionSync(userId) {
    const { data: recurring } = useRecurringTransactions(userId);
    const { data: existingNotifications } = useNotifications(userId);
    const queryClient = useQueryClient();
    const ranFor = useRef(null);
    const today = useTodayString();
    useEffect(() => {
        if (!userId || !recurring || !existingNotifications)
            return;
        const snapshotKey = recurring.map((r) => `${r.id}:${r.next_due_date}`).join("|");
        if (ranFor.current === snapshotKey)
            return;
        ranFor.current = snapshotKey;
        (async () => {
            let touchedTransactions = false;
            const notificationsToInsert = [];
            for (const item of recurring) {
                if (!item.is_active)
                    continue;
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
                }
                else if (diff <= item.remind_days_before) {
                    const title = "Upcoming bill";
                    const message = `${item.merchant} (₹${Number(item.amount).toLocaleString("en-IN")}) is due on ${new Date(item.next_due_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}.`;
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
                queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
            }
        })();
    }, [userId, recurring, existingNotifications, queryClient]);
    const upcoming = (recurring ?? [])
        .filter((r) => r.is_active && daysUntil(r.next_due_date) >= 0)
        .filter((r) => daysUntil(r.next_due_date) <= Math.max(7, r.remind_days_before))
        .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date));
    return { upcoming, today };
}
