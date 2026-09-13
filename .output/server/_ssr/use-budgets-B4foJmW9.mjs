import { t as supabase } from "./client-PdxCd9pa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as queryKeys } from "./keys-C2024mUc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-budgets-B4foJmW9.js
/** Fetches the budget for a given month (defaults to the current month) plus its per-category limits. */
function useBudget(userId, monthStart) {
	const resolvedMonth = monthStart ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 8) + "01";
	return useQuery({
		queryKey: queryKeys.budgets(userId ?? "", resolvedMonth),
		queryFn: async () => {
			const { data, error } = await supabase.from("budgets").select("*, budget_categories(*)").eq("month_start", resolvedMonth).maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled: !!userId
	});
}
function useCreateBudget(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			if (!userId) throw new Error("Not signed in");
			const { data, error } = await supabase.from("budgets").insert({
				...input,
				user_id: userId
			}).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
		}
	});
}
function useAddBudgetCategory(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const { data, error } = await supabase.from("budget_categories").insert(input).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
		}
	});
}
function useUpdateBudgetCategory(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, limit_amount }) => {
			const { data, error } = await supabase.from("budget_categories").update({ limit_amount }).eq("id", id).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
		}
	});
}
function useDeleteBudgetCategory(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("budget_categories").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["budgets", userId ?? ""] });
		}
	});
}
//#endregion
export { useUpdateBudgetCategory as a, useDeleteBudgetCategory as i, useBudget as n, useCreateBudget as r, useAddBudgetCategory as t };
