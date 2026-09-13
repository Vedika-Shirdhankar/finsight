import { a as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-PdxCd9pa.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/keys-C2024mUc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Client-side hook for the current auth session. Use this inside dashboard
* pages/components to get the logged-in user's id for queries.
*
* `loading` is true only until the first session check resolves — after
* that it flips false even if the user is signed out, so guarded routes
* can redirect instead of spinning forever.
*/
function useAuth() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});
		const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
		});
		return () => listener.subscription.unsubscribe();
	}, []);
	const user = session?.user ?? null;
	return {
		session,
		user,
		userId: user?.id ?? null,
		loading
	};
}
var queryKeys = {
	accounts: (userId) => ["accounts", userId],
	accountMembers: (accountId) => ["account-members", accountId],
	transactionSplits: (transactionId) => ["transaction-splits", transactionId],
	transactions: (userId, filters) => [
		"transactions",
		userId,
		filters ?? {}
	],
	categories: (userId) => ["categories", userId],
	budgets: (userId, monthStart) => [
		"budgets",
		userId,
		monthStart ?? "current"
	],
	budgetCategories: (budgetId) => ["budget-categories", budgetId],
	savingsGoals: (userId) => ["savings-goals", userId],
	profile: (userId) => ["profile", userId],
	notifications: (userId) => ["notifications", userId],
	recurringTransactions: (userId) => ["recurring-transactions", userId]
};
//#endregion
export { useAuth as n, queryKeys as t };
