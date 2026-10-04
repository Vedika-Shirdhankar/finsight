import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { auditLog } from "@/lib/audit-logger";
import { sandboxStore } from "@/lib/sandbox-store";

export function useAccounts(userId) {
    return useQuery({
        queryKey: queryKeys.accounts(userId ?? ""),
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from("accounts")
                    .select("*")
                    .order("created_at", { ascending: true });
                if (!error && data && data.length > 0) return data;
            } catch {
                // fall through to sandbox
            }
            return sandboxStore.getAccounts();
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
            let data = null;
            try {
                const res = await supabase
                    .from("accounts")
                    .insert({ ...input, user_id: userId })
                    .select()
                    .single();
                if (!res.error && res.data) data = res.data;
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.addAccount({ ...input, user_id: userId });
            }

            await auditLog({
                userId,
                action: "CREATE",
                resourceType: "account",
                resourceId: data.id,
                newData: data,
                metadata: { name: data.name, type: data.type },
            }).catch(() => {});

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

            let data = null;
            try {
                const { data: oldAccount } = await supabase
                    .from("accounts")
                    .select("*")
                    .eq("id", id)
                    .maybeSingle();

                const res = await supabase
                    .from("accounts")
                    .update(input)
                    .eq("id", id)
                    .select()
                    .single();
                if (!res.error && res.data) data = res.data;
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.updateAccount(id, input);
            }

            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "account",
                resourceId: data.id,
                newData: data,
                metadata: { name: data.name },
            }).catch(() => {});

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

            try {
                await supabase.from("accounts").delete().eq("id", id);
            } catch {
                // fallback
            }
            sandboxStore.deleteAccount(id);

            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "account",
                resourceId: id,
            }).catch(() => {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

