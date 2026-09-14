import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { auditLog } from "@/lib/audit-logger";

export function useAccounts(userId) {
    return useQuery({
        queryKey: queryKeys.accounts(userId ?? ""),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("accounts")
                .select("*")
                .order("created_at", { ascending: true });
            if (error)
                throw error;
            return data;
        },
        enabled: !!userId,
    });
}

/** Sum of all account balances for the signed-in user, in their base currency. */
export function useTotalBalance(userId) {
    const { data: accounts, ...rest } = useAccounts(userId);
    const total = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
    return { total, accounts, ...rest };
}

export function useCreateAccount(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input) => {
            if (!userId)
                throw new Error("Not signed in");
            const { data, error } = await supabase
                .from("accounts")
                .insert({ ...input, user_id: userId })
                .select()
                .single();
            if (error)
                throw error;

            await auditLog({
                userId,
                action: "CREATE",
                resourceType: "account",
                resourceId: data.id,
                newData: data,
                metadata: { name: data.name, type: data.type },
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useUpdateAccount(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...input }) => {
            if (!userId)
                throw new Error("Not signed in");

            const { data: oldAccount } = await supabase
                .from("accounts")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { data, error } = await supabase
                .from("accounts")
                .update(input)
                .eq("id", id)
                .select()
                .single();

            if (error)
                throw error;

            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "account",
                resourceId: data.id,
                oldData: oldAccount,
                newData: data,
                metadata: { name: data.name },
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useDeleteAccount(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            if (!userId)
                throw new Error("Not signed in");

            const { data: oldAccount } = await supabase
                .from("accounts")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { error } = await supabase.from("accounts").delete().eq("id", id);
            if (error)
                throw error;

            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "account",
                resourceId: id,
                oldData: oldAccount,
                metadata: { name: oldAccount?.name ?? null },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}
