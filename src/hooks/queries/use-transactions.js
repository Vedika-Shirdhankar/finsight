import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { auditLog } from "@/lib/audit-logger";
import { sandboxStore } from "@/lib/sandbox-store";

export function useTransactions(userId, filters = {}) {
    return useQuery({
        queryKey: queryKeys.transactions(userId ?? "", filters),
        queryFn: async () => {
            const isPaginated = filters.page !== undefined && filters.page !== null;
            const pageSize = filters.pageSize || filters.limit || 15;
            const page = Math.max(1, Number(filters.page) || 1);

            try {
                let query = supabase
                    .from("transactions")
                    .select("*", isPaginated ? { count: "exact" } : undefined)
                    .order(filters.sortBy || "transaction_date", { 
                        ascending: filters.sortOrder === "asc" 
                    });

                if (filters.from)
                    query = query.gte("transaction_date", filters.from);
                if (filters.to)
                    query = query.lte("transaction_date", filters.to);
                if (filters.categoryId && filters.categoryId !== "all")
                    query = query.eq("category_id", filters.categoryId);
                if (filters.accountId && filters.accountId !== "all")
                    query = query.eq("account_id", filters.accountId);
                if (filters.type && filters.type !== "all")
                    query = query.eq("type", filters.type);
                if (filters.search)
                    query = query.or(`merchant.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
                if (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount !== "")
                    query = query.gte("amount", Number(filters.minAmount));
                if (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount !== "")
                    query = query.lte("amount", Number(filters.maxAmount));

                if (isPaginated) {
                    const from = (page - 1) * pageSize;
                    const to = from + pageSize - 1;
                    query = query.range(from, to);
                } else if (filters.limit) {
                    query = query.limit(filters.limit);
                }

                const { data, count, error } = await query;
                if (!error && data && data.length > 0) {
                    if (isPaginated) {
                        const totalCount = count ?? (data?.length || 0);
                        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
                        return {
                            items: data || [],
                            totalCount,
                            totalPages,
                            page,
                            pageSize,
                        };
                    }
                    return data || [];
                }
            } catch {
                // fall through to sandboxStore
            }

            return sandboxStore.getTransactions(filters);
        },
        enabled: !!userId,
    });
}

export function usePaginatedTransactions(userId, filters = {}) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 15;
    return useTransactions(userId, { ...filters, page, pageSize });
}

export function useCreateTransaction(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ splits, ...input }) => {
            if (!userId)
                throw new Error("Not signed in");
            let data = null;
            try {
                const res = await supabase
                    .from("transactions")
                    .insert({ ...input, user_id: userId })
                    .select()
                    .single();
                if (!res.error && res.data) {
                    data = res.data;
                    if (splits?.length) {
                        await supabase
                            .from("transaction_splits")
                            .insert(splits.map((split) => ({ ...split, transaction_id: data.id })))
                            .catch(() => {});
                    }
                }
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.addTransaction({ ...input, user_id: userId });
            }

            // Record CREATE Audit Log
            await auditLog({
                userId,
                action: "CREATE",
                resourceType: "transaction",
                resourceId: data.id,
                newData: data,
                metadata: {
                    merchant: data.merchant,
                    amount: data.amount,
                    type: data.type,
                    has_splits: !!splits?.length,
                },
            }).catch(() => {});

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["transaction-splits"] });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useUpdateTransaction(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...input }) => {
            if (!userId)
                throw new Error("Not signed in");

            let data = null;
            try {
                const { data: oldTxn } = await supabase
                    .from("transactions")
                    .select("*")
                    .eq("id", id)
                    .maybeSingle();

                const res = await supabase
                    .from("transactions")
                    .update(input)
                    .eq("id", id)
                    .select()
                    .single();
                if (!res.error && res.data) data = res.data;
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.updateTransaction(id, input);
            }

            // Record UPDATE Audit Log with diff
            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "transaction",
                resourceId: data.id,
                newData: data,
                metadata: {
                    merchant: data.merchant,
                },
            }).catch(() => {});

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useDeleteTransaction(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            if (!userId)
                throw new Error("Not signed in");

            try {
                await supabase.from("transactions").delete().eq("id", id);
            } catch {
                // fallback
            }
            sandboxStore.deleteTransaction(id);

            // Record DELETE Audit Log
            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "transaction",
                resourceId: id,
            }).catch(() => {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

