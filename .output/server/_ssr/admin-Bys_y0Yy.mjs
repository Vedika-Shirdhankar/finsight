import { a as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-txUMSKgw.mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-0syUcLjX.mjs";
import { t as supabase } from "./client-PdxCd9pa.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as LayoutDashboard, D as LogOut, H as CircleCheck, N as FileText, R as Database, T as Menu, V as CircleDollarSign, Y as ChartColumn, at as Activity, i as Users, m as ShieldCheck, r as WalletCards, rt as ArrowLeft, t as X } from "../_libs/lucide-react.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, r as BarChart, s as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Bys_y0Yy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
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
var getAdminOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("e2507865c01468809aa67f84f243facd748d53ebf53d1a04baa0f86f26aed510"));
var money = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 0
});
var shortDate = new Intl.DateTimeFormat("en-IN", {
	day: "2-digit",
	month: "short",
	year: "numeric"
});
var chartColors = [
	"var(--signal)",
	"var(--info-signal)",
	"var(--warning-signal)",
	"var(--danger-signal)",
	"var(--mute)"
];
function formatMoney(value) {
	return money.format(value).replace("₹", "₹");
}
function AdminPage() {
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("overview");
	const adminQuery = useQuery({
		queryKey: ["admin-overview"],
		queryFn: () => getAdminOverview(),
		staleTime: 6e4
	});
	async function signOut() {
		await supabase.auth.signOut();
		await navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-page text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: `fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-panel transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-16 items-center justify-between border-b border-line px-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/dashboard",
						className: "flex items-center gap-3 font-display text-lg font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "fs-clip grid size-8 place-items-center bg-signal text-sm text-signal-foreground",
							children: "F"
						}), "FinSight"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMenuOpen(false),
						className: "text-mute lg:hidden",
						"aria-label": "Close navigation",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 rounded-lg border border-signal/30 bg-signal/10 px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-signal",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), " Admin scope"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 text-sm font-medium",
									children: "Platform operations"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-[10px] leading-relaxed text-mute",
									children: "Aggregate data only. Private financial details stay hidden."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-mute",
							children: "Control center"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "space-y-1",
							children: [
								[
									"overview",
									"Overview",
									LayoutDashboard
								],
								[
									"users",
									"Users",
									Users
								],
								[
									"transactions",
									"Transactions",
									FileText
								]
							].map(([value, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									setTab(value);
									setMenuOpen(false);
								},
								className: `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${tab === value ? "bg-signal/10 font-medium text-signal" : "text-mute hover:bg-raise hover:text-ink"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-[17px]" }), label]
							}, value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 border-t border-line pt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/dashboard",
								className: "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mute transition hover:bg-raise hover:text-ink",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-[17px]" }), " Personal workspace"]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-0 left-0 right-0 border-t border-line p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: signOut,
						className: "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-mute transition hover:bg-raise hover:text-danger-signal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:pl-64",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-page/85 px-5 backdrop-blur lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMenuOpen(true),
						className: "text-mute lg:hidden",
						"aria-label": "Open navigation",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-mono uppercase tracking-[0.2em] text-signal",
						children: "FinSight / restricted"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-sm font-semibold",
						children: "Admin control center"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-signal",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), " Role verified"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-[1600px] p-5 lg:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal",
								children: "Platform intelligence / aggregate view"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-bold tracking-tight lg:text-4xl",
								children: "Keep the platform in signal."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-2xl text-sm text-mute",
								children: "Monitor adoption, financial activity, and system health without exposing private user transactions."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-mute",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-signal" }), " Live access scope"]
						})]
					}),
					adminQuery.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {}),
					adminQuery.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { message: adminQuery.error instanceof Error ? adminQuery.error.message : "This admin view could not load." }),
					adminQuery.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminContent, {
						data: adminQuery.data,
						tab
					})
				]
			})]
		})]
	});
}
function LoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-xl border border-line bg-panel" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-xl border border-line bg-panel" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-xl border border-line bg-panel" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-xl border border-line bg-panel" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-96 animate-pulse rounded-xl border border-line bg-panel sm:col-span-2 xl:col-span-4" })
		]
	});
}
function ErrorState({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-danger-signal/30 bg-danger-signal/10 p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 text-danger-signal",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: "Admin access unavailable"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-mute",
			children: message.includes("Forbidden") ? "Your signed-in account does not have the admin role." : "We couldn't retrieve platform analytics right now."
		})]
	});
}
function AdminContent({ data, tab }) {
	if (tab === "users") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersPanel, { users: data.users });
	if (tab === "transactions") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionsPanel, { data });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverviewPanel, { data });
}
function OverviewPanel({ data }) {
	const k = data.kpis;
	const kpis = [
		[
			"Total users",
			k.totalUsers.toLocaleString("en-IN"),
			`${k.newUsers30d} joined in 30d`,
			Users,
			"text-signal"
		],
		[
			"Active users",
			k.activeUsers30d.toLocaleString("en-IN"),
			"transaction activity / 30d",
			Activity,
			"text-info-signal"
		],
		[
			"Transaction volume",
			formatMoney(k.volume),
			`${k.totalTransactions.toLocaleString("en-IN")} records`,
			CircleDollarSign,
			"text-warning-signal"
		],
		[
			"Platform savings",
			`${k.platformSavingsRate.toFixed(1)}%`,
			`${k.accounts} accounts tracked`,
			WalletCards,
			"text-signal"
		]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: kpis.map(([label, value, note, Icon, color]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-line bg-panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-4 ${color}` })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 font-mono text-2xl font-bold tracking-tight",
						children: value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-xs text-mute",
						children: note
					})
				]
			}, label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-5 xl:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-line bg-panel p-5 xl:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					icon: ChartColumn,
					title: "Platform flow",
					copy: "Aggregate income, expenses, and transaction count over six months."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 h-72",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: data.monthly,
							barGap: 4,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--line)",
									vertical: false,
									strokeDasharray: "3 3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "month",
									tick: {
										fill: "var(--mute)",
										fontSize: 10
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fill: "var(--mute)",
										fontSize: 10
									},
									tickLine: false,
									axisLine: false,
									tickFormatter: (value) => `₹${Math.round(value / 1e3)}k`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, {}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "income",
									fill: "var(--signal)",
									radius: [
										3,
										3,
										0,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "expenses",
									fill: "var(--warning-signal)",
									radius: [
										3,
										3,
										0,
										0
									]
								})
							]
						})
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-line bg-panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					icon: Database,
					title: "Platform footprint",
					copy: "Current product adoption across the workspace."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-5",
					children: [
						[
							"Transactions",
							k.totalTransactions,
							FileText
						],
						[
							"Accounts",
							k.accounts,
							WalletCards
						],
						[
							"Budgets",
							k.budgets,
							ChartColumn
						],
						[
							"Savings goals",
							k.goals,
							CircleDollarSign
						]
					].map(([label, value, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-9 place-items-center rounded-lg bg-raise text-signal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 h-1.5 rounded-full bg-raise",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-signal",
										style: { width: `${Math.min(100, Number(value) / Math.max(1, k.totalUsers) * 12)}%` }
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-sm",
								children: Number(value).toLocaleString("en-IN")
							})
						]
					}, label))
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-5 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-line bg-panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					icon: ChartColumn,
					title: "Expense concentration",
					copy: "Top categories across all users, shown as totals only."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 space-y-4",
					children: data.categories.slice(0, 6).map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1.5 flex justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-mute",
							children: formatMoney(item.total)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 rounded-full bg-raise",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full",
							style: {
								width: `${Math.max(3, item.total / Math.max(1, data.categories[0]?.total ?? 1) * 100)}%`,
								backgroundColor: chartColors[index % chartColors.length]
							}
						})
					})] }, item.name))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-line bg-panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					icon: CircleCheck,
					title: "Data quality signals",
					copy: "Operational checks for the current dataset."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid gap-3 sm:grid-cols-2",
					children: [
						[
							"Role coverage",
							`${k.admins} admin${k.admins === 1 ? "" : "s"}`,
							"verified"
						],
						[
							"Completion",
							`${data.statuses.find((s) => s.name === "completed")?.count ?? 0} completed`,
							"transactions"
						],
						[
							"Average value",
							formatMoney(k.avgTransactionValue),
							"per transaction"
						],
						[
							"Privacy mode",
							"Aggregate only",
							"enabled"
						]
					].map(([label, value, note]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-line bg-raise p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono uppercase tracking-[0.12em] text-mute",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 font-mono text-lg font-semibold",
								children: value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[11px] text-signal",
								children: note
							})
						]
					}, label))
				})]
			})]
		})
	] });
}
function UsersPanel({ users }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-line bg-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-line p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: Users,
				title: "User directory",
				copy: "Pseudonymous operational view. Email addresses and private profile fields are never returned."
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[680px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-line text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-4",
							children: "User"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-4",
							children: "Role"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-4",
							children: "Joined"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-4",
							children: "Transactions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-4",
							children: "Last activity"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: users.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-line/70 last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-4 font-mono text-xs",
							children: user.pseudonym
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-1 text-[10px] font-mono uppercase ${user.role === "admin" ? "bg-signal/10 text-signal" : "bg-raise text-mute"}`,
								children: user.role
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-4 text-xs text-mute",
							children: shortDate.format(new Date(user.joined))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-4 font-mono text-xs",
							children: user.transactions.toLocaleString("en-IN")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-4 text-xs text-mute",
							children: user.lastActive ? shortDate.format(new Date(user.lastActive)) : "No activity"
						})
					]
				}, user.pseudonym)) })]
			}), users.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { copy: "No users are available yet." })]
		})]
	});
}
function TransactionsPanel({ data }) {
	const methods = (0, import_react.useMemo)(() => data.methods, [data.methods]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 xl:grid-cols-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-xl border border-line bg-panel p-5 xl:col-span-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					icon: FileText,
					title: "Transaction operations",
					copy: "System-wide counts and payment-method volume. Individual records remain private."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid gap-3 sm:grid-cols-2",
					children: data.statuses.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-line bg-raise p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
								children: status.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 font-mono text-2xl font-bold",
								children: status.count.toLocaleString("en-IN")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-mute",
								children: "transactions"
							})
						]
					}, status.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: methods,
							layout: "vertical",
							margin: {
								left: 16,
								right: 12
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--line)",
									horizontal: false,
									strokeDasharray: "3 3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									tick: {
										fill: "var(--mute)",
										fontSize: 10
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									dataKey: "name",
									type: "category",
									width: 80,
									tick: {
										fill: "var(--mute)",
										fontSize: 10
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, {}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "count",
									fill: "var(--info-signal)",
									radius: [
										0,
										3,
										3,
										0
									]
								})
							]
						})
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-xl border border-line bg-panel p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: CircleDollarSign,
				title: "Payment mix",
				copy: "Count and aggregate volume by method."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 space-y-4",
				children: methods.map((method, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-2 rounded-full",
							style: { backgroundColor: chartColors[index % chartColors.length] }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-sm",
								children: method.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-mute",
								children: formatMoney(method.total)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-xs text-mute",
							children: method.count
						})
					]
				}, method.name))
			})]
		})]
	});
}
function SectionHeader({ icon: Icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid size-9 shrink-0 place-items-center rounded-lg bg-signal/10 text-signal",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-lg font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-mute",
			children: copy
		})] })]
	});
}
function ChartTooltip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-line bg-panel px-3 py-2 text-xs shadow-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 font-mono text-mute",
			children: label
		}), payload.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono",
				children: typeof item.value === "number" ? formatMoney(item.value) : item.value
			})]
		}, item.name))]
	});
}
function EmptyState({ copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-10 text-center text-sm text-mute",
		children: copy
	});
}
//#endregion
export { AdminPage as component };
