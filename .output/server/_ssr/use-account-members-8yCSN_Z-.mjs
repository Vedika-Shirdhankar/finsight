import { t as supabase } from "./client-PdxCd9pa.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as queryKeys } from "./keys-C2024mUc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-account-members-8yCSN_Z-.js
function useAccountMembers(accountId) {
	return useQuery({
		queryKey: queryKeys.accountMembers(accountId ?? ""),
		enabled: !!accountId,
		queryFn: async () => {
			const { data, error } = await supabase.from("account_members").select("*").eq("account_id", accountId).order("created_at");
			if (error) throw error;
			return data;
		}
	});
}
function useInviteMember(accountId, invitedByUserId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ invitedEmail, role }) => {
			if (!invitedByUserId) throw new Error("Not signed in");
			const { data, error } = await supabase.from("account_members").insert({
				account_id: accountId,
				invited_by: invitedByUserId,
				invited_email: invitedEmail.trim().toLowerCase(),
				role,
				status: "pending"
			}).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accountMembers(accountId) })
	});
}
//#endregion
export { useInviteMember as n, useAccountMembers as t };
