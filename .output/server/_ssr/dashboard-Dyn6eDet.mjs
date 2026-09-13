import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { V as CircleDollarSign, it as ArrowDownRight, l as TrendingUp, m as ShieldCheck, p as Sparkles, r as WalletCards, tt as ArrowUpRight, x as Plus } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./keys-C2024mUc.mjs";
import { r as useTransactions } from "./use-transactions-Bc0pgBXv.mjs";
import { r as useTotalBalance } from "./use-accounts-BXpHOKmP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-Dyn6eDet.js
var import_jsx_runtime = require_jsx_runtime();
function startOfMonthISO() {
	const d = /* @__PURE__ */ new Date();
	return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function Overview() {
	const { userId } = useAuth();
	const { total: balance, isLoading: balanceLoading } = useTotalBalance(userId);
	const monthStart = startOfMonthISO();
	const { data: monthTxns, isLoading: monthLoading } = useTransactions(userId, { from: monthStart });
	const { data: recentTxns, isLoading: recentLoading } = useTransactions(userId, { limit: 5 });
	const income = monthTxns?.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
	const expenses = monthTxns?.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
	const savings = income - expenses;
	const savingsRate = income > 0 ? (savings / income * 100).toFixed(1) : "0.0";
	const loading = balanceLoading || monthLoading;
	const stats = [
		{
			label: "Total balance",
			value: `₹${balance.toLocaleString("en-IN")}`,
			color: "text-signal",
			Icon: WalletCards
		},
		{
			label: "This month's income",
			value: `₹${income.toLocaleString("en-IN")}`,
			color: "text-info-signal",
			Icon: ArrowUpRight
		},
		{
			label: "This month's expenses",
			value: `₹${expenses.toLocaleString("en-IN")}`,
			color: "text-warning-signal",
			Icon: ArrowDownRight
		},
		{
			label: "Net savings",
			value: `₹${savings.toLocaleString("en-IN")}`,
			color: "text-signal",
			Icon: TrendingUp
		},
		{
			label: "Savings rate",
			value: `${savingsRate}%`,
			color: "text-signal",
			Icon: CircleDollarSign
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal",
					children: "Financial overview"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold tracking-tight lg:text-4xl",
					children: "Your financial command center"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mute",
					children: "Here's what your money is telling you this month."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row sm:gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard/transactions",
					className: "flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-mute hover:border-signal/40 hover:text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add transaction"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard/insights",
					className: "fs-clip flex items-center gap-2 bg-signal px-4 py-2 text-sm font-medium text-signal-foreground hover:brightness-110",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " View insights"]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-5",
			children: stats.map(({ label, value, color, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-line bg-panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: color,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 font-mono text-2xl font-bold tracking-tight",
					children: loading ? "…" : value
				})]
			}, label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 rounded-xl border border-line bg-panel p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-lg font-semibold",
					children: "Recent transactions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-xs text-mute",
					children: "Your latest financial activity"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard/transactions",
					className: "text-xs font-medium text-signal hover:underline",
					children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "ml-1 inline size-3" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 divide-y divide-line",
				children: [
					recentLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-6 text-center text-sm text-mute",
						children: "Loading…"
					}),
					!recentLoading && recentTxns?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-6 text-center text-sm text-mute",
						children: "No transactions yet — add your first one to see it here."
					}),
					recentTxns?.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-raise font-display font-bold text-mute",
								children: (t.merchant ?? "?")[0]?.toUpperCase()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-medium",
									children: t.merchant ?? t.description ?? "Transaction"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-[11px] font-mono text-mute",
									children: new Date(t.transaction_date).toLocaleDateString("en-IN", {
										day: "2-digit",
										month: "short",
										year: "numeric"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `shrink-0 font-mono text-sm font-semibold ${t.type === "income" ? "text-signal" : "text-ink"}`,
								children: [
									t.type === "income" ? "+" : "−",
									"₹",
									Number(t.amount).toLocaleString("en-IN")
								]
							})
						]
					}, t.id))
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 text-[10px] font-mono uppercase tracking-[0.15em] text-mute",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-signal" }), " Protected session"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Data scope: live" })]
		})
	] });
}
//#endregion
export { Overview as component };
