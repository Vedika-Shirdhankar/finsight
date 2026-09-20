import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { auditLog } from "@/lib/audit-logger";

export function useTransactions(userId, filters = {}) {
    return useQuery({
        queryKey: queryKeys.transactions(userId ?? "", filters),
        queryFn: async () => {
            const isPaginated = filters.page !== undefined && filters.page !== null;
            const pageSize = filters.pageSize || filters.limit || 15;
            const page = Math.max(1, Number(filters.page) || 1);

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
            if (error)
                throw error;

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
            const { data, error } = await supabase
                .from("transactions")
                .insert({ ...input, user_id: userId })
                .select()
                .single();
            if (error)
                throw error;
            if (splits?.length) {
                const { error: splitError } = await supabase
                    .from("transaction_splits")
                    .insert(splits.map((split) => ({ ...split, transaction_id: data.id })));
                if (splitError) {
                    await supabase.from("transactions").delete().eq("id", data.id);
                    throw splitError;
                }
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
            });

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

            // Fetch prior snapshot for before/after field diff
            const { data: oldTxn } = await supabase
                .from("transactions")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { data, error } = await supabase
                .from("transactions")
                .update(input)
                .eq("id", id)
                .select()
                .single();

            if (error)
                throw error;

            // Record UPDATE Audit Log with diff
            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "transaction",
                resourceId: data.id,
                oldData: oldTxn,
                newData: data,
                metadata: {
                    merchant: data.merchant,
                },
            });

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

            // Fetch prior snapshot before deletion
            const { data: oldTxn } = await supabase
                .from("transactions")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { error } = await supabase.from("transactions").delete().eq("id", id);
            if (error)
                throw error;

            // Record DELETE Audit Log
            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "transaction",
                resourceId: id,
                oldData: oldTxn,
                metadata: {
                    merchant: oldTxn?.merchant ?? null,
                    amount: oldTxn?.amount ?? null,
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}
