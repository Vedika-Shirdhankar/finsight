import { t as supabase } from "./client-PdxCd9pa.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as queryKeys } from "./keys-C2024mUc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-categories-BSfFvBVL.js
/**
* Categories are a mix of system defaults (user_id null) and user-created
* ones, so this fetches both — RLS on the categories table already scopes
* this correctly (system rows are visible to everyone, custom rows only to
* their owner).
*/
function useCategories(userId) {
	return useQuery({
		queryKey: queryKeys.categories(userId ?? ""),
		queryFn: async () => {
			const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
			if (error) throw error;
			return data;
		},
		enabled: !!userId
	});
}
//#endregion
export { useCategories as t };
