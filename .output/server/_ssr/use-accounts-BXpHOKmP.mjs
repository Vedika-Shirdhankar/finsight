import { t as supabase } from "./client-PdxCd9pa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as queryKeys } from "./keys-C2024mUc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-accounts-BXpHOKmP.js
function useAccounts(userId) {
	return useQuery({
		queryKey: queryKeys.accounts(userId ?? ""),
		queryFn: async () => {
			const { data, error } = await supabase.from("accounts").select("*").order("created_at", { ascending: true });
			if (error) throw error;
			return data;
		},
		enabled: !!userId
	});
}
/** Sum of all account balances for the signed-in user, in their base currency. */
function useTotalBalance(userId) {
	const { data: accounts, ...rest } = useAccounts(userId);
	return {
		total: accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0,
		accounts,
		...rest
	};
}
function useCreateAccount(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			if (!userId) throw new Error("Not signed in");
			const { data, error } = await supabase.from("accounts").insert({
				...input,
				user_id: userId
			}).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.accounts(userId ?? "") });
		}
	});
}
//#endregion
export { useCreateAccount as n, useTotalBalance as r, useAccounts as t };
