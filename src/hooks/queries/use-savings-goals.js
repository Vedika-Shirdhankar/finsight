import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { auditLog } from "@/lib/audit-logger";

export function useSavingsGoals(userId) {
    return useQuery({
        queryKey: queryKeys.savingsGoals(userId ?? ""),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("savings_goals")
                .select("*")
                .order("created_at", { ascending: true });
            if (error)
                throw error;
            return data;
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
            const { data, error } = await supabase
                .from("savings_goals")
                .insert({ ...input, user_id: userId })
                .select()
                .single();
            if (error)
                throw error;

            await auditLog({
                userId,
                action: "CREATE",
                resourceType: "savings_goal",
                resourceId: data.id,
                newData: data,
                metadata: { name: data.name, target_amount: data.target_amount },
            });

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

            const { data: oldGoal } = await supabase
                .from("savings_goals")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { data, error } = await supabase
                .from("savings_goals")
                .update(input)
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
                metadata: { name: data.name },
            });

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

            const { data: oldGoal } = await supabase
                .from("savings_goals")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { error } = await supabase.from("savings_goals").delete().eq("id", id);
            if (error)
                throw error;

            await auditLog({
                userId,
                action: "DELETE",
                resourceType: "savings_goal",
                resourceId: id,
                oldData: oldGoal,
                metadata: { name: oldGoal?.name ?? null },
            });
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
