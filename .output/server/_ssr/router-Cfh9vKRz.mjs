import { a as __toESM } from "../_runtime.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-PdxCd9pa.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useQuery, r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { $ as Building2, B as Coins, a as User, et as Bell, h as ShieldAlert, j as Landmark, n as Wallet, v as Save, w as Moon, x as Plus, z as CreditCard } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./keys-C2024mUc.mjs";
import { n as useCreateAccount, t as useAccounts } from "./use-accounts-BXpHOKmP.mjs";
import { n as useProfile, r as useUpdateProfile, t as getNotificationPreferences } from "./use-profile-BkKF9vVe.mjs";
import { n as useInviteMember, t as useAccountMembers } from "./use-account-members-8yCSN_Z-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Cfh9vKRz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BXhV6hAU.css";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		console.error("Root error boundary caught:", error);
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$13 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "FinSight — Financial intelligence" },
			{
				name: "description",
				content: "Turn transactions into financial intelligence with FinSight."
			},
			{
				name: "author",
				content: "FinSight"
			},
			{
				property: "og:title",
				content: "FinSight — Financial intelligence"
			},
			{
				property: "og:description",
				content: "A focused fintech workspace for transaction intelligence, savings, and actionable insights."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$13.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthStateSync, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
	});
}
function AuthStateSync() {
	const router = useRouter();
	const { queryClient } = Route$13.useRouteContext();
	(0, import_react.useEffect)(() => {
		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			router.invalidate();
			if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
		});
		return () => data.subscription.unsubscribe();
	}, [queryClient, router]);
	return null;
}
var $$splitComponentImporter$10 = () => import("./routes-DLN54-li.mjs");
var Route$12 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "FinSight — Turn transactions into financial intelligence" },
		{
			name: "description",
			content: "A focused fintech workspace for understanding spending, savings, and financial activity."
		},
		{
			property: "og:title",
			content: "FinSight — Financial intelligence"
		},
		{
			property: "og:description",
			content: "Turn raw payment data into decisions you can trust."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./admin-Bys_y0Yy.mjs");
var Route$11 = createFileRoute("/admin")({
	head: () => ({ meta: [
		{ title: "Admin control center — FinSight" },
		{
			name: "description",
			content: "Privacy-safe platform analytics and administration for FinSight."
		},
		{
			property: "og:title",
			content: "Admin control center — FinSight"
		},
		{
			property: "og:description",
			content: "Review platform health through aggregate FinSight intelligence."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./auth-Bhhpl3M7.mjs");
var Route$10 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in — FinSight" },
		{
			name: "description",
			content: "Sign in to your FinSight financial intelligence workspace."
		},
		{
			property: "og:title",
			content: "Sign in — FinSight"
		},
		{
			property: "og:description",
			content: "Access your FinSight financial intelligence workspace."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./dashboard-ealJkjyI.mjs");
var Route$9 = createFileRoute("/dashboard")({
	head: () => ({ meta: [
		{ title: "Dashboard — FinSight" },
		{
			name: "description",
			content: "Your FinSight financial intelligence dashboard."
		},
		{
			property: "og:title",
			content: "Dashboard — FinSight"
		},
		{
			property: "og:description",
			content: "See your spending, savings, and financial signals at a glance."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./reset-password-Dgk9vgg5.mjs");
var Route$8 = createFileRoute("/reset-password")({
	head: () => ({ meta: [
		{ title: "Reset password — FinSight" },
		{
			name: "description",
			content: "Set a new password for your FinSight account."
		},
		{
			property: "og:title",
			content: "Reset password — FinSight"
		},
		{
			property: "og:description",
			content: "Set a new password for your FinSight account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./dashboard-Dyn6eDet.mjs");
var Route$7 = createFileRoute("/dashboard/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
function InviteMemberDialog({ accountId, userId, open, onClose }) {
	const invite = useInviteMember(accountId, userId);
	const [email, setEmail] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("viewer");
	if (!open) return null;
	async function submit(event) {
		event.preventDefault();
		await invite.mutateAsync({
			invitedEmail: email,
			role
		});
		setEmail("");
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-bold",
					children: "Invite account member"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-mute",
					children: "Invite someone to this shared account. They will have the selected access level after accepting."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-5 block text-xs text-mute",
					children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						type: "email",
						value: email,
						onChange: (event) => setEmail(event.target.value),
						className: "mt-1 w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm text-ink outline-none focus:border-signal"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-xs text-mute",
					children: ["Role", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: role,
						onChange: (event) => setRole(event.target.value),
						className: "mt-1 w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm text-ink",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "viewer",
								children: "Viewer — view only"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "editor",
								children: "Editor — manage transactions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "owner",
								children: "Owner — full account access"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex justify-end gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-lg border border-line px-4 py-2 text-xs text-mute",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: invite.isPending,
						className: "fs-clip bg-signal px-4 py-2 text-xs font-medium text-signal-foreground disabled:opacity-50",
						children: invite.isPending ? "Inviting…" : "Send invite"
					})]
				})
			]
		})
	});
}
function useMemberContributions(accountId) {
	return useQuery({
		queryKey: ["member-contributions", accountId],
		enabled: !!accountId,
		queryFn: async () => {
			const { data: members, error: memberError } = await supabase.from("account_members").select("*").eq("account_id", accountId);
			if (memberError) throw memberError;
			const { data: transactions, error: transactionError } = await supabase.from("transactions").select("id, amount").eq("account_id", accountId);
			if (transactionError) throw transactionError;
			const ids = transactions.map((transaction) => transaction.id);
			const { data: splits, error: splitError } = ids.length ? await supabase.from("transaction_splits").select("account_member_id, user_id, share_amount").in("transaction_id", ids) : {
				data: [],
				error: null
			};
			if (splitError) throw splitError;
			return members.map((member) => ({
				memberId: member.id,
				userId: member.user_id,
				name: member.invited_email,
				role: member.role,
				totalContributed: (splits ?? []).filter((split) => split.account_member_id === member.id || member.user_id && split.user_id === member.user_id).reduce((sum, split) => sum + Number(split.share_amount), 0)
			}));
		}
	});
}
function MemberContributionList({ accountId, accountTotal }) {
	const { data: members } = useAccountMembers(accountId);
	const { data: contributions, isLoading } = useMemberContributions(accountId);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 text-xs text-mute",
		children: "Loading members…"
	});
	if (!members?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 text-xs text-mute",
		children: "No members invited yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 border-t border-line pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-2 text-[10px] font-mono uppercase tracking-[.14em] text-mute",
			children: "Members & contributions"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: members.map((member) => {
				const total = contributions?.find((item) => item.memberId === member.id)?.totalContributed ?? 0;
				const share = accountTotal > 0 ? total / accountTotal * 100 : 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-ink",
						children: member.invited_email
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 rounded bg-raise px-1.5 py-0.5 font-mono text-[9px] uppercase text-mute",
						children: member.role
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-mute",
						children: [
							"₹",
							total.toLocaleString("en-IN"),
							" · ",
							share.toFixed(1),
							"%"
						]
					})]
				}, member.id);
			})
		})]
	});
}
var Route$6 = createFileRoute("/dashboard/accounts")({ component: AccountsPage });
var accountTypeIcons = {
	savings: Landmark,
	checking: Building2,
	wallet: Wallet,
	credit_card: CreditCard,
	cash: Coins
};
function AccountsPage() {
	const { userId } = useAuth();
	const { data: accounts, isLoading } = useAccounts(userId);
	const createAccount = useCreateAccount(userId);
	const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("savings");
	const [institution, setInstitution] = (0, import_react.useState)("");
	const [balance, setBalance] = (0, import_react.useState)("");
	const [inviteAccountId, setInviteAccountId] = (0, import_react.useState)(null);
	const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
	async function handleCreate(e) {
		e.preventDefault();
		await createAccount.mutateAsync({
			name,
			type,
			institution: institution || null,
			balance: Number(balance) || 0,
			currency: "INR",
			is_simulated: true
		});
		setName("");
		setInstitution("");
		setBalance("");
		setModalOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal",
					children: "Account Management"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold tracking-tight lg:text-4xl",
					children: "Simulated Financial Accounts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mute",
					children: "Manage your digital wallets, checking, savings, and credit balances."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setModalOpen(true),
				className: "fs-clip flex w-full items-center justify-center gap-2 bg-signal px-4 py-2 text-sm font-medium text-signal-foreground hover:brightness-110 sm:w-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add account"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-center gap-3 rounded-xl border border-line bg-panel p-4 text-xs text-mute",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 shrink-0 text-signal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Simulated Workspace:" }), " Accounts listed below are simulated demo profiles for financial modeling. No real bank APIs or payment processors are linked."] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 rounded-xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
					children: "Net Financial Position"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 font-mono text-3xl font-bold text-signal",
					children: ["₹", totalBalance.toLocaleString("en-IN")]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 text-xs text-mute",
					children: [
						"Across ",
						accounts?.length || 0,
						" active accounts"
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: [
				isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-full py-12 text-center text-sm font-mono text-mute",
					children: "Loading accounts…"
				}),
				!isLoading && accounts?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-full py-12 text-center text-sm text-mute border border-dashed border-line rounded-xl p-8",
					children: "No financial accounts created yet. Click \"Add account\" above to create your first simulated wallet or bank profile."
				}),
				accounts?.map((acc) => {
					const Icon = accountTypeIcons[acc.type] || Landmark;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-line bg-panel p-5 transition hover:border-signal/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 place-items-center rounded-lg bg-raise text-signal border border-line",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded bg-raise px-2 py-1 text-[10px] font-mono uppercase text-mute",
									children: acc.type.replace("_", " ")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 font-display font-bold text-lg",
								children: acc.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-mute",
								children: acc.institution || "Personal Wallet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-line pt-3 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-mute font-mono",
									children: "Balance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xl font-bold text-ink",
									children: ["₹", Number(acc.balance).toLocaleString("en-IN")]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-mono uppercase tracking-[.14em] text-mute",
									children: "Shared members"
								}), acc.user_id === userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setInviteAccountId(acc.id),
									className: "text-xs font-medium text-signal hover:underline",
									children: "Invite"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberContributionList, {
								accountId: acc.id,
								accountTotal: Number(acc.balance)
							})
						]
					}, acc.id);
				})
			]
		}),
		modalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-panel p-4 shadow-2xl sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: "Add Simulated Account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-mute",
						children: "Create a new financial bucket to track transactions."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreate,
						className: "mt-5 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-medium text-mute mb-1",
								children: "Account Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. HDFC Main Savings",
								className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-medium text-mute mb-1",
								children: "Account Type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: type,
								onChange: (e) => setType(e.target.value),
								className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "savings",
										children: "Savings Account"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "checking",
										children: "Checking Account"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "wallet",
										children: "Digital Wallet"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "credit_card",
										children: "Credit Card"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "cash",
										children: "Cash"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-medium text-mute mb-1",
								children: "Institution (Optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: institution,
								onChange: (e) => setInstitution(e.target.value),
								placeholder: "e.g. HDFC Bank, PayTM",
								className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-medium text-mute mb-1",
								children: "Initial Balance (₹)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								required: true,
								value: balance,
								onChange: (e) => setBalance(e.target.value),
								placeholder: "50000",
								className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setModalOpen(false),
									className: "w-full rounded-lg border border-line px-4 py-2 text-xs font-medium text-mute hover:text-ink sm:w-auto",
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: createAccount.isPending,
									className: "fs-clip w-full bg-signal px-4 py-2 text-xs font-medium text-signal-foreground hover:brightness-110 disabled:opacity-50 sm:w-auto",
									children: createAccount.isPending ? "Creating…" : "Save Account"
								})]
							})
						]
					})
				]
			})
		}),
		inviteAccountId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteMemberDialog, {
			accountId: inviteAccountId,
			userId,
			open: true,
			onClose: () => setInviteAccountId(null)
		})
	] });
}
var $$splitComponentImporter$4 = () => import("./budgets-BWWEDnSB.mjs");
var Route$5 = createFileRoute("/dashboard/budgets")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./goals-CeBfEGgh.mjs");
var Route$4 = createFileRoute("/dashboard/goals")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./insights-Dhf1bM1V.mjs");
var Route$3 = createFileRoute("/dashboard/insights")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./recurring-BQdkesQF.mjs");
var Route$2 = createFileRoute("/dashboard/recurring")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var Route$1 = createFileRoute("/dashboard/settings")({ component: SettingsPage });
function SettingsPage() {
	const { user, userId } = useAuth();
	const { data: profile } = useProfile(userId);
	const updateProfile = useUpdateProfile(userId);
	const [fullName, setFullName] = (0, import_react.useState)(user?.user_metadata?.["full_name"] || "");
	const [currency, setCurrency] = (0, import_react.useState)("INR");
	const [theme, setTheme] = (0, import_react.useState)("dark");
	const [budgetAlerts, setBudgetAlerts] = (0, import_react.useState)(true);
	const [spendingInsights, setSpendingInsights] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!profile) return;
		setCurrency(profile.currency);
		setTheme(profile.theme);
		const prefs = getNotificationPreferences(profile);
		setBudgetAlerts(prefs.budget_alerts);
		setSpendingInsights(prefs.spending_insights);
		if (profile.full_name) setFullName(profile.full_name);
	}, [profile]);
	async function handleSave(e) {
		e.preventDefault();
		setSaving(true);
		setMessage("");
		const { error: authError } = await supabase.auth.updateUser({ data: { full_name: fullName } });
		let profileError = null;
		try {
			await updateProfile.mutateAsync({
				full_name: fullName,
				currency,
				theme,
				notification_preferences: {
					budget_alerts: budgetAlerts,
					spending_insights: spendingInsights
				}
			});
		} catch (err) {
			profileError = err;
		}
		setSaving(false);
		const error = authError ?? profileError;
		if (error) setMessage(`Error: ${error.message}`);
		else setMessage("Profile settings updated successfully!");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-4xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal",
						children: "Preferences"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-bold tracking-tight lg:text-4xl",
						children: "Account Settings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "Manage your personal profile, notification preferences, and workspace configuration."
					})
				]
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSave,
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-line bg-panel p-4 sm:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 mb-6 border-b border-line pb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-5 text-signal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-bold",
								children: "Profile Identity"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-medium text-mute mb-1",
								children: "Full Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: fullName,
								onChange: (e) => setFullName(e.target.value),
								placeholder: "Aarav Mehta",
								className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-medium text-mute mb-1",
								children: "Email Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								disabled: true,
								value: user?.email || "",
								className: "w-full rounded-lg border border-line bg-raise/50 px-3 py-2 text-sm text-mute cursor-not-allowed"
							})] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-line bg-panel p-4 sm:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 mb-6 border-b border-line pb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-5 text-signal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-bold",
								children: "Workspace Preferences"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-medium text-mute mb-1",
								children: "Base Currency"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: currency,
								onChange: (e) => setCurrency(e.target.value),
								className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "INR",
										children: "INR (₹) - Indian Rupee"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "USD",
										children: "USD ($) - US Dollar"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "EUR",
										children: "EUR (€) - Euro"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "GBP",
										children: "GBP (£) - British Pound"
									})
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-medium text-mute mb-1",
								children: "Theme"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: theme,
								onChange: (e) => setTheme(e.target.value),
								className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "dark",
									children: "Dark Bloomberg Mode (Default)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "light",
									children: "Light Slate Mode"
								})]
							})] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-line bg-panel p-4 sm:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 mb-6 border-b border-line pb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5 text-signal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-bold",
								children: "Alert & Notification Signals"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-start justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: "Budget Limit Thresholds"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-mute",
									children: "Alert when spending breaches 80% of budget cap"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: budgetAlerts,
									onChange: (e) => setBudgetAlerts(e.target.checked),
									className: "size-4 accent-emerald-500"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-start justify-between gap-4 border-t border-line pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: "Weekly Intelligence Summary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-mute",
									children: "Receive automated category concentration & savings insights"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: spendingInsights,
									onChange: (e) => setSpendingInsights(e.target.checked),
									className: "size-4 accent-emerald-500"
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-stretch sm:justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: saving,
							className: "fs-clip flex w-full items-center justify-center gap-2 bg-signal px-6 py-2.5 text-sm font-medium text-signal-foreground hover:brightness-110 disabled:opacity-50 sm:w-auto",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }),
								" ",
								saving ? "Saving…" : "Save Changes"
							]
						})
					})
				]
			})
		]
	});
}
var $$splitComponentImporter = () => import("./transactions-jG0QkCrc.mjs");
var Route = createFileRoute("/dashboard/transactions")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$13
});
var AdminRoute = Route$11.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$13
});
var AuthRoute = Route$10.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$13
});
var DashboardRoute = Route$9.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => Route$13
});
var ResetPasswordRoute = Route$8.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$13
});
var DashboardIndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => DashboardRoute
});
var DashboardRouteChildren = {
	DashboardAccountsRoute: Route$6.update({
		id: "/accounts",
		path: "/accounts",
		getParentRoute: () => DashboardRoute
	}),
	DashboardBudgetsRoute: Route$5.update({
		id: "/budgets",
		path: "/budgets",
		getParentRoute: () => DashboardRoute
	}),
	DashboardGoalsRoute: Route$4.update({
		id: "/goals",
		path: "/goals",
		getParentRoute: () => DashboardRoute
	}),
	DashboardInsightsRoute: Route$3.update({
		id: "/insights",
		path: "/insights",
		getParentRoute: () => DashboardRoute
	}),
	DashboardRecurringRoute: Route$2.update({
		id: "/recurring",
		path: "/recurring",
		getParentRoute: () => DashboardRoute
	}),
	DashboardSettingsRoute: Route$1.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => DashboardRoute
	}),
	DashboardTransactionsRoute: Route.update({
		id: "/transactions",
		path: "/transactions",
		getParentRoute: () => DashboardRoute
	}),
	DashboardIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdminRoute,
	AuthRoute,
	DashboardRoute: DashboardRoute._addFileChildren(DashboardRouteChildren),
	ResetPasswordRoute
};
var routeTree = Route$13._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
