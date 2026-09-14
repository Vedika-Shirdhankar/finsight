import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { auditLog } from "@/lib/audit-logger";

/** Fetches the budget for a given month (defaults to the current month) plus its per-category limits. */
export function useBudget(userId, monthStart) {
    const resolvedMonth = monthStart ?? new Date().toISOString().slice(0, 8) + "01";
    return useQuery({
        queryKey: queryKeys.budgets(userId ?? "", resolvedMonth),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("budgets")
                .select("*, budget_categories(*)")
                .eq("month_start", resolvedMonth)
                .maybeSingle();
            if (error)
                throw error;
            return data;
        },
        enabled: !!userId,
    });
}

export function useCreateBudget(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input) => {
            if (!userId)
                throw new Error("Not signed in");
            const { data, error } = await supabase
                .from("budgets")
                .insert({ ...input, user_id: userId })
                .select()
                .single();
            if (error)
                throw error;

            await auditLog({
                userId,
                action: "CREATE",
                resourceType: "budget",
                resourceId: data.id,
                newData: data,
                metadata: { month_start: data.month_start },
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useUpdateBudget(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...input }) => {
            if (!userId)
                throw new Error("Not signed in");

            const { data: oldBudget } = await supabase
                .from("budgets")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { data, error } = await supabase
                .from("budgets")
                .update(input)
                .eq("id", id)
                .select()
                .single();

            if (error)
                throw error;

            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "budget",
                resourceId: data.id,
                oldData: oldBudget,
                newData: data,
                metadata: { month_start: data.month_start },
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useDeleteBudget(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            if (!userId)
                throw new Error("Not signed in");

            const { data: oldBudget } = await supabase
                .from("budgets")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { error } = await supabase.from("budgets").delete().eq("id", id);
            if (error)
                throw error;

            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "budget",
                resourceId: id,
                oldData: oldBudget,
                metadata: { month_start: oldBudget?.month_start ?? null },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useAddBudgetCategory(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input) => {
            if (!userId)
                throw new Error("Not signed in");

            const { data, error } = await supabase
                .from("budget_categories")
                .insert(input)
                .select()
                .single();

            if (error)
                throw error;

            await auditLog({
                userId,
                action: "CREATE",
                resourceType: "budget_category",
                resourceId: data.id,
                newData: data,
                metadata: { limit_amount: data.limit_amount, category_id: data.category_id },
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useUpdateBudgetCategory(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, limit_amount }) => {
            if (!userId)
                throw new Error("Not signed in");

            const { data: oldCategory } = await supabase
                .from("budget_categories")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { data, error } = await supabase
                .from("budget_categories")
                .update({ limit_amount })
                .eq("id", id)
                .select()
                .single();

            if (error)
                throw error;

            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "budget_category",
                resourceId: data.id,
                oldData: oldCategory,
                newData: data,
                metadata: { limit_amount },
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useDeleteBudgetCategory(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            if (!userId)
                throw new Error("Not signed in");

            const { data: oldCategory } = await supabase
                .from("budget_categories")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { error } = await supabase.from("budget_categories").delete().eq("id", id);
            if (error)
                throw error;

            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "budget_category",
                resourceId: id,
                oldData: oldCategory,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}
