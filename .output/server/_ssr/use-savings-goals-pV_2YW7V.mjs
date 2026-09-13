import { t as supabase } from "./client-PdxCd9pa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as queryKeys } from "./keys-C2024mUc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-savings-goals-pV_2YW7V.js
function useSavingsGoals(userId) {
	return useQuery({
		queryKey: queryKeys.savingsGoals(userId ?? ""),
		queryFn: async () => {
			const { data, error } = await supabase.from("savings_goals").select("*").order("created_at", { ascending: true });
			if (error) throw error;
			return data;
		},
		enabled: !!userId
	});
}
function useCreateSavingsGoal(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			if (!userId) throw new Error("Not signed in");
			const { data, error } = await supabase.from("savings_goals").insert({
				...input,
				user_id: userId
			}).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
		}
	});
}
function useUpdateSavingsGoal(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...input }) => {
			const { data, error } = await supabase.from("savings_goals").update(input).eq("id", id).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
		}
	});
}
function useDeleteSavingsGoal(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("savings_goals").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
		}
	});
}
function useUpdateSavingsGoalProgress(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, current_amount }) => {
			const { data, error } = await supabase.from("savings_goals").update({ current_amount }).eq("id", id).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals(userId ?? "") });
		}
	});
}
//#endregion
export { useUpdateSavingsGoalProgress as a, useUpdateSavingsGoal as i, useDeleteSavingsGoal as n, useSavingsGoals as r, useCreateSavingsGoal as t };
