import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { auditLog } from "@/lib/audit-logger";
import { sandboxStore } from "@/lib/sandbox-store";

export function useSavingsGoals(userId) {
    return useQuery({
        queryKey: queryKeys.savingsGoals(userId ?? ""),
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from("savings_goals")
                    .select("*")
                    .order("created_at", { ascending: true });
                if (!error && data && data.length > 0) return data;
            } catch {
                // fall through to sandbox
            }
            return sandboxStore.getGoals();
        },
        enabled: !!userId,
    });
}

export function useCreateSavingsGoal(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input) => {
            if (!userId)
                throw new Error("Not signed in");
            let data = null;
            try {
                const res = await supabase
                    .from("savings_goals")
                    .insert({ ...input, user_id: userId })
                    .select()
                    .single();
                if (!res.error && res.data) data = res.data;
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.addGoal({ ...input, user_id: userId });
            }

            await auditLog({
                userId,
                action: "CREATE",
                resourceType: "savings_goal",
                resourceId: data.id,
                newData: data,
                metadata: { name: data.name, target_amount: data.target_amount },
            }).catch(() => {});

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useUpdateSavingsGoal(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...input }) => {
            if (!userId)
                throw new Error("Not signed in");

            let data = null;
            try {
                const res = await supabase
                    .from("savings_goals")
                    .update(input)
                    .eq("id", id)
                    .select()
                    .single();
                if (!res.error && res.data) data = res.data;
            } catch {
                // fallback
            }

            if (!data) {
                data = sandboxStore.updateGoal(id, input);
            }

            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "savings_goal",
                resourceId: data.id,
                newData: data,
                metadata: { name: data.name },
            }).catch(() => {});

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useDeleteSavingsGoal(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            if (!userId)
                throw new Error("Not signed in");

            try {
                await supabase.from("savings_goals").delete().eq("id", id);
            } catch {
                // fallback
            }
            sandboxStore.deleteGoal(id);

            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "savings_goal",
                resourceId: id,
            }).catch(() => {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}


export function useUpdateSavingsGoalProgress(userId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, current_amount }) => {
            if (!userId)
                throw new Error("Not signed in");

            const { data: oldGoal } = await supabase
                .from("savings_goals")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { data, error } = await supabase
                .from("savings_goals")
                .update({ current_amount })
                .eq("id", id)
                .select()
                .single();

            if (error)
                throw error;

            await auditLog({
                userId,
                action: "UPDATE",
                resourceType: "savings_goal",
                resourceId: data.id,
                oldData: oldGoal,
                newData: data,
                metadata: { name: data.name, current_amount },
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}
