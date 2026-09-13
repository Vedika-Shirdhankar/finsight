import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-0syUcLjX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-BkxIkfz9.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Admin analytics are strictly aggregate/anonymised.
* Admins never receive another person's transactions, merchants, notes,
* balances, emails or account numbers — only counts, totals and pseudonyms.
*/
function pseudonym(userId) {
	return `USR-${userId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
async function assertAdmin(context) {
	const { data, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
	if (error) throw new Error("Unable to verify permissions");
	if (!(data ?? []).some((r) => r.role === "admin")) throw new Error("Forbidden: admin access required");
}
var getAdminOverview_createServerFn_handler = createServerRpc({
	id: "98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01",
	name: "getAdminOverview",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminOverview.__executeServer(opts));
var getAdminOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAdminOverview_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-CIJqdA-R.mjs");
	const [profilesRes, rolesRes, txRes, catRes, accRes, budRes, goalRes] = await Promise.all([
		supabaseAdmin.from("profiles").select("user_id, created_at"),
		supabaseAdmin.from("user_roles").select("user_id, role"),
		supabaseAdmin.from("transactions").select("user_id, amount, type, category_id, payment_method, status, transaction_date"),
		supabaseAdmin.from("categories").select("id, name"),
		supabaseAdmin.from("accounts").select("id"),
		supabaseAdmin.from("budgets").select("id"),
		supabaseAdmin.from("savings_goals").select("id")
	]);
	const err = profilesRes.error || rolesRes.error || txRes.error || catRes.error || accRes.error || budRes.error || goalRes.error;
	if (err) throw new Error(err.message);
	const profiles = profilesRes.data ?? [];
	const roles = rolesRes.data ?? [];
	const txs = txRes.data ?? [];
	const catName = new Map((catRes.data ?? []).map((c) => [c.id, c.name]));
	const days30 = Date.now() - 2592e6;
	let income = 0;
	let expenses = 0;
	let volume = 0;
	const perUser = /* @__PURE__ */ new Map();
	const monthly = /* @__PURE__ */ new Map();
	const categories = /* @__PURE__ */ new Map();
	const methods = /* @__PURE__ */ new Map();
	const statuses = /* @__PURE__ */ new Map();
	const active = /* @__PURE__ */ new Set();
	for (let i = 5; i >= 0; i--) {
		const d = /* @__PURE__ */ new Date();
		d.setDate(1);
		d.setMonth(d.getMonth() - i);
		monthly.set(d.toISOString().slice(0, 7), {
			income: 0,
			expenses: 0,
			count: 0
		});
	}
	for (const t of txs) {
		const amount = Number(t.amount) || 0;
		volume += Math.abs(amount);
		if (t.type === "income") income += amount;
		else if (t.type === "expense") expenses += Math.abs(amount);
		const ts = t.transaction_date;
		if (ts && new Date(ts).getTime() >= days30) active.add(t.user_id);
		const u = perUser.get(t.user_id) ?? {
			count: 0,
			last: null
		};
		u.count += 1;
		if (!u.last || ts && ts > u.last) u.last = ts;
		perUser.set(t.user_id, u);
		const key = (ts ?? "").slice(0, 7);
		const bucket = monthly.get(key);
		if (bucket) {
			bucket.count += 1;
			if (t.type === "income") bucket.income += amount;
			else if (t.type === "expense") bucket.expenses += Math.abs(amount);
		}
		if (t.type === "expense") {
			const cname = t.category_id && catName.get(t.category_id) || "Uncategorised";
			const c = categories.get(cname) ?? {
				total: 0,
				count: 0
			};
			c.total += Math.abs(amount);
			c.count += 1;
			categories.set(cname, c);
		}
		const m = methods.get(t.payment_method) ?? {
			count: 0,
			total: 0
		};
		m.count += 1;
		m.total += Math.abs(amount);
		methods.set(t.payment_method, m);
		statuses.set(t.status, (statuses.get(t.status) ?? 0) + 1);
	}
	const roleOf = /* @__PURE__ */ new Map();
	for (const r of roles) {
		const current = roleOf.get(r.user_id);
		if (r.role === "admin" || !current) roleOf.set(r.user_id, r.role);
	}
	return {
		kpis: {
			totalUsers: profiles.length,
			newUsers30d: profiles.filter((p) => new Date(p.created_at).getTime() >= days30).length,
			activeUsers30d: active.size,
			admins: roles.filter((r) => r.role === "admin").length,
			totalTransactions: txs.length,
			volume,
			income,
			expenses,
			avgTransactionValue: txs.length ? volume / txs.length : 0,
			platformSavingsRate: income > 0 ? (income - expenses) / income * 100 : 0,
			accounts: (accRes.data ?? []).length,
			budgets: (budRes.data ?? []).length,
			goals: (goalRes.data ?? []).length
		},
		monthly: [...monthly.entries()].map(([month, v]) => ({
			month,
			...v
		})),
		categories: [...categories.entries()].map(([name, v]) => ({
			name,
			...v
		})).sort((a, b) => b.total - a.total).slice(0, 8),
		methods: [...methods.entries()].map(([name, v]) => ({
			name,
			...v
		})).sort((a, b) => b.count - a.count),
		statuses: [...statuses.entries()].map(([name, count]) => ({
			name,
			count
		})),
		users: profiles.map((p) => ({
			pseudonym: pseudonym(p.user_id),
			role: roleOf.get(p.user_id) ?? "user",
			joined: p.created_at,
			transactions: perUser.get(p.user_id)?.count ?? 0,
			lastActive: perUser.get(p.user_id)?.last ?? null
		})).sort((a, b) => a.joined < b.joined ? 1 : -1)
	};
});
var getMyRole_createServerFn_handler = createServerRpc({
	id: "e2507865c01468809aa67f84f243facd748d53ebf53d1a04baa0f86f26aed510",
	name: "getMyRole",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getMyRole.__executeServer(opts));
var getMyRole = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyRole_createServerFn_handler, async ({ context }) => {
	const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
	const roles = (data ?? []).map((r) => r.role);
	return {
		roles,
		isAdmin: roles.includes("admin")
	};
});
//#endregion
export { getAdminOverview_createServerFn_handler, getMyRole_createServerFn_handler };
